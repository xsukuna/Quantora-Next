// Quantora Analytics — Direct Supabase Seed Script
// Runs with: node scripts/seed.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dkfbejjairxpzjhhuisq.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmJlamphaXJ4cHpqaGh1aXNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMjIwMCwiZXhwIjoyMDk1Mjk4MjAwfQ.gSZvCJO-puR76gmlvzT5Kg5-DM8BoGIqn7KwYwmWQU4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('🚀 Quantora Analytics — Supabase Seed Script\n')

  // ── 1. Confirm admin user emails ──────────────────────────────────
  console.log('Step 1: Confirming admin user accounts...')
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('  ❌ Could not list users:', listErr.message) }
  else {
    for (const u of users.users) {
      if (['scarfaceatwork@gmail.com','scarfaceatwork@outlook.com'].includes(u.email)) {
        const { error } = await supabase.auth.admin.updateUserById(u.id, {
          email_confirm: true,
          user_metadata: { name: 'Aditya Kaushik' }
        })
        if (error) console.error(`  ❌ Failed to confirm ${u.email}:`, error.message)
        else console.log(`  ✅ Confirmed: ${u.email} (id: ${u.id})`)

        // Set ADMIN role in profiles
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ role: 'ADMIN', name: 'Aditya Kaushik', badge: 'Lead Architect', reputation: 980 })
          .eq('id', u.id)
        if (profileErr) console.error(`  ❌ Failed to set admin role:`, profileErr.message)
        else console.log(`  ✅ Admin role set for ${u.email}`)
      }
    }
    if (users.users.length === 0) {
      console.log('  ⚠️  No users found yet — sign up first at /signup')
    }
  }

  // ── 2. Seed R&D Challenges ────────────────────────────────────────
  console.log('\nStep 2: Seeding R&D Challenges...')
  const challenges = [
    {
      title: 'AI-Driven Crop Yield Prediction for Indian Agriculture',
      description: 'Build a ML model predicting district-level crop yields using satellite imagery and weather data for 5 major crops across 3 states.',
      details: 'Dataset from ICRISAT and IMD. Deliverable: working API + model card + accuracy report. Winner featured in Quantora Annual Research Report.',
      category: 'Public Policy',
      difficulty: 'Advanced',
      reward: '₹2,00,000 + Publication Credit',
      rep_award: 500,
      sponsor: 'Quantora Analytics Institute',
      is_active: true,
      teams_count: 0,
      solutions_count: 0,
    },
    {
      title: 'Sovereign Debt Stress Index for Emerging Markets',
      description: 'Develop a real-time composite index measuring sovereign debt stress across 20+ emerging markets using bond yield, CDS spread, and reserve data.',
      details: 'Use IMF and World Bank data. Deliverable: methodology paper + live dashboard. Judged on index validity and explanatory power.',
      category: 'Macroeconomics',
      difficulty: 'Expert',
      reward: '$5,000 USD + Co-authorship',
      rep_award: 750,
      sponsor: 'Global Finance Research Consortium',
      is_active: true,
      teams_count: 0,
      solutions_count: 0,
    },
    {
      title: 'Geopolitical Risk Quantification Tool',
      description: 'Create a scoring framework quantifying geopolitical risk for bilateral trade relationships using NLP on news sources and UN voting records.',
      details: 'Deliverable: Python library + scoring methodology + validation. Data sources: GDELT, UN comtrade, ACLED.',
      category: 'Geopolitics',
      difficulty: 'Intermediate',
      reward: '₹75,000 + Platform Badge',
      rep_award: 300,
      sponsor: 'Quantora Analytics',
      is_active: true,
      teams_count: 0,
      solutions_count: 0,
    },
    {
      title: 'India Infrastructure Spend Efficiency Audit',
      description: 'Analyze 10 years of government infrastructure expenditure and build a district-level efficiency score comparing planned vs actual completion.',
      details: 'Data: CAG reports, Ministry of Finance budget documents. Deliverable: interactive visualization + statistical report.',
      category: 'Public Policy',
      difficulty: 'Beginner',
      reward: '₹25,000 + Certificate',
      rep_award: 150,
      sponsor: 'Quantora Analytics',
      is_active: true,
      teams_count: 0,
      solutions_count: 0,
    },
    {
      title: 'Rare Earth Supply Chain Vulnerability Model',
      description: 'Map global rare earth mineral supply chains and build a vulnerability score for 15 critical minerals with Monte Carlo disruption scenarios.',
      details: 'Use USGS and IEA data. Deliverable: network graph + Monte Carlo simulation + policy brief.',
      category: 'Climate Finance',
      difficulty: 'Advanced',
      reward: '$3,000 USD + Research Credit',
      rep_award: 600,
      sponsor: 'Critical Minerals Research Fund',
      is_active: true,
      teams_count: 0,
      solutions_count: 0,
    },
  ]

  const { data: inserted, error: challErr } = await supabase
    .from('rnd_challenges')
    .insert(challenges)
    .select('id, title')

  if (challErr) console.error('  ❌ Challenge seed failed:', challErr.message)
  else {
    console.log(`  ✅ Inserted ${inserted.length} new R&D challenges:`)
    inserted.forEach(c => console.log(`     • ${c.title}`))
  }

  // ── 3. Count total challenges ─────────────────────────────────────
  const { count } = await supabase.from('rnd_challenges').select('*', { count: 'exact', head: true })
  console.log(`\n  📊 Total challenges in DB: ${count}`)

  // ── 4. Seed sample insights (linked to admin if exists) ───────────
  console.log('\nStep 3: Seeding sample insights...')
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'ADMIN')
    .single()

  if (adminProfile) {
    const insights = [
      {
        author_id: adminProfile.id,
        content: 'Bilateral metal sanctions stress-test indicators show a structural 22% supply deficit for rare-earth and lithium processing hubs by Q4 2026. Domestic manufacturers and sovereign stockpiles remain highly vulnerable under extreme decoupling regimes.',
        category: 'Geopolitics',
        tags: 'CriticalMinerals,SupplyChains,Geopolitics',
        upvotes_count: 42,
      },
      {
        author_id: adminProfile.id,
        content: 'Emerging market clearing indices flag an unprecedented reallocation. Over $140B in central bank reserves migrated into physical nodes and non-G7 clearing routes during the current cycle. G7 yield curves are structurally underpricing this pivot.',
        category: 'Macroeconomics',
        tags: 'SovereignDebt,YieldCurves,CapitalReallocation',
        upvotes_count: 28,
      },
      {
        author_id: adminProfile.id,
        content: 'Indian agricultural credit data for FY2025-26 shows a 34% gap between sanctioned and disbursed Kisan Credit Card limits in 6 major states. The leakage is concentrated at the district cooperative bank layer — not NABARD or RBI level.',
        category: 'Public Policy',
        tags: 'Agriculture,RuralCredit,India,PublicPolicy',
        upvotes_count: 67,
      },
    ]

    const { data: insightsData, error: insightErr } = await supabase
      .from('insights')
      .insert(insights)
      .select('id, category')

    if (insightErr) console.error('  ❌ Insights seed failed:', insightErr.message)
    else console.log(`  ✅ Inserted ${insightsData.length} sample insights`)
  } else {
    console.log('  ⚠️  No admin profile found — insights will be seeded after you sign up')
  }

  console.log('\n✅ Seed complete! Visit http://localhost:3000 to see the live platform.')
}

run().catch(console.error)
