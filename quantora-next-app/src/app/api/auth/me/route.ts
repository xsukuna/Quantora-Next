import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const localEmail = request.cookies.get('quantora_local_email')?.value

    if (!localEmail) {
      return NextResponse.json({ error: 'No active local session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: localEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User session invalid' }, { status: 401 })
    }

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

    return NextResponse.json({ session, profile }, { status: 200 })
  } catch (err: any) {
    console.error('Session API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
