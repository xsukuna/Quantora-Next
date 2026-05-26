import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/rnd — list active challenges
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
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

  // If authenticated, check which challenges the user has joined
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
}

// POST /api/rnd — create challenge (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { data, error } = await supabase.from('rnd_challenges').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ challenge: data }, { status: 201 })
}
