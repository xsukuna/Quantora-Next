// Add force-dynamic to all pages that use Supabase/client hooks
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join, extname } from 'path'

const SKIP = new Set(['node_modules', '.git', '.next'])
const MARKER = "export const dynamic = 'force-dynamic'"

// Pages that need force-dynamic
const TARGET_PAGES = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/signup/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/ai-assistant/page.tsx',
  'src/app/insights/page.tsx',
  'src/app/library/page.tsx',
  'src/app/profiles/page.tsx',
  'src/app/rnd-lab/page.tsx',
  'src/app/submit/page.tsx',
  'src/app/terminal/page.tsx',
  'src/app/climate/page.tsx',
  'src/app/institutional/page.tsx',
  'src/app/page.tsx',
]

let count = 0
for (const rel of TARGET_PAGES) {
  const full = join('.', rel)
  try {
    const content = readFileSync(full, 'utf8')
    if (content.includes(MARKER)) {
      console.log(`Already has dynamic: ${rel}`)
      continue
    }
    // Add after the last import line
    const lines = content.split('\n')
    let lastImport = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith("'use client'") || lines[i].startsWith('"use client"')) {
        lastImport = i
      }
    }
    lines.splice(lastImport + 1, 0, '', MARKER)
    writeFileSync(full, lines.join('\n'), 'utf8')
    console.log(`✅ Added dynamic to: ${rel}`)
    count++
  } catch (e) {
    console.log(`⚠️  Skipped (not found): ${rel}`)
  }
}
console.log(`\nDone! Updated ${count} files.`)
