import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/users — admin: list all users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  if (!isSupabaseEnabled) {
    try {
      const total = await prisma.user.count()
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      })

      const mappedUsers = users.map(user => ({
        ...user,
        created_at: user.createdAt.toISOString(),
      }))

      return NextResponse.json({ users: mappedUsers, total, page })
    } catch (e: any) {
      console.error('Prisma GET /api/users error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()
    const { data, error, count } = await admin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({ users: data, total: count, page })
  } catch (err: any) {
    console.error('Users fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/users — admin: update a user's role
export async function PATCH(request: NextRequest) {
  if (!isSupabaseEnabled) {
    try {
      const emailCookie = request.cookies.get('quantora_local_email')?.value
      if (!emailCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const adminUser = await prisma.user.findUnique({ where: { email: emailCookie } })
      if (!adminUser || adminUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const body = await request.json()
      const { userId, role } = body

      if (!userId || !role) {
        return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role }
      })

      return NextResponse.json({ success: true, user: updated })
    } catch (e: any) {
      console.error('Prisma PATCH /api/users error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, user: data })
  } catch (err: any) {
    console.error('PATCH /api/users error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


