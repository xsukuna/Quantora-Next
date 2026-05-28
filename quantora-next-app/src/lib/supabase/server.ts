import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    // Return a dummy client matching common server calls to prevent backend crashes
    const dummy = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => {
          // In local SQLite fallback mode, we can read the logged-in user from local cookies!
          const cookieStore = await cookies()
          const localEmail = cookieStore.get('quantora_local_email')?.value
          if (localEmail) {
            // Return a structured user object matching Supabase User shape
            return {
              data: {
                user: {
                  id: localEmail, // using email as a safe identifier fallback
                  email: localEmail,
                  user_metadata: {
                    email: localEmail
                  }
                }
              },
              error: null
            }
          }
          return { data: { user: null }, error: null }
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          })
        })
      })
    }
    return dummy as any
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set (middleware handles this)
          }
        },
      },
    }
  )
}

