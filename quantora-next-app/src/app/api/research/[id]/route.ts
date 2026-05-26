import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/research/[id] — single paper detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('papers')
    .select(`
      *,
      profiles:author_id (id, name, username, avatar_url, institution, badge),
      paper_versions (id, version, summary, author, created_at),
      comments (
        id, text, reputation, created_at,
        profiles:user_id (id, name, username, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
  }

  // Increment download count
  await supabase.from('papers').update({ downloads: (data.downloads || 0) + 1 }).eq('id', id)

  return NextResponse.json(data)
}

// PATCH /api/research/[id] — like paper (authenticated)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action, text } = await request.json()

  if (action === 'like') {
    const { data } = await supabase.from('papers').select('likes').eq('id', id).single()
    await supabase.from('papers').update({ likes: (data?.likes || 0) + 1 }).eq('id', id)
    return NextResponse.json({ likes: (data?.likes || 0) + 1 })
  }

  if (action === 'comment') {
    if (!text?.trim()) return NextResponse.json({ error: 'Comment text required' }, { status: 400 })
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ paper_id: id, user_id: user.id, text: text.trim() })
      .select(`*, profiles:user_id (id, name, username, avatar_url)`)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(comment)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// DELETE /api/research/[id] — author or admin delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership or admin
  const { data: paper } = await supabase.from('papers').select('author_id').eq('id', id).single()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (paper?.author_id !== user.id && profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('papers').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
