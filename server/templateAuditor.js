/**
 * templateAuditor.js
 *
 * Core audit logic — importable by the server OR runnable as a CLI script.
 *
 * CLI usage:
 *   node server/templateAuditor.js                   # audit all, report only
 *   node server/templateAuditor.js --fix             # audit + auto-fix
 *   node server/templateAuditor.js --template=72     # single template
 *   node server/templateAuditor.js --skip-render     # static analysis only
 *
 * Best Gemini models:
 *   Vision analysis  → gemini-3.1-pro   (most accurate multimodal reasoning)
 *   Code fix gen     → gemini-3.1-flash (fast, cheap, already used in project)
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { renderStill } from './engines/remotion/renderer.js'
import { googleAI } from './services/llm.js'
import { getGoogleKey } from './settings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Models ───────────────────────────────────────────────────────────────────
export const VISION_MODEL = 'gemini-3.1-pro-preview'       // screenshot → issue detection
export const FIX_MODEL    = 'gemini-3.1-flash-lite-preview' // TSX code → fixed TSX code

// ─── Paths ────────────────────────────────────────────────────────────────────
export const TEMPLATES_DIR = join(__dirname, 'templates')
export const AUDIT_DIR     = join(__dirname, '../public/audit-screenshots')
export const REPORT_PATH   = join(__dirname, '../public/audit-report.json')

// ─── Sample fill values ───────────────────────────────────────────────────────
const SAMPLE = {
  BACKGROUND_COLOR:  '#0d0d0d',
  PRIMARY_COLOR:     '#ffffff',
  SECONDARY_COLOR:   '#cccccc',
  ACCENT_COLOR:      '#e63946',
  SUPPORT_COLOR:     '#888888',
  TEXT_ON_PRIMARY:   '#ffffff',
  TEXT_ON_SECONDARY: '#000000',
  TITLE_TEXT:        'SAMPLE TITLE',
  COUNT_VALUE:       '25B',
  COUNT_LABEL:       'TOTAL BREACHES',
  SUB_LABEL:         'BILLION DOLLARS LOST',
  CONTEXT_TEXT:      'Supporting context text displayed here for reference',
  CHAPTER_WORD:      'CHAPTER ONE',
  CHAPTER_SUB:       'CORPORATE CYBERATTACK',
  CHAPTER_NUMBER:    'I',
  TAG_1:             'CRITICAL',
  TAG_2:             'HIGH',
  LABEL_1:           'Label A',
  LABEL_2:           'Label B',
  LABEL_3:           'Label C',
  VALUE_1:           '1,200',
  VALUE_2:           '870',
  VALUE_3:           '450',
  STAT_1:            '94%',
  STAT_2:            '12K',
  STAT_3:            '$4.5M',
  BAR_1_VALUE:       '85',
  BAR_2_VALUE:       '62',
  BAR_3_VALUE:       '41',
  NODE_1:            'Server A',
  NODE_2:            'Server B',
  ACTOR_NAME:        'LAZARUS GROUP',
  ACTOR_ORIGIN:      'North Korea',
  COMPANY_NAME:      'ACME CORP',
  QUOTE_TEXT:        'Sample quote text for audit rendering purposes.',
  SOURCE_TEXT:       'Source: Audit Sample',
  PHASE_1:           'Discovery',
  PHASE_2:           'Exploitation',
  PHASE_3:           'Exfiltration',
  STEP_1:            'Step One',
  STEP_2:            'Step Two',
  STEP_3:            'Step Three',
}

// ─── Static analysis rules ────────────────────────────────────────────────────
const STATIC_RULES = [
  {
    id: 'hardcoded_stub_number',
    severity: 'error',
    description: 'Hardcoded stub target number — does not read from template placeholder',
    test: (code) => {
      const m = code.match(/const\s+(?:targetNumber|stubTarget|hardcoded\w*)\s*=\s*(\d+)/)
      if (m) return `Found: const ... = ${m[1]}`
      return null
    },
  },
  {
    id: 'overflow_hidden_fixed_height',
    severity: 'warning',
    description: 'Container with overflow:hidden and fixed height may clip text',
    test: (code) => {
      const blocks = code.match(/style=\{\{[^}]{0,600}\}\}/gs) || []
      const risky = blocks.filter(b => {
        const hasOverflowHidden = /overflow:\s*['"]hidden['"]/.test(b)
        const heightMatch = b.match(/height:\s*(\d+)/)
        const fontMatch = b.match(/fontSize:\s*(\d+)/)
        if (!hasOverflowHidden || !heightMatch || !fontMatch) return false
        const h = parseInt(heightMatch[1])
        const f = parseInt(fontMatch[1])
        return f >= 80 && h < f * 2.5
      })
      if (risky.length > 0) return `${risky.length} container(s) with tight height+overflow:hidden for large fonts`
      return null
    },
  },
  {
    id: 'missing_placeholder_parse',
    severity: 'warning',
    description: 'Template animates a count value but never parses it as a number',
    test: (code) => {
      const hasCountValue = /COUNT_VALUE|STAT_VALUE|NUMBER_VALUE/.test(code)
      const hasParseFloat = /parseFloat|parseInt|Number\(/.test(code)
      const hasCountProgress = /countProgress|countAnim|interpolate.*0.*1/.test(code)
      if (hasCountValue && hasCountProgress && !hasParseFloat) {
        return 'Uses COUNT_VALUE in animation but never calls parseFloat/parseInt on it'
      }
      return null
    },
  },
  {
    id: 'text_nowrap_overflow',
    severity: 'warning',
    description: 'whiteSpace:nowrap used — long text values will overflow silently',
    test: (code) => {
      const m = code.match(/whiteSpace:\s*['"]nowrap['"]/)
      if (m) return 'whiteSpace:nowrap found on text container'
      return null
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fillPlaceholders(code) {
  let filled = code
  for (const [key, val] of Object.entries(SAMPLE)) {
    filled = filled.replaceAll(`"${key}"`, JSON.stringify(val))
    filled = filled.replaceAll(`'${key}'`, JSON.stringify(val))
  }
  return filled
}

// Fill placeholders with user-provided values, falling back to SAMPLE for anything missing
export function fillForPreview(code, userValues = {}) {
  const merged = { ...SAMPLE, ...userValues }
  let filled = code
  for (const [key, val] of Object.entries(merged)) {
    filled = filled.replaceAll(`"${key}"`, JSON.stringify(String(val)))
    filled = filled.replaceAll(`'${key}'`, JSON.stringify(String(val)))
  }
  return filled
}

export function runStaticAnalysis(code, filename) {
  const issues = []
  for (const rule of STATIC_RULES) {
    const result = rule.test(code)
    if (result) {
      issues.push({
        source: 'static',
        id: rule.id,
        severity: rule.severity,
        description: rule.description,
        detail: result,
        file: filename,
      })
    }
  }
  return issues
}

export async function renderTemplateStill(code, outputPath) {
  const filledCode = fillPlaceholders(code)
  await renderStill(filledCode, outputPath, -1, {})
}

export async function analyzeScreenshotWithGemini(imagePath, templateName) {
  const imageData = await readFile(imagePath)
  const base64 = imageData.toString('base64')
  const model = googleAI.getGenerativeModel({ model: VISION_MODEL })

  const prompt = `You are a video animation quality auditor reviewing a screenshot from a Remotion animation template called "${templateName}".

Analyze this screenshot carefully and identify ALL visual issues. Look for:
1. Text that is clipped, cut off, or partially hidden by container boundaries
2. Numbers that seem wrong (e.g. a counter stuck at 0 or showing a hardcoded stub value)
3. Elements that are invisible, fully transparent, or off-screen
4. Text that overflows its container or is too large for its box
5. Empty/blank areas where content should be visible
6. Layout issues — elements overlapping incorrectly or badly misaligned
7. Placeholder text that was NOT replaced (literally shows "TITLE_TEXT" or "COUNT_VALUE")
8. Animation frozen at an unexpected state (e.g. stuck at frame 0)

Respond with a JSON array of issues. Each issue:
{
  "id": "short_snake_case_id",
  "severity": "error" | "warning" | "info",
  "description": "clear one-sentence description of the problem",
  "location": "which element / area of the screen",
  "fix_hint": "brief suggestion for fixing it in the TSX code"
}

If no issues, return: []
Respond ONLY with the JSON array, no other text.`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'image/png', data: base64 } }
  ])

  const text = result.response.text().trim()
  try {
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(clean)
  } catch {
    return []
  }
}

export async function generateFix(code, issues, templateName) {
  const model = googleAI.getGenerativeModel({ model: FIX_MODEL })
  const issueList = issues.map((i, n) =>
    `${n + 1}. [${i.severity.toUpperCase()}] ${i.description}${i.detail ? ` — ${i.detail}` : ''}${i.fix_hint ? ` | Fix hint: ${i.fix_hint}` : ''}`
  ).join('\n')

  const prompt = `You are fixing a Remotion animation template called "${templateName}".

The following issues were detected:
${issueList}

Here is the FULL current template code:
\`\`\`tsx
${code}
\`\`\`

Fix ALL the issues listed above. Rules:
- Preserve all placeholder strings like "BACKGROUND_COLOR", "COUNT_VALUE", "TITLE_TEXT" etc — do NOT hardcode values
- For number animations: use parseFloat(countValue.replace(/[^0-9.]/g, '')) to extract the numeric part
- For text clipping: increase container height, use flexWrap or adjustable fontSize
- Do NOT change the visual design, layout, colors, or animation style — only fix the bugs
- Return ONLY the complete fixed TSX file, no explanation, no markdown fences

Fixed code:`

  const result = await model.generateContent(prompt)
  let fixed = result.response.text().trim()
  fixed = fixed.replace(/^```(?:tsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '')
  return fixed
}

// ─── Main audit function (used by server endpoint and CLI) ────────────────────

/**
 * Audit a single template file.
 * @param {string} filePath
 * @param {{ skipRender?: boolean }} options
 * @param {function} onProgress  callback({ stage, message })
 */
