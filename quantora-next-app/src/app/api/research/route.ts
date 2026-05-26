import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePaperSummary } from '@/lib/gemini'

// GET /api/research — list papers with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const status = searchParams.get('status') || 'APPROVED'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  let query = supabase
    .from('papers')
    .select(`
      *,
      profiles:author_id (id, name, username, avatar_url, institution)
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    papers: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

// POST /api/research — submit new paper
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, abstract, category, institution, country, tags, file_url, file_name, file_size, references_text } = body

    if (!title || !abstract || !category || !file_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate AI summary with Gemini
    let ai_summary = null
    let ai_keywords = null
    try {
      const aiResult = await generatePaperSummary(title, abstract, category)
      ai_summary = aiResult.summary
      ai_keywords = aiResult.keywords.join(', ')
    } catch (e) {
      console.error('Gemini summary failed:', e)
    }

    const { data, error } = await supabase
      .from('papers')
      .insert({
        title,
        abstract,
        category,
        author_id: user.id,
        institution: institution || 'Independent',
        country: country || 'India',
        tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
        file_url,
        file_name,
        file_size,
        references_text,
        ai_summary,
        ai_keywords,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update contributor reputation
    await supabase
      .from('profiles')
      .update({ reputation: supabase.rpc('increment_reputation', { user_id: user.id, amount: 25 }) } as Parameters<typeof supabase.from>[0])
      .eq('id', user.id)

    return NextResponse.json({ paper: data }, { status: 201 })
  } catch (err) {
    console.error('Paper submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
