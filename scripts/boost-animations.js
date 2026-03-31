/**
 * boost-animations.js
 * Bulk-transforms all Remotion template .tsx files to make:
 *   - Entrance zoom-ins more dramatic (smaller start scale)
 *   - Ken Burns background pans more pronounced
 *   - Card/element drop shadows deeper and more visible
 *
 * Run: node scripts/boost-animations.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, '../server/templates')

// ─── Scale transformations ───────────────────────────────────────────���────────
// Each entry: [searchRegex, replacement]
// Only targets the numeric range pairs used inside interpolate() calls.
const SCALE_RULES = [
  // Entrance: element appears at 95% → more dramatic 82%
  [/\[0\.95,\s*1\]/g,           '[0.82, 1]'],
  // Entrance: barely-there 98% → visible 88%
  [/\[0\.98,\s*1\]/g,           '[0.88, 1]'],
  // Entrance: 92% → 80%
  [/\[0\.92,\s*1\]/g,           '[0.80, 1]'],
  // Entrance: already bold 85% → even bolder 75%
  [/\[0\.85,\s*1\]/g,           '[0.75, 1]'],

  // Ken Burns zoom-out (image/bg starts zoomed in, eases out to 100%)
  [/\[1\.05,\s*1(?!\.\d)\]/g,   '[1.20, 1]'],
  [/\[1\.08,\s*1(?!\.\d)\]/g,   '[1.22, 1]'],
  [/\[1\.1,\s*1(?!\.\d)\]/g,    '[1.25, 1]'],
  [/\[1\.12,\s*1(?!\.\d)\]/g,   '[1.28, 1]'],
  [/\[1\.15,\s*1(?!\.\d)\]/g,   '[1.30, 1]'],

  // Ken Burns zoom-in (image/bg starts at 100%, slowly zooms in)
  [/\[1(?!\.),\s*1\.05\]/g,     '[1, 1.20]'],
  [/\[1(?!\.),\s*1\.08\]/g,     '[1, 1.22]'],
  [/\[1(?!\.),\s*1\.1\b\]/g,    '[1, 1.25]'],
  [/\[1(?!\.),\s*1\.12\]/g,     '[1, 1.28]'],
  [/\[1(?!\.),\s*1\.15\]/g,     '[1, 1.30]'],
]

// ─── Shadow boost ─────────────────────────────────────────────────────────────
// Process boxShadow / textShadow values in-line.
// Multiplies: Y-offset ×1.4, blur ×1.6, spread ×1.4, rgba alpha ×1.6 (cap 0.92)
function boostShadowValue(shadowStr) {
  // Match individual shadow layers, e.g.: 0 20px 40px rgba(0,0,0,0.5)
  // Also handles: 0 0 20px COLOR  (glow shadows)
  return shadowStr.replace(
    /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?/g,
    (match, x, y, blur, spread) => {
      const nx = parseFloat(x) // don't touch X offset
      const ny = Math.round(parseFloat(y) * 1.4)
      const nblur = Math.round(parseFloat(blur) * 1.6)
      const nspread = spread !== undefined ? Math.round(parseFloat(spread) * 1.4) : null
      const spreadPart = nspread !== null ? ` ${nspread}px` : ''
      return `${nx}px ${ny}px ${nblur}px${spreadPart}`
    }
  ).replace(
    // Boost rgba(0,0,0,alpha) alpha
    /rgba\(0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\)/g,
    (_, a) => {
      const boosted = Math.min(0.92, parseFloat(a) * 1.6)
      return `rgba(0,0,0,${boosted.toFixed(2)})`
    }
  ).replace(
    // Also boost rgba(r,g,b,alpha) glow shadows (coloured glows)
    /rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\)/g,
    (_, r, g, b, a) => {
      if (r === '0' && g === '0' && b === '0') return _  // already handled above
      const boosted = Math.min(0.85, parseFloat(a) * 1.5)
      return `rgba(${r},${g},${b},${boosted.toFixed(2)})`
    }
  )
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8')
  const original = code

  // 1. Scale transformations
  for (const [regex, replacement] of SCALE_RULES) {
    code = code.replace(regex, replacement)
  }

  // 2. Shadow boosts — only inside boxShadow / textShadow / filter:drop-shadow values
  code = code.replace(
    /(boxShadow|textShadow)\s*:\s*([`'"])(.*?)\2/g,
    (match, prop, quote, value) => {
      const boosted = boostShadowValue(value)
      return `${prop}: ${quote}${boosted}${quote}`
    }
  )

  // Template literal shadows (boxShadow: `...${expr}...`)
  code = code.replace(
    /(boxShadow|textShadow)\s*:\s*`([^`]*)`/g,
    (match, prop, value) => {
      const boosted = boostShadowValue(value)
      return `${prop}: \`${boosted}\``
    }
  )

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8')
    return true
  }
  return false
}

// ─── Run ──────────────────────────────────────────────────────────────────────
const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.tsx'))
let changed = 0

for (const file of files) {
  const fp = path.join(TEMPLATES_DIR, file)
  if (processFile(fp)) {
    console.log(`  ✅ ${file}`)
    changed++
  }
}

console.log(`\nDone. ${changed} / ${files.length} templates updated.`)