export async function auditTemplate(filePath, options = {}, onProgress = null) {
  const filename = basename(filePath)
  const name = filename.replace('.tsx', '')
  const code = await readFile(filePath, 'utf-8')
  const issues = []

  // Static analysis
  onProgress?.({ stage: 'static', message: 'Running static analysis...' })
  const staticIssues = runStaticAnalysis(code, filename)
  issues.push(...staticIssues)

  let screenshotUrl = null

  if (!options.skipRender) {
    await mkdir(AUDIT_DIR, { recursive: true })
    const screenshotPath = join(AUDIT_DIR, `${name}.png`)

    try {
      onProgress?.({ stage: 'render', message: 'Rendering still frame...' })
      await renderTemplateStill(code, screenshotPath)
      screenshotUrl = `/audit-screenshots/${name}.png`

      onProgress?.({ stage: 'vision', message: `Analyzing with ${VISION_MODEL}...` })
      const visionIssues = await analyzeScreenshotWithGemini(screenshotPath, name)
      visionIssues.forEach(i => { i.source = 'vision'; i.file = filename })
      issues.push(...visionIssues)
    } catch (err) {
      issues.push({
        source: 'render_error',
        id: 'render_failed',
        severity: 'error',
        description: `Template failed to render: ${err.message}`,
        file: filename,
      })
    }
  }

  return { name, filename, filePath, issues, screenshotUrl }
}

