import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import prisma from '@/lib/prisma'

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseEnabled) {
      // Local Auth Mode
      const emailCookie = request.cookies.get('quantora_local_email')?.value
      if (!emailCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { email: emailCookie }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const profile = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        badge: user.badge,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt.toISOString()
      }

      return NextResponse.json({ profile }, { status: 200 })
    }

    // Supabase Mode
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role/admin client to bypass RLS SELECT blocks on profiles table
    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      console.log(`Profile fetch error or missing profile for ${user.id}. Attempting self-healing...`)
      // Profile does not exist or fetch failed; self-heal by creating a new contributor profile
      const email = user.email
      const cleanEmail = email?.toLowerCase().trim() || ''
      const username = user.user_metadata?.username || cleanEmail.split('@')[0] || `user_${user.id.substring(0, 8)}`
      const name = user.user_metadata?.name || username
      const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
      
      const { data: newProfile, error: insertError } = await admin
        .from('profiles')
        .insert({
          id: user.id,
          email: cleanEmail,
          username: username.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
          name,
          avatarUrl,
          role: 'CONTRIBUTOR',
          reputation: 10,
          badge: 'Fellow Contributor'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to self-heal profile in secure API:', insertError.message)
        return NextResponse.json({ error: 'Failed to fetch or create user profile' }, { status: 500 })
      }

      const mergedProfile = {
        ...newProfile,
        bio: user.user_metadata?.bio || null,
        institution: user.user_metadata?.institution || null,
        country: user.user_metadata?.country || null,
        website: user.user_metadata?.website || null,
        linkedin: user.user_metadata?.linkedin || null,
        orcid: user.user_metadata?.orcid || null,
      }

      return NextResponse.json({ profile: mergedProfile }, { status: 200 })
    }

    const mergedProfile = {
      ...profile,
      bio: user.user_metadata?.bio || null,
      institution: user.user_metadata?.institution || null,
      country: user.user_metadata?.country || null,
      website: user.user_metadata?.website || null,
      linkedin: user.user_metadata?.linkedin || null,
      orcid: user.user_metadata?.orcid || null,
    }

    return NextResponse.json({ profile: mergedProfile }, { status: 200 })
  } catch (err: any) {
    console.error('Profile fetch API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
