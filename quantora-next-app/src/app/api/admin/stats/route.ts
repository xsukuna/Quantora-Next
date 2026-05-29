import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/admin/stats — platform-wide statistics
export async function GET(request: NextRequest) {
  if (!isSupabaseEnabled) {
    // ── Local/Prisma auth check ──────────────────────────────────────
    const cookieHeader = request.headers.get('cookie') || ''
    const emailMatch = cookieHeader.match(/(?:^|;\s*)quantora_local_email=([^;]+)/)
    const localEmail = emailMatch ? decodeURIComponent(emailMatch[1]) : null

    if (!localEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({ where: { email: localEmail }, select: { role: true } })
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
    }
    // ── End auth check ───────────────────────────────────────────────
    try {
      const [
        totalPapers,
        pendingPapers,
        approvedPapers,
        totalUsers,
        totalInsights,
        totalChallenges,
        downloadData
      ] = await Promise.all([
        prisma.paper.count(),
        prisma.paper.count({ where: { status: 'PENDING' } }),
        prisma.paper.count({ where: { status: 'APPROVED' } }),
        prisma.user.count(),
        prisma.insight.count(),
        prisma.rndChallenge.count(),
        prisma.paper.findMany({ select: { downloads: true } })
      ])

      const totalDownloads = downloadData.reduce((sum, p) => sum + (p.downloads || 0), 0)

      return NextResponse.json({
        totalPapers,
        pendingPapers,
        approvedPapers,
        totalUsers,
        totalInsights,
        totalChallenges,
        totalDownloads,
      })
    } catch (e: any) {
      console.error('Prisma GET /api/admin/stats error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
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
      admin.from('Paper').select('*', { count: 'exact', head: true }),
      admin.from('Paper').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      admin.from('Paper').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('insights').select('*', { count: 'exact', head: true }),
      admin.from('rnd_challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    const { data: downloadData } = await admin.from('Paper').select('downloads')
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
  } catch (err: any) {
    console.error('Admin stats fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

