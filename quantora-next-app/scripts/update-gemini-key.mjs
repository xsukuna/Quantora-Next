const TOKEN = 'vca_38zvqVnEbSAlSJguEjlMjg9CpD0LWUROntdsTG9JefmJuPGV2v1Oc1y4'
const PROJECT_ID = 'prj_IDLPWC54d3J0AF7iv8ZSv5cKxvPT'
const TEAM = 'xsukunas-projects'

const res = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'GEMINI_API_KEY',
    value: 'AIzaSyAWdFvI6dd93N1G8pZblx9dMLffPjBWors',
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  })
})
const data = await res.json()
if (res.ok) {
  console.log('✅ GEMINI_API_KEY updated on Vercel!')
} else {
  console.error('❌ Error:', data.error?.message || JSON.stringify(data))
}
