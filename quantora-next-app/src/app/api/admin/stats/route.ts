import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/stats — platform-wide statistics
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  const [
    { count: totalPapers },
    { count: pendingPapers },
    { count: approvedPapers },
    { count: totalUsers },
    { count: totalInsights },
    { count: totalChallenges },
  ] = await Promise.all([
    admin.from('papers').select('*', { count: 'exact', head: true }),
    admin.from('papers').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    admin.from('papers').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('insights').select('*', { count: 'exact', head: true }),
    admin.from('rnd_challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Get download totals
  const { data: downloadData } = await admin.from('papers').select('downloads')
  const totalDownloads = (downloadData || []).reduce((sum: number, p: { downloads: number }) => sum + (p.downloads || 0), 0)

  return NextResponse.json({
    totalPapers: totalPapers || 0,
    pendingPapers: pendingPapers || 0,
    approvedPapers: approvedPapers || 0,
    totalUsers: totalUsers || 0,
    totalInsights: totalInsights || 0,
    totalChallenges: totalChallenges || 0,
    totalDownloads,
  })
}
