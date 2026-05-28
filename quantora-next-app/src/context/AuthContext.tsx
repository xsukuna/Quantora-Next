'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useUser, useClerk } from '@clerk/nextjs'

const isClerkEnabled = false;

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

// Dynamic Clerk Sync Helper Component to avoid hook crashes when Clerk is disabled
function ClerkAuthHelper({
  onStateChange,
  registerSignOut,
  triggerSyncCounter
}: {
  onStateChange: (data: { user: User | null; session: Session | null; profile: Profile | null; loading: boolean }) => void
  registerSignOut: (signOutFn: () => Promise<void>) => void
  triggerSyncCounter: number
}) {
  const { user: clerkUser, isLoaded } = useUser()
  const { session: clerkSession, signOut: clerkSignOut } = useClerk()

  const syncUser = useCallback(async () => {
    if (!isLoaded) return

    if (!clerkUser) {
      onStateChange({ user: null, session: null, profile: null, loading: false })
      return
    }

    try {
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
      const res = await fetch('/api/auth/clerk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: primaryEmail,
          name: clerkUser.fullName || clerkUser.username || primaryEmail?.split('@')[0] || 'Contributor',
          username: clerkUser.username || primaryEmail?.split('@')[0] || `user_${clerkUser.id.substring(0, 8)}`,
          avatarUrl: clerkUser.imageUrl
        })
      })

      if (res.ok) {
        const data = await res.json()
        
        // Construct compatible Supabase User shape to satisfy other application components
        const mockUser: User = {
          id: data.profile.id,
          email: data.profile.email,
          user_metadata: {
            name: data.profile.name,
            username: data.profile.username,
            avatar_url: data.profile.avatar_url
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: data.profile.created_at,
          role: 'authenticated',
          updated_at: new Date().toISOString(),
          phone: '',
          confirmed_at: data.profile.created_at,
          last_sign_in_at: new Date().toISOString(),
          identities: [],
          factors: []
        } as any

        const mockSession: Session = {
          access_token: 'clerk-session-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'clerk-refresh-token',
          user: mockUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        }

        onStateChange({
          user: mockUser,
          session: mockSession,
          profile: data.profile,
          loading: false
        })
      } else {
        onStateChange({ user: null, session: null, profile: null, loading: false })
      }
    } catch (err) {
      console.error('Clerk SQLite sync error:', err)
      onStateChange({ user: null, session: null, profile: null, loading: false })
    }
  }, [clerkUser, isLoaded, onStateChange])

  // Sync when user changes or is loaded
  useEffect(() => {
    syncUser()
  }, [clerkUser, isLoaded, triggerSyncCounter, syncUser])

  // Register the signOut callback up to the parent provider
  useEffect(() => {
    registerSignOut(async () => {
      await clerkSignOut()
    })
  }, [clerkSignOut, registerSignOut])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [clerkSignOutFn, setClerkSignOutFn] = useState<(() => Promise<void>) | null>(null)
  const [clerkSyncCounter, setClerkSyncCounter] = useState(0)

  const supabase = createClient()

  const isSupabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchProfile = useCallback(async (userId: string) => {
    if (isClerkEnabled) {
      setClerkSyncCounter(prev => prev + 1)
      return
    }

    if (!isSupabaseEnabled) {
      // Local Auth Fallback Mode: fetch fresh profile from local DB
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) setProfile(data.profile)
        }
      } catch (err) {
        console.error('Failed to fetch local profile:', err)
      }
      return
    }

    // Supabase Mode
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (data) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const mergedProfile = {
            ...data,
            bio: user.user_metadata?.bio || null,
            institution: user.user_metadata?.institution || null,
            country: user.user_metadata?.country || null,
            website: user.user_metadata?.website || null,
            linkedin: user.user_metadata?.linkedin || null,
            orcid: user.user_metadata?.orcid || null,
          }
          setProfile(mergedProfile)
          return
        }
      } catch (err) {
        console.error('Error merging user metadata:', err)
      }
      setProfile(data)
    } else if (error) {
      // Profile does not exist in DB yet, create it on-the-fly to self-heal
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const email = user.email
          const cleanEmail = email?.toLowerCase().trim() || ''
          const username = user.user_metadata?.username || cleanEmail.split('@')[0] || `user_${userId.substring(0, 8)}`
          const name = user.user_metadata?.name || username
          const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: cleanEmail,
              username: username.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
              name,
              avatarUrl,
              role: 'CONTRIBUTOR',
              reputation: 10,
              badge: 'Fellow Contributor'
            })
            .select()
            .single()
            
          if (!insertError && newProfile) {
            const mergedProfile = {
              ...newProfile,
              bio: user.user_metadata?.bio || null,
              institution: user.user_metadata?.institution || null,
              country: user.user_metadata?.country || null,
              website: user.user_metadata?.website || null,
              linkedin: user.user_metadata?.linkedin || null,
              orcid: user.user_metadata?.orcid || null,
            }
            setProfile(mergedProfile)
          } else if (insertError) {
            console.error('Failed to self-heal user profile in Supabase:', insertError.message)
          }
        }
      } catch (err) {
        console.error('Exception during profile self-healing:', err)
      }
    }
  }, [supabase, isSupabaseEnabled])

  const refreshProfile = useCallback(async () => {
    if (isClerkEnabled) {
      setClerkSyncCounter(prev => prev + 1)
      return
    }

    if (!isSupabaseEnabled) {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(data.profile)
            setUser(data.session?.user ?? null)
            setSession(data.session ?? null)
          }
        }
      } catch (err) {
        console.error('Failed to refresh local profile:', err)
      }
      return
    }

    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile, isSupabaseEnabled])

  const signOut = useCallback(async () => {
    if (isClerkEnabled && clerkSignOutFn) {
      await clerkSignOutFn()
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [supabase, clerkSignOutFn])

  useEffect(() => {
    if (isClerkEnabled) {
      // Handled entirely inside ClerkAuthHelper child
      return
    }

    if (!isSupabaseEnabled) {
      // Local Auth Fallback Initialization
      const initLocalAuth = async () => {
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            setSession(data.session)
            setUser(data.session?.user ?? null)
            setProfile(data.profile)
          } else {
            // Check localStorage cache as fallback
            const cachedSession = localStorage.getItem('quantora_local_session')
            const cachedProfile = localStorage.getItem('quantora_local_profile')
            if (cachedSession && cachedProfile) {
              const s = JSON.parse(cachedSession)
              setSession(s)
              setUser(s.user)
              setProfile(JSON.parse(cachedProfile))
            }
          }
        } catch {
          // Check localStorage cache as fallback
          const cachedSession = localStorage.getItem('quantora_local_session')
          const cachedProfile = localStorage.getItem('quantora_local_profile')
          if (cachedSession && cachedProfile) {
            const s = JSON.parse(cachedSession)
            setSession(s)
            setUser(s.user)
            setProfile(JSON.parse(cachedProfile))
          }
        } finally {
          setLoading(false)
        }
      }

      initLocalAuth()

      // Listen for local auth changes
      const handleLocalAuthChange = () => {
        initLocalAuth()
      }
      window.addEventListener('quantora_auth_change', handleLocalAuthChange)
      return () => window.removeEventListener('quantora_auth_change', handleLocalAuthChange)
    }

    // Supabase Mode Initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile, isSupabaseEnabled])

  const registerSignOut = useCallback((signOutFn: () => Promise<void>) => {
    setClerkSignOutFn(() => signOutFn)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin: profile?.role === 'ADMIN',
        signOut,
        refreshProfile,
      }}
    >
      {isClerkEnabled && (
        <ClerkAuthHelper
          onStateChange={({ user, session, profile, loading }) => {
            setUser(user)
            setSession(session)
            setProfile(profile)
            setLoading(loading)
          }}
          registerSignOut={registerSignOut}
          triggerSyncCounter={clerkSyncCounter}
        />
      )}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

