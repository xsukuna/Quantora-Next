import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/research/[id] — single paper detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isSupabaseEnabled) {
    try {
      const paper = await prisma.paper.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              institution: true,
              badge: true,
            }
          },
          versions: {
            orderBy: {
              date: 'desc'
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                }
              }
            },
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })

      if (!paper) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
      }

      await prisma.paper.update({
        where: { id },
        data: { downloads: { increment: 1 } }
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
        profiles: paper.author ? {
          id: paper.author.id,
          name: paper.author.name,
          username: paper.author.username,
          avatar_url: paper.author.avatarUrl,
          institution: paper.author.institution,
          badge: paper.author.badge,
        } : null,
        paper_versions: paper.versions.map(v => ({
          id: v.id,
          version: v.version,
          summary: v.summary,
          author: v.author,
          created_at: v.date.toISOString()
        })),
        comments: paper.comments.map(c => ({
          id: c.id,
          text: c.text,
          reputation: c.reputation,
          created_at: c.timestamp.toISOString(),
          profiles: c.user ? {
            id: c.user.id,
            name: c.user.name,
            username: c.user.username,
            avatar_url: c.user.avatarUrl
          } : null
        }))
      }

      return NextResponse.json(mapped)
    } catch (e: any) {
      console.error('Prisma GET /api/research/[id] error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Paper')
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

    await supabase.from('Paper').update({ downloads: (data.downloads || 0) + 1 }).eq('id', id)
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Paper detail fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/research/[id] — like paper (authenticated)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isSupabaseEnabled) {
    try {
      const { action, text, authorEmail } = await request.json()

      if (action === 'like') {
        const paper = await prisma.paper.update({
          where: { id },
          data: { likes: { increment: 1 } }
        })
        return NextResponse.json({ likes: paper.likes })
      }

      if (action === 'comment') {
        if (!text?.trim()) return NextResponse.json({ error: 'Comment text required' }, { status: 400 })

        let user = await prisma.user.findUnique({
          where: { email: authorEmail || 'scarfaceatwork@outlook.com' }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: `user_${Date.now()}`,
              name: (authorEmail || 'scarfaceatwork@outlook.com').split('@')[0],
              email: authorEmail || 'scarfaceatwork@outlook.com',
              role: 'CONTRIBUTOR',
              reputation: 10,
            }
          })
        }

        const comment = await prisma.comment.create({
          data: {
            paperId: id,
            userId: user.id,
            text: text.trim(),
            reputation: 50
          },
          include: {
            user: true
          }
        })

        const mappedComment = {
          id: comment.id,
          text: comment.text,
          reputation: comment.reputation,
          created_at: comment.timestamp.toISOString(),
          profiles: comment.user ? {
            id: comment.user.id,
            name: comment.user.name,
            username: comment.user.username,
            avatar_url: comment.user.avatarUrl
          } : null
        }

        return NextResponse.json(mappedComment)
      }

      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (err: any) {
      console.error('Prisma PATCH /api/research/[id] error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, text } = await request.json()

    if (action === 'like') {
      const { data } = await supabase.from('Paper').select('likes').eq('id', id).single()
      await supabase.from('Paper').update({ likes: (data?.likes || 0) + 1 }).eq('id', id)
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
  } catch (err: any) {
    console.error('Paper PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/research/[id] — author or admin delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isSupabaseEnabled) {
    try {
      await prisma.paper.delete({
        where: { id }
      })
      return NextResponse.json({ success: true })
    } catch (err: any) {
      console.error('Prisma DELETE /api/research/[id] error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: paper } = await supabase.from('Paper').select('author_id').eq('id', id).single()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (paper?.author_id !== user.id && profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('Paper').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Paper delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

