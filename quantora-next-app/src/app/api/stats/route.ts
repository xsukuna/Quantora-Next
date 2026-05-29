import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/stats — public platform-wide stats (no auth required)
export async function GET() {
  // Cache for 30 seconds
  const headers = {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  };

  if (!isSupabaseEnabled) {
    try {
      const [totalPapers, approvedPapers, totalUsers, totalInsights, downloadData] = await Promise.all([
        prisma.paper.count(),
        prisma.paper.count({ where: { status: 'APPROVED' } }),
        prisma.user.count(),
        prisma.insight.count(),
        prisma.paper.findMany({ select: { downloads: true } }),
      ]);
      const totalDownloads = downloadData.reduce((sum, p) => sum + (p.downloads || 0), 0);
      return NextResponse.json(
        { totalPapers, approvedPapers, totalUsers, totalInsights, totalDownloads },
        { headers }
      );
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // Supabase path
  try {
    const supabase = await createClient();
    const [
      { count: totalPapers },
      { count: approvedPapers },
      { count: totalUsers },
      { count: totalInsights },
    ] = await Promise.all([
      supabase.from('Paper').select('*', { count: 'exact', head: true }),
      supabase.from('Paper').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('Insight').select('*', { count: 'exact', head: true }),
    ]);
    const { data: downloadData } = await supabase.from('Paper').select('downloads');
    const totalDownloads = (downloadData || []).reduce(
      (sum: number, p: { downloads: number }) => sum + (p.downloads || 0),
      0
    );
    return NextResponse.json(
      {
        totalPapers: totalPapers ?? 0,
        approvedPapers: approvedPapers ?? 0,
        totalUsers: totalUsers ?? 0,
        totalInsights: totalInsights ?? 0,
        totalDownloads,
      },
      { headers }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
