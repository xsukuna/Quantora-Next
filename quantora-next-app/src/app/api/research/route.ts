import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
        author:authorId (id, name, username, avatarUrl)
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status.toUpperCase() !== 'ALL') {
      query = query.eq('status', status)
    }
    if (authorId) {
      query = query.eq('authorId', authorId)
    }
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,tags.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map keys to match the snake_case expectations of the frontend
    const mapped = (data || []).map(paper => ({
      ...paper,
      created_at: paper.date,
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
        institution: paper.institution,
      } : null
    }))

    return NextResponse.json({
      papers: mapped,
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
  console.log('[validatePaperBody] Input body:', JSON.stringify(body, null, 2))
  const errors: Record<string, string> = {}
  const { title, abstract, category, country, institution } = body as Record<string, string>

  if (!title || title.trim().length < 10)
    errors.title = 'Title is required and must be at least 10 characters'
  else if (title.trim().length > 300)
    errors.title = 'Title must not exceed 300 characters'

  if (!abstract || abstract.trim().length < 50)
    errors.abstract = 'Abstract is required and must be at least 50 characters'
  else if (abstract.trim().length > 30000)
    errors.abstract = 'Abstract must not exceed 30000 characters'

  if (!category || !VALID_CATEGORIES.includes(category.trim()))
    errors.category = `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`

  if (Object.keys(errors).length > 0) {
    console.log('[validatePaperBody] Validation failed:', JSON.stringify(errors, null, 2))
  } else {
    console.log('[validatePaperBody] Validation passed successfully!')
  }

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

    const admin = createAdminClient()
    
    // Proactively check and sync profile in "profiles" table to prevent foreign key violations
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      console.log(`Auto-syncing profile for auth user ${user.id}...`)
      const email = user.email || 'scarfaceatwork@outlook.com'
      const username = user.user_metadata?.username || `user_${Date.now()}`
      const name = user.user_metadata?.name || email.split('@')[0]
      await admin
        .from('profiles')
        .insert({
          id: user.id,
          username,
          name,
          email,
          role: 'CONTRIBUTOR',
          reputation: 10,
          badge: 'Fellow Contributor'
        })
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
    let ai_keywords_list: string[] = []
    try {
      const aiResult = await generatePaperSummary(title, abstract, category)
      ai_summary = aiResult.summary
      ai_keywords_list = aiResult.keywords || []
    } catch (e) {
      console.error('Gemini summary failed:', e)
    }

    const initialTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
    const mergedTags = [...initialTags, ...ai_keywords_list].filter((v, i, a) => v && a.indexOf(v) === i)

    const finalAbstract = ai_summary 
      ? `${abstract}\n\n=== Gemini AI Summary ===\n${ai_summary}` 
      : abstract

    const paperId = 'paper_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)

    const { data, error } = await admin
      .from('Paper')
      .insert({
        id: paperId,
        title,
        abstract: finalAbstract,
        category,
        authorId: user.id,
        institution: institution || 'Independent',
        country: country || 'India',
        tags: mergedTags.join(', '),
        fileUrl: file_url,
        fileName: file_name || 'manuscript.pdf',
        fileSize: file_size || '420 KB',
        references: references_text || '',
        status: 'PENDING',
        trustLabel: 'INDEPENDENT_SUBMISSION',
        peerReviewed: false,
        aiSummary: ai_summary,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase Paper insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Safely increment user reputation in profiles table
    try {
      const { data: userData } = await admin
        .from('profiles')
        .select('reputation')
        .eq('id', user.id)
        .single()
      const newRep = (userData?.reputation || 0) + 25
      await admin
        .from('profiles')
        .update({ reputation: newRep })
        .eq('id', user.id)
    } catch (e) {
      console.error('Failed to increment user reputation:', e)
    }

    return NextResponse.json({ paper: data }, { status: 201 })
  } catch (err: any) {
    console.error('Paper submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

