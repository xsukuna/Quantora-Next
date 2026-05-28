import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Query user locally
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json({ error: 'No local account matches this email' }, { status: 404 })
    }

    // frictionless fallback mode: allow any password for testing seeded users
    const mockUser = {
      id: user.id,
      email: user.email,
      user_metadata: {
        name: user.name,
        username: user.username,
        avatar_url: user.avatarUrl
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: user.createdAt.toISOString()
    }

    const session = {
      access_token: 'local-session-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'local-refresh-token',
      user: mockUser
    }

    const profile = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      reputation: user.reputation,
      badge: user.badge,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt.toISOString()
    }

    const response = NextResponse.json({ session, profile }, { status: 200 })

    // Set cookie for API route fallbacks
    response.cookies.set('quantora_local_email', user.email, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (err: any) {
    console.error('Local Login Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