/**
 * Apply an auto-fix to a template that has issues.
 * Returns true if the file was updated.
 */
export async function applyFix(result) {
  const { filename, filePath, issues } = result
  const fixable = issues.filter(i => i.severity === 'error' || i.severity === 'warning')
  if (fixable.length === 0) return false

  const code = await readFile(filePath, 'utf-8')
  const fixed = await generateFix(code, fixable, result.name)

  if (!fixed.includes('AnimationComponent') || !fixed.includes('useCurrentFrame')) {
    throw new Error('Fix generation produced invalid component code')
  }
  await writeFile(filePath, fixed, 'utf-8')
  return true
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const doFix      = args.includes('--fix')
  const skipRender = args.includes('--skip-render')
  const tplArg     = args.find(a => a.startsWith('--template='))
  const tplNum     = tplArg ? tplArg.split('=')[1] : null

  console.log('╔══════════════════════════════════════╗')
  console.log('║     Director Template Auditor        ║')
  console.log(`║  Vision : ${VISION_MODEL.padEnd(26)}║`)
  console.log(`║  Fix    : ${FIX_MODEL.padEnd(26)}║`)
  console.log(`║  Mode   : ${(doFix ? 'audit + fix' : 'report only').padEnd(26)}║`)
  console.log('╚══════════════════════════════════════╝')

  if (!getGoogleKey()) { console.error('❌ GOOGLE_AI_API_KEY not set'); process.exit(1) }

  await mkdir(AUDIT_DIR, { recursive: true })

  const allFiles = (await readdir(TEMPLATES_DIR)).filter(f => f.endsWith('.tsx')).sort()
  const targets  = tplNum
    ? allFiles.filter(f => f.startsWith(tplNum + '-') || f.startsWith(tplNum.padStart(2, '0') + '-'))
    : allFiles

  if (targets.length === 0) { console.error(`❌ No templates match --template=${tplNum}`); process.exit(1) }

  console.log(`\nAuditing ${targets.length} template(s)...\n`)

  const report = { timestamp: new Date().toISOString(), results: [], summary: {} }
  let fixedCount = 0

  for (const filename of targets) {
    const filePath = join(TEMPLATES_DIR, filename)
    process.stdout.write(`▶ ${filename} `)
    const result = await auditTemplate(filePath, { skipRender }, ({ stage }) => process.stdout.write(`[${stage}]`))
    console.log(` → ${result.issues.length} issue(s)`)
    result.issues.forEach(i => console.log(`   [${i.severity.toUpperCase()}] ${i.description}`))
    report.results.push(result)

    if (doFix && result.issues.some(i => i.severity === 'error' || i.severity === 'warning')) {
      try {
        const fixed = await applyFix(result)
        if (fixed) { fixedCount++; console.log(`   ✅ Fixed`) }
      } catch (err) {
        console.warn(`   ⚠ Fix failed: ${err.message}`)
      }
    }
  }

  const total    = report.results.reduce((n, r) => n + r.issues.length, 0)
  const errors   = report.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'error').length, 0)
  const warnings = report.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'warning').length, 0)
  const clean    = report.results.filter(r => r.issues.length === 0).length

  report.summary = { templates: targets.length, clean, withIssues: targets.length - clean, totalIssues: total, errors, warnings, fixed: fixedCount }
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8')

  console.log(`\n${'═'.repeat(42)}`)
  console.log(`  Audited: ${targets.length}  |  Clean: ${clean}  |  Issues: ${total} (${errors} err, ${warnings} warn)`)
  if (doFix) console.log(`  Fixed: ${fixedCount}`)
  console.log(`  Report: .temp/audit/report.json`)
  console.log('═'.repeat(42))
}

// Run CLI only when executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) main().catch(err => { console.error('Fatal:', err); process.exit(1) })
