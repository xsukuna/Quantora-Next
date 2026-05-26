import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/insights/[id]/upvote — toggle upvote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('insight_upvotes')
    .select('insight_id')
    .eq('insight_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Remove upvote
    const { error } = await supabase
      .from('insight_upvotes')
      .delete()
      .eq('insight_id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ action: 'removed' })
  } else {
    // Add upvote
    const { error } = await supabase
      .from('insight_upvotes')
      .insert({ insight_id: id, user_id: user.id })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ action: 'added' })
  }
}
