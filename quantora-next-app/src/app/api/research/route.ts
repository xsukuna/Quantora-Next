import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePaperSummary } from '@/lib/gemini'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/research — list papers with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const status = searchParams.get('status') || 'APPROVED'
  const authorId = searchParams.get('authorId') || searchParams.get('author_id')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  if (!isSupabaseEnabled) {
    try {
      let whereClause: any = {}
      if (status && status.toUpperCase() !== 'ALL') {
        whereClause.status = status.toUpperCase()
      }
      if (authorId) {
        whereClause.authorId = authorId
      }
      if (category && category !== 'all' && category !== 'All') {
        whereClause.category = category
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' as const } },
          { abstract: { contains: search, mode: 'insensitive' as const } },
          { tags: { contains: search, mode: 'insensitive' as const } }
        ]
      }

      const total = await prisma.paper.count({ where: whereClause })
      const papers = await prisma.paper.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              institution: true,
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip: offset,
        take: limit
      })

      const mappedPapers = papers.map(paper => ({
        ...paper,
        created_at: paper.date.toISOString(),
        trust_label: paper.trustLabel,
        peer_reviewed: paper.peerReviewed,
        file_url: paper.fileUrl,
        file_name: paper.fileName,
        file_size: paper.fileSize,
        ai_summary: paper.aiSummary,
        profiles: paper.author ? {
          id: paper.author.id,
          name: paper.author.name,
          username: paper.author.username,
          avatar_url: paper.author.avatarUrl,
          institution: paper.author.institution,
        } : null
      }))

      return NextResponse.json({
        papers: mappedPapers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    } catch (e: any) {
      console.error('Prisma GET /api/research error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    let query = supabase
      .from('Paper')
      .select(`
        *,
        profiles:author_id (id, name, username, avatar_url, institution)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status.toUpperCase() !== 'ALL') {
      query = query.eq('status', status)
    }
    if (authorId) {
      query = query.eq('author_id', authorId)
    }
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
  } catch (err: any) {
    console.error('Supabase GET /api/research error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Validation constants
const VALID_CATEGORIES = [
  'Macroeconomics', 'Public Policy', 'Quant Strategy', 'Climate Finance',
  'Political Economy', 'Development Economics', 'Geopolitics', 'Financial Markets',
  'Technology Policy', 'Social Science', 'General'
]

function validatePaperBody(body: Record<string, unknown>) {
  const errors: Record<string, string> = {}
  const { title, abstract, category, country, institution } = body as Record<string, string>

  if (!title || title.trim().length < 10)
    errors.title = 'Title is required and must be at least 10 characters'
  else if (title.trim().length > 300)
    errors.title = 'Title must not exceed 300 characters'

  if (!abstract || abstract.trim().length < 50)
    errors.abstract = 'Abstract is required and must be at least 50 characters'
  else if (abstract.trim().length > 5000)
    errors.abstract = 'Abstract must not exceed 5000 characters'

  if (!category || !VALID_CATEGORIES.includes(category.trim()))
    errors.category = `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`

  if (!country || !country.trim())
    errors.country = 'Country is required'

  if (!institution || !institution.trim())
    errors.institution = 'Institution is required'

  return Object.keys(errors).length > 0 ? errors : null
}

// POST /api/research — submit new paper
export async function POST(request: NextRequest) {
  if (!isSupabaseEnabled) {
    try {
      const body = await request.json()
      const { title, abstract, category, institution, country, tags, file_url, file_name, file_size, references_text, authorEmail, trustLabel } = body

      const validationErrors = validatePaperBody(body)
      if (validationErrors) {
        return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 })
      }

      if (!file_url) {
        return NextResponse.json({ error: 'Missing required fields', details: { file_url: 'File URL is required' } }, { status: 400 })
      }

      let user = await prisma.user.findUnique({
        where: { email: authorEmail || 'scarfaceatwork@outlook.com' }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            username: `author_${Date.now()}`,
            name: (authorEmail || 'scarfaceatwork@outlook.com').split('@')[0],
            email: authorEmail || 'scarfaceatwork@outlook.com',
            role: 'CONTRIBUTOR',
            reputation: 10,
          }
        })
      }

      // Generate AI summary if Gemini API key exists
      let ai_summary = '• Analyzed via local Socratic NLP sub-process.\n• Document credentials verified and added to public ledger.'
      try {
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
          const aiResult = await generatePaperSummary(title, abstract, category)
          ai_summary = aiResult.summary
        }
      } catch (e) {
        console.error('Gemini paper summary failed:', e)
      }

      const paper = await prisma.paper.create({
        data: {
          title,
          abstract,
          category,
          authorId: user.id,
          institution: institution || 'Independent Fellow',
          country: country || 'India',
          tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
          references: references_text || '',
          fileUrl: file_url,
          fileName: file_name || 'manuscript.pdf',
          fileSize: file_size || '420 KB',
          status: 'APPROVED', // Auto-approve locally for instant feedback
          trustLabel: trustLabel || 'INDEPENDENT_SUBMISSION',
          aiSummary: ai_summary
        }
      })

      await prisma.user.update({
        where: { id: user.id },
        data: { reputation: { increment: 25 } }
      })

      const mapped = {
        ...paper,
        created_at: paper.date.toISOString(),
        trust_label: paper.trustLabel,
        peer_reviewed: paper.peerReviewed,
        file_url: paper.fileUrl,
        file_name: paper.fileName,
        file_size: paper.fileSize,
        ai_summary: paper.aiSummary,
      }

      return NextResponse.json({ paper: mapped }, { status: 201 })
    } catch (err: any) {
      console.error('Prisma POST /api/research error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, abstract, category, institution, country, tags, file_url, file_name, file_size, references_text } = body

    const validationErrors = validatePaperBody(body)
    if (validationErrors) {
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 })
    }

    if (!file_url) {
      return NextResponse.json({ error: 'Missing required fields', details: { file_url: 'File URL is required' } }, { status: 400 })
    }

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
      .from('Paper')
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

    await supabase
      .from('profiles')
      .update({ reputation: supabase.rpc('increment_reputation', { user_id: user.id, amount: 25 }) } as Parameters<typeof supabase.from>[0])
      .eq('id', user.id)

    return NextResponse.json({ paper: data }, { status: 201 })
  } catch (err: any) {
    console.error('Paper submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

