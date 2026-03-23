/**
 * templateAuditor.js
 *
 * Scans every template in server/templates/, renders a mid-point still,
 * runs static code analysis, then sends the screenshot to Gemini Vision
 * to detect visual issues (clipped text, wrong numbers, invisible content, etc.)
 * and optionally auto-applies fixes.
 *
 * Usage:
 *   node server/templateAuditor.js                  # audit all, report only
 *   node server/templateAuditor.js --fix             # audit + auto-fix issues
 *   node server/templateAuditor.js --template=72     # audit single template by number
 *   node server/templateAuditor.js --template=82 --fix
 *   node server/templateAuditor.js --skip-render     # static analysis only (faster)
 *
 * Best Gemini models:
 *   Vision analysis  → gemini-2.5-pro   (most accurate multimodal reasoning)
 *   Code fix gen     → gemini-2.5-flash (fast, cheap, already used in project)
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { renderStill } from './engines/remotion/renderer.js'
import { googleAI } from './services/llm.js'
import { getGoogleKey } from './settings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Models ───────────────────────────────────────────────────────────────────
const VISION_MODEL = 'gemini-2.5-pro'    // screenshot → issue detection
const FIX_MODEL    = 'gemini-2.5-flash'  // TSX code → fixed TSX code

// ─── Paths ────────────────────────────────────────────────────────────────────
const TEMPLATES_DIR = join(__dirname, 'templates')
const AUDIT_DIR     = join(__dirname, '../.temp/audit')
const REPORT_PATH   = join(__dirname, '../.temp/audit/report.json')

// ─── Sample fill values ───────────────────────────────────────────────────────
// Placeholder strings used by all templates — replaced before rendering
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
      // Detect patterns like: const targetNumber = 247
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
      // Find all style objects — look for both overflow:hidden AND height ≤ 250 near large fontSize ≥ 80
      const blocks = code.match(/style=\{\{[^}]{0,600}\}\}/gs) || []
      const risky = blocks.filter(b => {
        const hasOverflowHidden = /overflow:\s*['"]hidden['"]/.test(b)
        const heightMatch = b.match(/height:\s*(\d+)/)
        const fontMatch = b.match(/fontSize:\s*(\d+)/)
        if (!hasOverflowHidden || !heightMatch || !fontMatch) return false
        const h = parseInt(heightMatch[1])
        const f = parseInt(fontMatch[1])
        // Flag if font is large relative to container height
        return f >= 80 && h < f * 2.5
      })
      if (risky.length > 0) return `${risky.length} container(s) with tight height+overflow:hidden for large fonts`
      return null
    },
  },
  {
    id: 'missing_placeholder_parse',
    severity: 'warning',
    description: 'Template uses a number placeholder as string but never parses it to float/int',
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
    id: 'text_container_no_wrap',
    severity: 'warning',
    description: 'Text container may not handle long strings — no wrapping or font scaling',
    test: (code) => {
      // Detect whiteSpace: 'nowrap' on containers likely to have variable text
      const m = code.match(/whiteSpace:\s*['"]nowrap['"]/)
      if (m) return 'whiteSpace:nowrap used — long text values will overflow silently'
      return null
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fillPlaceholders(code) {
  let filled = code
  for (const [key, val] of Object.entries(SAMPLE)) {
    // Replace "KEY" string literals (quoted placeholders in the template)
    filled = filled.replaceAll(`"${key}"`, JSON.stringify(val))
    filled = filled.replaceAll(`'${key}'`, JSON.stringify(val))
  }
  return filled
}

function runStaticAnalysis(code, filename) {
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

async function renderTemplateStill(code, outputPath) {
  const filledCode = fillPlaceholders(code)
  // Render at frame 50 (mid-animation for most templates which run ~90 frames)
  await renderStill(filledCode, outputPath, 50, {})
}

async function analyzeScreenshotWithGemini(imagePath, templateName, code) {
  const imageData = await readFile(imagePath)
  const base64 = imageData.toString('base64')

  const model = googleAI.getGenerativeModel({ model: VISION_MODEL })

  const prompt = `You are a video animation quality auditor reviewing a screenshot from a Remotion animation template called "${templateName}".

Analyze this screenshot carefully and identify ALL visual issues. Look for:
1. Text that is clipped, cut off, or partially hidden by container boundaries
2. Numbers that seem wrong (e.g. a counter showing 247 when context suggests a different value)
3. Elements that are invisible, fully transparent, or off-screen
4. Text that overflows its container or is too large for its box
5. Empty/blank areas where content should be visible
6. Layout issues — elements overlapping incorrectly or misaligned
7. Placeholder text that was NOT replaced (e.g. literally shows "TITLE_TEXT" or "COUNT_VALUE")
8. Animation that appears frozen at an unexpected state

Respond with a JSON array of issues found. Each issue:
{
  "id": "short_snake_case_id",
  "severity": "error" | "warning" | "info",
  "description": "clear one-sentence description of the problem",
  "location": "which element / area of the screen",
  "fix_hint": "brief suggestion for fixing it in the TSX code"
}

If no issues are found, return: []

Respond ONLY with the JSON array, no other text.`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'image/png', data: base64 } }
  ])

  const text = result.response.text().trim()
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(clean)
  } catch {
    console.warn(`  ⚠ Could not parse Gemini vision response for ${templateName}`)
    return []
  }
}

async function generateFix(code, issues, templateName) {
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
- For number animations: use parseFloat(countValue.replace(/[^0-9.]/g, '')) to read the numeric value
- For text clipping: increase container height, use lineHeight: 1.1-1.2, auto-scale fontSize based on text length
- Do NOT change the visual design, layout, colors, or animation style — only fix the bugs
- Return ONLY the complete fixed TSX file, no explanation, no markdown fences

Fixed code:`

  const result = await model.generateContent(prompt)
  let fixed = result.response.text().trim()
  // Strip markdown if Gemini wraps in code fences
  fixed = fixed.replace(/^```(?:tsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '')
  return fixed
}

// ─── Main audit loop ──────────────────────────────────────────────────────────

async function auditTemplate(filePath, options) {
  const filename = basename(filePath)
  const name = filename.replace('.tsx', '')
  console.log(`\n▶ Auditing: ${filename}`)

  const code = await readFile(filePath, 'utf-8')
  const issues = []

  // 1. Static analysis (always runs)
  const staticIssues = runStaticAnalysis(code, filename)
  issues.push(...staticIssues)
  if (staticIssues.length > 0) {
    staticIssues.forEach(i => console.log(`  [${i.severity.toUpperCase()}] ${i.id}: ${i.detail}`))
  }

  // 2. Render still + vision analysis (unless --skip-render)
  let screenshotPath = null
  let visionIssues = []
  if (!options.skipRender) {
    screenshotPath = join(AUDIT_DIR, `${name}.png`)
    try {
      console.log(`  📸 Rendering still...`)
      await renderTemplateStill(code, screenshotPath)
      console.log(`  🔍 Analyzing with Gemini Vision (${VISION_MODEL})...`)
      visionIssues = await analyzeScreenshotWithGemini(screenshotPath, name, code)
      visionIssues.forEach(i => {
        i.source = 'vision'
        i.file = filename
        console.log(`  [${i.severity.toUpperCase()}] ${i.id}: ${i.description}`)
      })
      issues.push(...visionIssues)
    } catch (err) {
      console.warn(`  ⚠ Render/vision failed: ${err.message}`)
      issues.push({
        source: 'render_error',
        id: 'render_failed',
        severity: 'error',
        description: `Template failed to render: ${err.message}`,
        file: filename,
      })
    }
  }

  const errorCount  = issues.filter(i => i.severity === 'error').length
  const warnCount   = issues.filter(i => i.severity === 'warning').length
  console.log(`  → ${issues.length} issue(s): ${errorCount} error(s), ${warnCount} warning(s)`)

  return { name, filename, filePath, issues, screenshotPath }
}

async function applyFix(result) {
  const { filename, filePath, issues } = result
  const fixable = issues.filter(i => i.severity === 'error' || i.severity === 'warning')
  if (fixable.length === 0) {
    console.log(`  ✓ No fixes needed for ${filename}`)
    return false
  }

  console.log(`  🔧 Generating fix for ${filename} (${fixable.length} issue(s))...`)
  const code = await readFile(filePath, 'utf-8')

  try {
    const fixed = await generateFix(code, fixable, result.name)
    // Basic sanity check — must still export AnimationComponent
    if (!fixed.includes('AnimationComponent') || !fixed.includes('useCurrentFrame')) {
      console.warn(`  ⚠ Fix generation produced invalid code for ${filename} — skipping`)
      return false
    }
    await writeFile(filePath, fixed, 'utf-8')
    console.log(`  ✅ Fixed and saved: ${filename}`)
    return true
  } catch (err) {
    console.warn(`  ⚠ Fix generation failed for ${filename}: ${err.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const applyFixes  = args.includes('--fix')
  const skipRender  = args.includes('--skip-render')
  const templateArg = args.find(a => a.startsWith('--template='))
  const templateNum = templateArg ? templateArg.split('=')[1] : null

  console.log('╔══════════════════════════════════════╗')
  console.log('║     Director Template Auditor        ║')
  console.log(`║  Vision model : ${VISION_MODEL.padEnd(20)}║`)
  console.log(`║  Fix model    : ${FIX_MODEL.padEnd(20)}║`)
  console.log(`║  Mode         : ${(applyFixes ? 'audit + fix' : 'report only').padEnd(20)}║`)
  console.log(`║  Render       : ${(skipRender ? 'skipped (static only)' : 'enabled').padEnd(20)}║`)
  console.log('╚══════════════════════════════════════╝')

  if (!getGoogleKey()) {
    console.error('❌ GOOGLE_AI_API_KEY not configured — cannot use Gemini')
    process.exit(1)
  }

  await mkdir(AUDIT_DIR, { recursive: true })

  // Collect templates to audit
  const allFiles = (await readdir(TEMPLATES_DIR))
    .filter(f => f.endsWith('.tsx'))
    .sort()

  const targets = templateNum
    ? allFiles.filter(f => f.startsWith(templateNum + '-') || f.startsWith(templateNum.padStart(2, '0') + '-'))
    : allFiles

  if (targets.length === 0) {
    console.error(`❌ No templates found matching --template=${templateNum}`)
    process.exit(1)
  }

  console.log(`\nAuditing ${targets.length} template(s)...\n`)

  const report = { timestamp: new Date().toISOString(), results: [], summary: {} }
  let fixedCount = 0

  for (const filename of targets) {
    const filePath = join(TEMPLATES_DIR, filename)
    const result = await auditTemplate(filePath, { skipRender })
    report.results.push(result)

    if (applyFixes && result.issues.some(i => i.severity === 'error' || i.severity === 'warning')) {
      const wasFixed = await applyFix(result)
      if (wasFixed) fixedCount++
    }
  }

  // Summary
  const totalIssues  = report.results.reduce((n, r) => n + r.issues.length, 0)
  const totalErrors  = report.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'error').length, 0)
  const totalWarnings = report.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'warning').length, 0)
  const cleanTemplates = report.results.filter(r => r.issues.length === 0).length

  report.summary = {
    templates: targets.length,
    clean: cleanTemplates,
    withIssues: targets.length - cleanTemplates,
    totalIssues,
    errors: totalErrors,
    warnings: totalWarnings,
    fixed: fixedCount,
  }

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8')

  console.log('\n══════════════════════════════════════')
  console.log(`  Templates audited : ${targets.length}`)
  console.log(`  Clean             : ${cleanTemplates}`)
  console.log(`  With issues       : ${targets.length - cleanTemplates}`)
  console.log(`  Total issues      : ${totalIssues} (${totalErrors} errors, ${totalWarnings} warnings)`)
  if (applyFixes) console.log(`  Auto-fixed        : ${fixedCount}`)
  console.log(`  Report saved      : .temp/audit/report.json`)
  console.log('══════════════════════════════════════')

  // Print templates with errors for quick reference
  const withErrors = report.results.filter(r => r.issues.some(i => i.severity === 'error'))
  if (withErrors.length > 0) {
    console.log('\nTemplates with errors:')
    withErrors.forEach(r => {
      const errs = r.issues.filter(i => i.severity === 'error')
      console.log(`  ❌ ${r.filename} — ${errs.map(e => e.id || e.description).join(', ')}`)
    })
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
