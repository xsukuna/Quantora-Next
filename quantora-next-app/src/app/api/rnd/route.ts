import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/rnd — list active challenges
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (!isSupabaseEnabled) {
    try {
      let whereClause: any = {}
      if (category && category !== 'all' && category !== 'All') {
        whereClause.category = category
      }

      const challenges = await prisma.rndChallenge.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        }
      })

      const enriched = challenges.map(c => ({
        ...c,
        created_at: c.createdAt.toISOString(),
        rep_award: c.repAward,
        teams_count: c.teamsCount,
        solutions_count: c.solutionsCount,
        userHasJoined: false,
      }))

      return NextResponse.json({ challenges: enriched })
    } catch (e: any) {
      console.error('Prisma GET /api/rnd error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('rnd_challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: challenges, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let joinedIds: Set<string> = new Set()
    if (user && challenges) {
      const challengeIds = challenges.map((c: { id: string }) => c.id)
      if (challengeIds.length > 0) {
        const { data: joined } = await supabase
          .from('rnd_participants')
          .select('challenge_id')
          .eq('user_id', user.id)
          .in('challenge_id', challengeIds)

        joinedIds = new Set((joined || []).map((p: { challenge_id: string }) => p.challenge_id))
      }
    }

    const enriched = (challenges || []).map((c: Record<string, unknown>) => ({
      ...c,
      userHasJoined: joinedIds.has(c.id as string),
    }))

    return NextResponse.json({ challenges: enriched })
  } catch (err: any) {
    console.error('Supabase GET /api/rnd error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/rnd — create challenge (admin only)
export async function POST(request: NextRequest) {
  if (!isSupabaseEnabled) {
    try {
      const body = await request.json()
      const { title, sponsor, logo, description, reward, repAward, category, difficulty, details } = body

      const challenge = await prisma.rndChallenge.create({
        data: {
          title,
          sponsor,
          logo: logo || 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=80&auto=format&fit=crop',
          description,
          reward,
          repAward: parseInt(repAward as any) || 100,
          category,
          difficulty: difficulty || 'Expert',
          details: details || ''
        }
      })

      return NextResponse.json({ challenge }, { status: 201 })
    } catch (err: any) {
      console.error('Prisma POST /api/rnd error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
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
    const { data, error } = await supabase.from('rnd_challenges').insert(body).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ challenge: data }, { status: 201 })
  } catch (err: any) {
    console.error('Rnd challenge creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

