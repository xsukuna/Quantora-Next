import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { clerkId, email, name, username, avatarUrl } = await request.json()

    if (!clerkId || !email) {
      return NextResponse.json({ error: 'Clerk ID and email are required for sync' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanUsername = (username || email.split('@')[0]).toLowerCase().trim()

    // Find local user by clerkId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId },
          { email: cleanEmail }
        ]
      }
    })

    if (user) {
      // Update existing local user with clerkId and avatar
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: clerkId,
          avatarUrl: avatarUrl || user.avatarUrl
        }
      })
    } else {
      // Create a fresh contributor profile in SQLite
      user = await prisma.user.create({
        data: {
          clerkId,
          email: cleanEmail,
          username: cleanUsername,
          name: name || cleanUsername,
          role: 'CONTRIBUTOR',
          reputation: 10,
          badge: 'Fellow Contributor',
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
        }
      })
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

    const response = NextResponse.json({ profile }, { status: 200 })

    // Set local session cookie so other offline APIs can resolve Clerk user email
    response.cookies.set('quantora_local_email', user.email, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (err: any) {
    console.error('Clerk Syncer Route Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
