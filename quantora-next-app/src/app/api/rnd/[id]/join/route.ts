import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/rnd/[id]/join — join or leave a challenge
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabase
    .from('rnd_participants')
    .select('challenge_id')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('rnd_participants').delete().eq('challenge_id', id).eq('user_id', user.id)
    return NextResponse.json({ action: 'left' })
  } else {
    const { error } = await supabase.from('rnd_participants').insert({ challenge_id: id, user_id: user.id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ action: 'joined' })
  }
}
