import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join, extname } from 'path'

const EXTENSIONS = new Set(['.tsx','.ts','.css','.json','.md','.mjs','.sql','.html','.txt'])
const SKIP_DIRS = new Set(['node_modules','.git','.next','dist','build'])

let count = 0

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) { walk(full); continue }
    if (!EXTENSIONS.has(extname(entry))) continue

    const content = readFileSync(full, 'utf8')
    if (!/quantora-next/i.test(content)) continue

    const updated = content
      .replace(/QUANTORA-NEXT/g, 'QUANTORA-NEXT')
      .replace(/Quantora-NEXT/g, 'Quantora-NEXT')
      .replace(/quantora-next/g, 'quantora-next')

    writeFileSync(full, updated, 'utf8')
    console.log('Updated:', full)
    count++
  }
}

walk('.')
console.log(`\nDone! Updated ${count} files.`)
