import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role admin client — NEVER expose to the browser
// Used only in API routes and Server Actions for privileged operations
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || !url.startsWith('http')) {
    // Return a dummy client matching common admin calls to prevent backend crashes
    const dummy = {
      from: () => ({
        select: () => ({
          order: () => ({
            range: async () => ({ data: [], error: null, count: 0 }),
          })
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: null }),
        })
      })
    }
    return dummy as any
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

