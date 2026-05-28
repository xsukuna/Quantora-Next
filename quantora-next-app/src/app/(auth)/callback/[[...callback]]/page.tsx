'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  useEffect(() => {
    const supabase = createClient()

    // Supabase OAuth returns tokens via URL hash fragment
    // The Supabase client auto-exchanges them on initialisation
    const handleCallback = async () => {
      try {
        // Check if Supabase exchanged tokens from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error.message)
          router.replace('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (session) {
          // Successfully authenticated — redirect to intended destination
          router.replace(next)
        } else {
          // No session yet — wait a moment for the exchange, then redirect
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              router.replace(next)
            } else {
              router.replace('/login?error=' + encodeURIComponent('Authentication failed. Please try again.'))
            }
          }, 1500)
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        router.replace('/login?error=' + encodeURIComponent('Authentication failed unexpectedly.'))
      }
    }

    handleCallback()
  }, [router, next])

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin text-[#0062FF]" />
      <p className="text-[#A0AEC0] text-sm">Completing sign-in…</p>
    </div>
  )
}
