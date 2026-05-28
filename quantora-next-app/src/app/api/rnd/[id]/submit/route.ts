import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST /api/rnd/[id]/submit — submit a solution to a challenge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isSupabaseEnabled) {
    try {
      const localEmail = request.cookies.get('quantora_local_email')?.value
      if (!localEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const user = await prisma.user.findUnique({
        where: { email: localEmail }
      })
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { title, description, file_url } = await request.json()
      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
      }

      // Simulate submission in SQLite by incrementing the solutions count
      await prisma.rndChallenge.update({
        where: { id },
        data: {
          solutionsCount: { increment: 1 }
        }
      })

      // Update reputation points locally for submitting solution
      await prisma.user.update({
        where: { id: user.id },
        data: { reputation: { increment: 50 } }
      })

      return NextResponse.json({
        submission: {
          id: `sub_${Date.now()}`,
          challenge_id: id,
          user_id: user.id,
          title,
          description,
          file_url: file_url || null,
          status: 'PENDING',
          created_at: new Date().toISOString()
        }
      }, { status: 201 })
    } catch (e: any) {
      console.error('Prisma POST /api/rnd/[id]/submit error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, file_url } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('rnd_submissions')
      .insert({
        challenge_id: id,
        user_id: user.id,
        title,
        description,
        file_url: file_url || null,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Increment solutions count
    await supabase.rpc('increment_solutions', { challenge_id: id }).catch(() => {
      supabase.from('rnd_challenges')
        .update({ solutions_count: supabase.rpc('solutions_count_increment' as never) })
        .eq('id', id)
    })

    return NextResponse.json({ submission: data }, { status: 201 })
  } catch (err: any) {
    console.error('Supabase submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

