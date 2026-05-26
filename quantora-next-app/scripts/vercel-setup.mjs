// Adds all env vars to the Vercel project via API, then triggers a production deployment

const TOKEN = process.env.VERCEL_TOKEN || ''
const PROJECT_NAME = 'quantora-next-app'
const TEAM_SLUG = 'xsukunas-projects'

const ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL',      value: process.env.NEXT_PUBLIC_SUPABASE_URL || '',      type: 'plain' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', type: 'plain' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',     value: process.env.SUPABASE_SERVICE_ROLE_KEY || '',     type: 'encrypted' },
  { key: 'GROQ_API_KEY',                  value: process.env.GROQ_API_KEY || '',                  type: 'encrypted' },
  { key: 'GEMINI_API_KEY',                value: process.env.GEMINI_API_KEY || '',                type: 'encrypted' },
  { key: 'NEXT_PUBLIC_APP_URL',           value: process.env.NEXT_PUBLIC_APP_URL || '',           type: 'plain' },
]

const TARGETS = ['production', 'preview', 'development']
const BASE = 'https://api.vercel.com'

async function getProjectId() {
  const res = await fetch(`${BASE}/v9/projects/${PROJECT_NAME}?teamId=${TEAM_SLUG}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  const data = await res.json()
  console.log('Project ID:', data.id, '| Name:', data.name)
  return data.id
}

async function upsertEnvVar(projectId, key, value, type) {
  // Try to add (will update if already exists via upsert)
  const res = await fetch(`${BASE}/v10/projects/${projectId}/env?upsert=true&teamId=${TEAM_SLUG}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, type, target: TARGETS })
  })
  const data = await res.json()
  if (res.ok) {
    console.log(`✅ ${key}`)
  } else {
    console.error(`❌ ${key}:`, data.error?.message || JSON.stringify(data))
  }
}

async function triggerDeploy(projectId) {
  // Get the latest git commit SHA
  const res = await fetch(`${BASE}/v13/deployments?projectId=${projectId}&teamId=${TEAM_SLUG}&limit=1`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  const data = await res.json()
  console.log('\nTriggering new production deployment...')

  // Create deployment from git
  const deployRes = await fetch(`${BASE}/v13/deployments?teamId=${TEAM_SLUG}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: PROJECT_NAME,
      gitSource: {
        type: 'github',
        repoId: data.deployments?.[0]?.meta?.githubRepoId,
        ref: 'main',
        sha: data.deployments?.[0]?.meta?.githubCommitSha,
      },
      target: 'production',
    })
  })
  const deployData = await deployRes.json()
  if (deployRes.ok) {
    console.log('✅ Deployment triggered!')
    console.log('🔗 URL:', deployData.url ? `https://${deployData.url}` : 'check vercel dashboard')
    console.log('🔍 Inspect:', deployData.inspectorUrl || 'https://vercel.com/dashboard')
  } else {
    console.log('ℹ️  Deploy via CLI instead')
    console.log(JSON.stringify(deployData, null, 2))
  }
}

async function main() {
  console.log('=== Adding env vars to Vercel project ===\n')
  const projectId = await getProjectId()
  for (const { key, value, type } of ENV_VARS) {
    await upsertEnvVar(projectId, key, value, type)
  }
  await triggerDeploy(projectId)
}

main().catch(console.error)
