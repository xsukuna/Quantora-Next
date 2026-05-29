import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/papers — admin: list all papers with full metadata
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  const { data, error, count } = await admin
    .from('Paper')
    .select(`
      *,
      profiles:authorId (id, name, username, email)
    `, { count: 'exact' })
    .eq('status', status)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mappedPapers = (data || []).map((paper: any) => ({
    ...paper,
    created_at: paper.date,
    trust_label: paper.trustLabel,
    peer_reviewed: paper.peerReviewed,
    file_url: paper.fileUrl,
    file_name: paper.fileName,
    file_size: paper.fileSize,
    ai_summary: paper.aiSummary,
    ai_keywords: paper.tags,
    profiles: paper.profiles ? {
      id: paper.profiles.id,
      name: paper.profiles.name,
      username: paper.profiles.username,
      email: paper.profiles.email,
      institution: paper.institution,
    } : null
  }))

  return NextResponse.json({ papers: mappedPapers, total: count })
}

