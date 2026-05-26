import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInsightTags } from '@/lib/gemini'

// GET /api/insights — paginated insights with authors
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit
  const category = searchParams.get('category')

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('insights')
    .select(`
      *,
      profiles:author_id (id, name, username, avatar_url, badge)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: insights, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check which insights the current user has upvoted
  let upvotedIds: Set<string> = new Set()
  if (user && insights) {
    const insightIds = insights.map((i: { id: string }) => i.id)
    if (insightIds.length > 0) {
      const { data: upvotes } = await supabase
        .from('insight_upvotes')
        .select('insight_id')
        .eq('user_id', user.id)
        .in('insight_id', insightIds)

      upvotedIds = new Set((upvotes || []).map((u: { insight_id: string }) => u.insight_id))
    }
  }

  const enriched = (insights || []).map((insight: Record<string, unknown>) => ({
    ...insight,
    userHasUpvoted: upvotedIds.has(insight.id as string),
  }))

  return NextResponse.json({
    insights: enriched,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

// POST /api/insights — create insight with Gemini auto-tags
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, category } = body

    if (!content || content.trim().length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 })
    }

    // Generate tags with Gemini
    let tags = ''
    try {
      const generatedTags = await generateInsightTags(content)
      tags = generatedTags.join(', ')
    } catch {
      tags = category || 'General'
    }

    const { data, error } = await supabase
      .from('insights')
      .insert({
        author_id: user.id,
        content: content.trim(),
        category: category || 'General',
        tags,
      })
      .select(`*, profiles:author_id (id, name, username, avatar_url, badge)`)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ insight: data }, { status: 201 })
  } catch (err) {
    console.error('Insight creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
