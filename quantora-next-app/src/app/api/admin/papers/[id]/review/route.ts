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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action, notes } = await request.json() // action: 'APPROVE' | 'REJECT'

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = createAdminClient()
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

  const { data, error } = await admin
    .from('papers')
    .update({
      status: newStatus,
      trust_label: action === 'APPROVE' ? 'VERIFIED_RESEARCH' : 'REJECTED_SUBMISSION',
    })
    .eq('id', id)
    .select('*, profiles:author_id (id, name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Reward author reputation if approved
  if (action === 'APPROVE' && data?.author_id) {
    await admin.rpc('increment_reputation_fn', {
      user_id: data.author_id,
      amount: 100
    }).catch(() => {
      // RPC might not exist yet; update directly
      admin.from('profiles')
        .update({ reputation: 100 })
        .eq('id', data.author_id)
    })
  }

  return NextResponse.json({ paper: data, status: newStatus, notes })
}
