import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, username } = await request.json()

    if (!email || !name || !username) {
      return NextResponse.json({ error: 'Missing required signup fields' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanUsername = username.toLowerCase().trim()

    // Verify uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: 'This username is already taken' }, { status: 400 })
    }

    // Create user in SQLite
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
        role: 'CONTRIBUTOR',
        reputation: 10,
        badge: 'Fellow Contributor',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
      }
    })

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

    const response = NextResponse.json({ session, profile }, { status: 201 })

    // Set cookie for server API checks
    response.cookies.set('quantora_local_email', user.email, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (err: any) {
    console.error('Local Signup Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
