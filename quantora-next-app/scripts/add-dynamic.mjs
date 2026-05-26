// Fix: properly insert force-dynamic AFTER all imports are complete
import { readFileSync, writeFileSync } from 'fs'

const MARKER = "export const dynamic = 'force-dynamic'"

const FILES = [
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

for (const rel of FILES) {
  try {
    let content = readFileSync(rel, 'utf8')

    // 1. Remove any existing badly-placed MARKER first
    content = content.replace(/\n?\nexport const dynamic = 'force-dynamic'\n?/g, '\n')
    content = content.replace(/^export const dynamic = 'force-dynamic'\n/gm, '')

    // 2. Find the index of the last import line
    //    Walk line by line; track if we're inside a multi-line import
    const lines = content.split('\n')
    let insideImport = false
    let lastImportEnd = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!insideImport) {
        // Single-line import: import X from 'y'
        if (line.startsWith('import ') && line.includes(' from ')) {
          lastImportEnd = i
        }
        // Multi-line import starts: import {
        else if (line.startsWith('import ') || line === "import {") {
          insideImport = true
        }
        // 'use client' directive
        else if (line === "'use client'" || line === '"use client"') {
          lastImportEnd = i
        }
      } else {
        // Look for closing of multi-line import: } from 'module'
        if (line.includes('} from ') || line.match(/^}\s*from\s+['"].+['"]$/)) {
          lastImportEnd = i
          insideImport = false
        }
      }
    }

    if (lastImportEnd === -1) {
      console.log(`⚠️  Could not find imports in: ${rel}`)
      continue
    }

    // 3. Insert marker right after the last import line
    lines.splice(lastImportEnd + 1, 0, '', MARKER)
    writeFileSync(rel, lines.join('\n'), 'utf8')
    console.log(`✅ Fixed: ${rel} (after line ${lastImportEnd + 1})`)
  } catch (e) {
    console.log(`⚠️  Skipped: ${rel} — ${e.message}`)
  }
}
console.log('\nDone!')
