import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInsightTags } from '@/lib/gemini'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/insights — paginated insights with authors
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit
  const category = searchParams.get('category')

  if (!isSupabaseEnabled) {
    try {
      let whereClause: any = {}
      if (category && category !== 'all' && category !== 'All') {
        whereClause.category = category
      }

      const total = await prisma.insight.count({ where: whereClause })
      const insights = await prisma.insight.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              badge: true,
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip: offset,
        take: limit
      })

      const enriched = insights.map(ins => ({
        ...ins,
        created_at: ins.timestamp.toISOString(),
        upvotes_count: ins.upvotesCount,
        comments_count: ins.commentsCount,
        userHasUpvoted: false,
        profiles: ins.author ? {
          id: ins.author.id,
          name: ins.author.name,
          username: ins.author.username,
          avatar_url: ins.author.avatarUrl,
          badge: ins.author.badge,
        } : null
      }))

      return NextResponse.json({
        insights: enriched,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    } catch (e: any) {
      console.error('Prisma GET /api/insights error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
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
  } catch (err: any) {
    console.error('Supabase GET /api/insights error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/insights — create insight with Gemini auto-tags
export async function POST(request: NextRequest) {
  if (!isSupabaseEnabled) {
    try {
      const body = await request.json()
      const { content, category, authorEmail } = body

      if (!content || content.trim().length < 20) {
        return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 })
      }

      let user = await prisma.user.findUnique({
        where: { email: authorEmail || 'scarfaceatwork@outlook.com' }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            username: `analyst_${Date.now()}`,
            name: (authorEmail || 'scarfaceatwork@outlook.com').split('@')[0],
            email: authorEmail || 'scarfaceatwork@outlook.com',
            role: 'CONTRIBUTOR',
            reputation: 10,
          }
        })
      }

      let tags = category || 'General'
      try {
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
          const generatedTags = await generateInsightTags(content)
          tags = generatedTags.join(', ')
        }
      } catch {
        tags = category || 'General'
      }

      const insight = await prisma.insight.create({
        data: {
          authorId: user.id,
          content: content.trim(),
          category: category || 'General',
          tags
        },
        include: {
          author: true
        }
      })

      const mapped = {
        ...insight,
        created_at: insight.timestamp.toISOString(),
        upvotes_count: insight.upvotesCount,
        comments_count: insight.commentsCount,
        profiles: insight.author ? {
          id: insight.author.id,
          name: insight.author.name,
          username: insight.author.username,
          avatar_url: insight.author.avatarUrl,
          badge: insight.author.badge,
        } : null
      }

      return NextResponse.json({ insight: mapped }, { status: 201 })
    } catch (err: any) {
      console.error('Prisma POST /api/insights error:', err)
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
    const { content, category } = body

    if (!content || content.trim().length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 })
    }

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

