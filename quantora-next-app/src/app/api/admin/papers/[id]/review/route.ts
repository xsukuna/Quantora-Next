import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PATCH /api/admin/papers/[id]/review — approve or reject a paper
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action, notes } = await request.json() // action: 'APPROVE' | 'REJECT'

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

  const { data, error } = await admin
    .from('Paper')
    .update({
      status: newStatus,
      trustLabel: action === 'APPROVE' ? 'VERIFIED_RESEARCH' : 'REJECTED_SUBMISSION',
    })
    .eq('id', id)
    .select('*, profiles:authorId (id, name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Reward author reputation if approved
  if (action === 'APPROVE' && data?.authorId) {
    await admin.rpc('increment_reputation_fn', {
      user_id: data.authorId,
      amount: 100
    }).catch(async () => {
      // RPC might not exist yet; update directly
      try {
        const { data: userData } = await admin.from('profiles').select('reputation').eq('id', data.authorId).single()
        const newRep = (userData?.reputation || 0) + 100
        await admin.from('profiles')
          .update({ reputation: newRep })
          .eq('id', data.authorId)
      } catch (err) {
        console.error('Failed to update reputation:', err)
      }
    })
  }

  // Map returned paper data to the snake_case format
  const mappedPaper = data ? {
    ...data,
    created_at: data.date,
    trust_label: data.trustLabel,
    peer_reviewed: data.peerReviewed,
    file_url: data.fileUrl,
    file_name: data.fileName,
    file_size: data.fileSize,
    ai_summary: data.aiSummary,
    ai_keywords: data.tags,
    profiles: data.profiles ? {
      id: data.profiles.id,
      name: data.profiles.name,
      email: data.profiles.email,
    } : null
  } : null

  return NextResponse.json({ paper: mappedPaper, status: newStatus, notes })
}
