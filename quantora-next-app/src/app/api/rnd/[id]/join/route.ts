import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST /api/rnd/[id]/join — join or leave a challenge
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

      const challenge = await prisma.rndChallenge.findFirst({
        where: {
          id,
          joinedUsers: {
            some: { id: user.id }
          }
        }
      })

      if (challenge) {
        await prisma.rndChallenge.update({
          where: { id },
          data: {
            joinedUsers: {
              disconnect: { id: user.id }
            },
            teamsCount: { decrement: 1 }
          }
        })
        return NextResponse.json({ action: 'left' })
      } else {
        await prisma.rndChallenge.update({
          where: { id },
          data: {
            joinedUsers: {
              connect: { id: user.id }
            },
            teamsCount: { increment: 1 }
          }
        })
        return NextResponse.json({ action: 'joined' })
      }
    } catch (e: any) {
      console.error('Prisma POST /api/rnd/[id]/join error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Supabase Implementation
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Proactively check and sync profile in "profiles" table to prevent foreign key violations
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      console.log(`Auto-syncing profile for auth user ${user.id} in R&D join...`)
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

    const { data: existing } = await admin
      .from('_ChallengeParticipation')
      .select('A')
      .eq('A', id)
      .eq('B', user.id)
      .single()

    if (existing) {
      await admin.from('_ChallengeParticipation').delete().eq('A', id).eq('B', user.id)
      
      const { data: challenge } = await admin.from('RndChallenge').select('teamsCount').eq('id', id).single()
      const newCount = Math.max(0, (challenge?.teamsCount || 0) - 1)
      await admin.from('RndChallenge').update({ teamsCount: newCount }).eq('id', id)

      return NextResponse.json({ action: 'left' })
    } else {
      const { error } = await admin.from('_ChallengeParticipation').insert({ A: id, B: user.id })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const { data: challenge } = await admin.from('RndChallenge').select('teamsCount').eq('id', id).single()
      const newCount = (challenge?.teamsCount || 0) + 1
      await admin.from('RndChallenge').update({ teamsCount: newCount }).eq('id', id)

      return NextResponse.json({ action: 'joined' })
    }
  } catch (err: any) {
    console.error('Supabase R&D join error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

