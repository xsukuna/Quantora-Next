import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/rnd/[id]/submit — submit a solution to a challenge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, description, file_url } = await request.json()

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('rnd_submissions')
    .insert({
      challenge_id: id,
      user_id: user.id,
      title,
      description,
      file_url: file_url || null,
      status: 'PENDING',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment solutions count
  await supabase.rpc('increment_solutions', { challenge_id: id }).catch(() => {
    supabase.from('rnd_challenges')
      .update({ solutions_count: supabase.rpc('solutions_count_increment' as never) })
      .eq('id', id)
  })

  return NextResponse.json({ submission: data }, { status: 201 })
}
