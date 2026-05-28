import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    // Return a dummy client matching common calls to prevent runtime crashes
    const dummy = {
      auth: {
        getSession: async () => {
          try {
            const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('quantora_local_session') : null
            if (sessionStr) {
              return { data: { session: JSON.parse(sessionStr) }, error: null }
            }
          } catch {}
          return { data: { session: null }, error: null }
        },
        getUser: async () => {
          try {
            const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('quantora_local_session') : null
            if (sessionStr) {
              const session = JSON.parse(sessionStr)
              return { data: { user: session.user }, error: null }
            }
          } catch {}
          return { data: { user: null }, error: null }
        },
        onAuthStateChange: (callback: any) => {
          if (typeof window !== 'undefined') {
            const handler = async () => {
              const sessionStr = localStorage.getItem('quantora_local_session')
              const session = sessionStr ? JSON.parse(sessionStr) : null
              callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
            }
            window.addEventListener('quantora_auth_change', handler)
            return {
              data: {
                subscription: {
                  unsubscribe: () => window.removeEventListener('quantora_auth_change', handler)
                }
              }
            }
          }
          return {
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          }
        },
        signInWithPassword: async ({ email, password }: any) => {
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) {
              return { data: { session: null, user: null }, error: new Error(data.error || 'Login failed') }
            }
            localStorage.setItem('quantora_local_session', JSON.stringify(data.session))
            localStorage.setItem('quantora_local_profile', JSON.stringify(data.profile))
            window.dispatchEvent(new Event('quantora_auth_change'))
            return { data: { session: data.session, user: data.session.user }, error: null }
          } catch (e: any) {
            return { data: { session: null, user: null }, error: e }
          }
        },
        signUp: async ({ email, password, options }: any) => {
          try {
            const res = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password,
                name: options?.data?.name || email.split('@')[0],
                username: options?.data?.username || email.split('@')[0]
              })
            })
            const data = await res.json()
            if (!res.ok) {
              return { data: { session: null, user: null }, error: new Error(data.error || 'Signup failed') }
            }
            localStorage.setItem('quantora_local_session', JSON.stringify(data.session))
            localStorage.setItem('quantora_local_profile', JSON.stringify(data.profile))
            window.dispatchEvent(new Event('quantora_auth_change'))
            return { data: { session: data.session, user: data.session.user }, error: null }
          } catch (e: any) {
            return { data: { session: null, user: null }, error: e }
          }
        },
        signInWithOtp: async ({ email, phone }: any) => {
          // Dummy: pretend OTP was sent
          console.warn('[Quantora dummy] signInWithOtp called — Supabase not configured')
          return { data: { messageId: null }, error: new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') }
        },
        verifyOtp: async ({ email, phone, token, type }: any) => {
          console.warn('[Quantora dummy] verifyOtp called — Supabase not configured')
          return { data: { session: null, user: null }, error: new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') }
        },
        signInWithOAuth: async ({ provider, options }: any) => {
          console.warn('[Quantora dummy] signInWithOAuth called — Supabase not configured')
          return { data: { provider, url: null }, error: new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') }
        },
        signOut: async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' })
            localStorage.removeItem('quantora_local_session')
            localStorage.removeItem('quantora_local_profile')
            window.dispatchEvent(new Event('quantora_auth_change'))
            return { error: null }
          } catch (e: any) {
            return { error: e }
          }
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          order: () => ({
            range: async () => ({ data: null, error: null }),
          })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          })
        }),
        update: () => ({
          eq: async () => ({ data: null, error: null })
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: null })
        })
      })
    }
    return dummy as any
  }

  return createBrowserClient<Database>(url, key)
}

