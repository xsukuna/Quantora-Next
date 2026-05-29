import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const isClerkEnabled = typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Define Clerk route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  '/submit(.*)',
  '/profiles(.*)',
  '/admin(.*)'
]);

// Custom fallback middleware for Supabase and SQLite local authentication
async function supabaseOrLocalMiddleware(request: NextRequest) {
  const isSupabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const path = request.nextUrl.pathname
  const PROTECTED_ROUTES = ['/submit', '/profiles']
  const ADMIN_ROUTES = ['/admin']
  const AUTH_ROUTES = ['/login', '/signup']
  const CALLBACK_ROUTES = ['/auth/callback']

  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some(r => path.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => path.startsWith(r))
  const isCallbackRoute = CALLBACK_ROUTES.some(r => path.startsWith(r))

  // Never intercept OAuth callback routes — let them complete the token exchange
  if (isCallbackRoute) {
    return NextResponse.next()
  }

  if (isSupabaseEnabled) {
    let supabaseResponse = NextResponse.next({ request })
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if ((isProtected || isAdmin) && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }

      if (isAdmin && user) {
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'ADMIN') {
          const url = request.nextUrl.clone()
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
      }

      if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      console.error('Supabase middleware session check error:', e)
    }
    return supabaseResponse
  }

  // Local SQLite fallback cookie check
  const localEmail = request.cookies.get('quantora_local_email')?.value

  if ((isProtected || isAdmin) && !localEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && localEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Master dynamic middleware switcher
export default async function middleware(request: NextRequest, event: any) {
  if (isClerkEnabled) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect()
      }
    })(request, event)
  }

  return supabaseOrLocalMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

