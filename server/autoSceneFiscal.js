/**
 * autoSceneFiscal.js — Hierarchical Router Refactor for FISCAL PAL
 * 
 * Two-Pass Architecture:
 *   Pass 1 (The Router): Segment script into scenes and assign categories (Editorial Illustration focus).
 *   Pass 2 (The Filler): Select a specific template and fill its fields.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fuzzyMapFields } from './templateSystem.js'
import { fillTemplate, templateExists } from './templateFiller.js'
import { googleAI, getGEMINI_MODEL } from './services/llm.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCHEMAS_DIR = path.join(__dirname, 'schemas')

// ─────────────────────────────────────────────
// Shared Categories Mapping
// ─────────────────────────────────────────────
const TEMPLATE_CATEGORIES = {
  CHAPTER: ['42-chapter-word-drop', '43-chapter-typewriter', '44-chapter-countup', '45-chapter-wipe', '46-chapter-glitch', '158-chapter-word-drop', '159-chapter-word-drop', '81-transition-fade-title', '82-transition-wipe-chapter', '83-transition-zoom-reveal'],
  MARKET: ['142-stock-ticker-strip', '95-candlestick-ohlc', '156-crypto-price-candles', '98-barchart-race', '73-ticker-scroll', '94-marimekko-mosaic'],
  PIE_CHART: ['143-portfolio-allocation', '05-donutchart-fill', '06-percentagefill-single', '50-treemap', '148-market-cap-treemap'],
  FINANCIAL: ['144-profit-loss-waterfall', '08-waterfall-chart', '154-earnings-reveal', '109-number-odometer', '72-countup-hero', '145-kpi-financial-dashboard', '103-dashboard-summary', '01-statcluster-3box', '02-statcluster-2box', '96-bulletchart-kpi', '151-break-even-chart', '03-barchart-vertical'],
  GAUGE: ['146-compound-interest-curve', '147-inflation-erosion', '149-interest-rate-gauge', '52-gaugechart', '04-linechart-draw', '86-radarchart-spider', '97-slopechart-change'],
  FLOW_SANKEY: ['150-cash-flow-sankey', '93-sankey-flow', '57-flowdiagram-linear', '51-funnelchart'],
  TIMELINE: ['153-debt-payoff-timeline', '14-timeline-horizontal', '15-timeline-vertical', '16-timeline-escalation', '59-timeline-comparison', '60-timeline-gantt', '61-timeline-circular', '79-timeline-incident'],
  COMPARISON: ['155-risk-return-scatter', '48-scatterplot', '152-asset-comparison-slope', '07-comparisonchart-dual', '99-before-after-split', '09-split-2panel', '10-split-3panel', '64-split-quadrant', '65-split-spotlight', '112-comparison-table'],
  FLOW: ['47-barchart-horizontal', '113-bracket-tournament', '58-flowdiagram-branching', '17-phase-horizontal', '18-phase-circular', '62-phase-vertical', '63-phase-numbered'],
  PERSON: ['76-organization-card', '75-person-profile', '114-dossier-open', '85-person-profile'],
  MAP: ['34-map-dotplot', '34b-map-country-zoom', '35-map-region-highlight', '35b-map-country-compare', '36-map-arc-connection', '37-map-spread'],
  NETWORK: ['19-nodenetwork-centered', '24-nodenetwork-hierarchy', '20-nodenetwork-flow', '53-nodenetwork-bipartite', '55-nodenetwork-cluster', '136-attribution-web'],
  EVIDENCE: ['130-news-article-highlight', '111-magazine-cover', '157-archive-newspaper-reel', '78-evidence-item', '107-redacted-reveal', '108-stamped-verdict', '115-wanted-poster'],
  KNOWLEDGE: ['151-knowledge-card', '152-search-engine-reveal', '100-zoom-to-detail', '102-annotation-callout', '161-annotation-callout', '106-word-highlight-scan'],
  DRAMATIC: ['49-heatmap-grid', '30-icongrid-3x3', '31-icongrid-4x4', '77-quote-fullscreen', '110-scramble-decode', '132-ransom-note-reveal']
}

// ─────────────────────────────────────────────
// Helper: Robust JSON Parse
// ─────────────────────────────────────────────
function robustParseJSON(text) {
  if (!text) return text
  
  // 1. Initial cleanup
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()

  // 2. Depth-tracking extraction (non-greedy)
  const extractValidJson = (str) => {
    const firstBracket = str.indexOf('[')
    const firstBrace = str.indexOf('{')
    let startIdx = -1, openChar = '', closeChar = ''

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket; openChar = '['; closeChar = ']'
    } else if (firstBrace !== -1) {
      startIdx = firstBrace; openChar = '{'; closeChar = '}'
    }

    if (startIdx === -1) return null

    let depth = 0
    let inString = false
    let escaped = false

    for (let i = startIdx; i < str.length; i++) {
      const char = str[i]
      
      if (char === '"' && !escaped) inString = !inString
      if (inString) {
        escaped = (char === '\\' && !escaped)
        continue
      }

      if (char === openChar) depth++
      else if (char === closeChar) depth--

      if (depth === 0) return str.substring(startIdx, i + 1)
    }
    return null
  }

  const jsonBlock = extractValidJson(cleaned)
  if (!jsonBlock) throw new Error("No valid JSON structure found in response")

  try {
    // Aggressive trim: ensures no hidden characters after the final bracket/brace
    return JSON.parse(jsonBlock.trim())
  } catch (err) {
    // 3. Recursive Repair Mode for common LLM syntax errors
    try {
      let repaired = jsonBlock.trim()
        .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
        .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines inside strings
      
      // Handle the "double brace" issue: [...] } or {...} }
      if (repaired.endsWith('}') && (repaired.match(/\}/g) || []).length > (repaired.match(/\{/g) || []).length) {
          repaired = repaired.replace(/\}+$/, '}')
      }
      if (repaired.endsWith(']') && (repaired.match(/\]/g) || []).length > (repaired.match(/\[/g) || []).length) {
          repaired = repaired.replace(/\]+$/, ']')
      }

      return JSON.parse(repaired)
    } catch (repairErr) {
      console.error('--- JSON REPAIR FAILED ---')
      console.error('Original Error:', err.message)
      console.error('Repair Error:', repairErr.message)
      throw new Error(`JSON Parse Failure: ${repairErr.message}`)
    }
  }
}

// ─────────────────────────────────────────────
// Helper: Robust Gemini Call with Retry
// ─────────────────────────────────────────────
async function callGemini(model, prompt, maxRetries = 3) {
  let lastErr = null
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60_000)
      const result = await model.generateContent(prompt, { signal: controller.signal })
      clearTimeout(timeout)
      return result
    } catch (err) {
      lastErr = err
      const msg = err.message.toLowerCase()
      if (msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('503') || msg.includes('429')) {
        console.log(`   ⚠️ Fiscal Gemini retry ${i + 1}/${maxRetries} due to: ${err.message}`)
        await new Promise(r => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      throw err
    }
  }
  throw lastErr
}

// ─────────────────────────────────────────────
// Helper: Load JSON Schema
// ─────────────────────────────────────────────
function loadSchema(templateName) {
  try {
    const p = path.join(SCHEMAS_DIR, `${templateName}.json`)
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (err) { return null }
}

// ─────────────────────────────────────────────
// Pass 1: The Fiscal Router
// ─────────────────────────────────────────────
async function routeScenes(scriptText, settings) {
  const ratio = settings?.templateRatio ?? 60
  const theme = settings?.colorScheme || 'CLEAN'

  const systemPrompt = `You are the FISCAL PAL structural director. You analyze financial scripts and break them into scenes.

CORE IDENTITY:
Illustrations must feel painted by a senior editorial illustrator (WSJ, FT). NO 3D RENDERS.

SCENE TYPES:
- [TEMPLATE]: ONLY use for explicit financial charts, data, timelines, or structural beats.
- [ILLUSTRATION]: DEFAULT for editorial watercolor illustrations of people, narrative action, story beats, or symbolic scenes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — VERB-BASED ROUTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ NARRATIVE VERBS = [ILLUSTRATION]
clicked, opened, called, walked, arrived, sat, felt, saw, said, wrote, sent, received, noticed, believed, suspected, realized, decided, logged in, downloaded, uploaded, ran, fled, denied, signed, printed, met, waited, replied, threatened, paid

→ DATA / EXPLANATORY VERBS = [TEMPLATE]
grew, increased, decreased, compared, ranked, scheduled, analyzed, totaled, reached, peaked, dropped, averaged, distributed, comprised, mapped, connected, tracked, flowed, spread, generated, processed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 2 — SENTENCE STRUCTURE TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ask: Is a PERSON doing something, OR is DATA being described?
  "The agents arrived"   → PERSON doing → [ILLUSTRATION]
  "He was stressed"      → PERSON feeling → [ILLUSTRATION]
  "Revenue grew 50%"     → DATA metric → [TEMPLATE]

CATEGORIES (for TEMPLATE only):
CHAPTER: Chapter openers, section titles, transitions
MARKET: Stock tickers, crypto prices, candlestick charts, bar races
PIE_CHART: Portfolio allocation, donut charts, treemaps, market cap
FINANCIAL: Profit/loss, earnings, KPI dashboards, countups, stat clusters, break-even
GAUGE: Line charts, compound interest, inflation, rate gauges, radar/spider charts
FLOW_SANKEY: Cash flow, sankey diagrams, funnels
TIMELINE: Debt payoff, history of events, gantt, escalation timelines
COMPARISON: Scatter plots, slope charts, side-by-side panels, tables
FLOW: Bar charts, phase diagrams, bracket flows, process steps
PERSON: Executive profiles, organization cards, dossiers
MAP: Country maps, region highlights, global trade routes
NETWORK: Relationship webs, node networks, attribution diagrams
EVIDENCE: News articles, magazine covers, archive documents, redacted reports
KNOWLEDGE: Knowledge cards, search reveals, annotations, word highlights
DRAMATIC: Heatmaps, icon grids, quote reveals, scramble effects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVERAGE AND RATIO REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. YOU MUST COVER EVERY SENTENCE verbatim.
2. Target ratio: ${ratio}% TEMPLATE, ${100 - ratio}% ILLUSTRATION.
3. POST-PROCESSING ENFORCER: Final check: Count your totals. If TEMPLATE count is below ${ratio}%, force-convert [ILLUSTRATION] scenes by extracting data or charts. Templates are essential for channel identity.

OUTPUT FORMAT (strict JSON array only):
[
  {
    "type": "TEMPLATE" | "ILLUSTRATION",
    "category": "FINANCIAL" | "TIMELINE" | ... (TEMPLATE only),
    "script": "original sentence verbatim",
    "routing_reason": "One sentence: WHY this type was chosen"
  }
]`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  })

  const result = await callGemini(model, `Analyze this financial script:\n\n${scriptText}`)
  const raw = result.response.text()
  return robustParseJSON(raw)
}

// ─────────────────────────────────────────────
// Pass 2: The Focused Filler (Worker)
// ─────────────────────────────────────────────
async function fillSceneFields(scene, templateName, priorityFields = null) {
  const schema = loadSchema(templateName)
  if (!schema) return {}

  const allEntries = Object.entries(schema.fields || {})
  const schemaEntries = priorityFields
    ? allEntries.filter(([name]) => priorityFields.includes(name))
    : allEntries
  const fieldList = schemaEntries
    .map(([name, desc]) => `- ${name}: ${desc}`)
    .join('\n')

  const exampleOutput = '{' + schemaEntries
    .map(([name]) => `"${name}": "..."`)
    .join(', ') + '}'

  const systemPrompt = `Extract values from the script to fill the fields for the template "${templateName}".

FIELDS TO FILL:
${fieldList}

RULES:
- Your JSON keys MUST match the field names EXACTLY as shown above — do not abbreviate or rename them.
- ALL CAPS labels, max 3 words.
- Keep units ($4.5B).
- If a field is missing, infer logically.

OUTPUT FORMAT (JSON object only, keys must be exact):
${exampleOutput}`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  })

  const result = await model.generateContent(`SCRIPT: "${scene.script}"`)
  const raw = result.response.text()
  return robustParseJSON(raw)
}

// ─────────────────────────────────────────────
// Helper: Word count
// ─────────────────────────────────────────────
function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length
}

function splitScriptNearMiddle(script) {
  const mid = Math.floor(script.length / 2)
  for (let offset = 0; offset < mid; offset++) {
    for (const pos of [mid + offset, mid - offset]) {
      if (/[,;.!?—–]/.test(script[pos]) && script[pos + 1] === ' ') {
        return [script.slice(0, pos + 1).trim(), script.slice(pos + 1).trim()]
      }
    }
  }
  const words = script.trim().split(/\s+/)
  const midWord = Math.floor(words.length / 2)
  return [words.slice(0, midWord).join(' '), words.slice(midWord).join(' ')]
}

function normalizeSceneWordCounts(scenes, min = 15, max = 25) {
  // Step 1: Split scenes over max words
  let result = []
  for (const scene of scenes) {
    if (countWords(scene.script) > max) {
      const [a, b] = splitScriptNearMiddle(scene.script)
      result.push({ ...scene, script: a })
      result.push({ ...scene, script: b })
    } else {
      result.push(scene)
    }
  }

  // Step 2: Merge scenes under min words (repeat until stable)
  let changed = true
  while (changed) {
    changed = false
    const merged = []
    let i = 0
    while (i < result.length) {
      const scene = result[i]
      if (countWords(scene.script) < min) {
        if (i < result.length - 1) {
          const next = result[i + 1]
          merged.push({ ...scene, script: scene.script.trim() + ' ' + next.script.trim() })
          i += 2
        } else if (merged.length > 0) {
          const prev = merged.pop()
          merged.push({ ...prev, script: prev.script.trim() + ' ' + scene.script.trim() })
          i++
        } else {
          merged.push(scene)
          i++
        }
        changed = true
      } else {
        merged.push(scene)
        i++
      }
    }
    result = merged
  }

  return result
}

// ─────────────────────────────────────────────
// Helper: Hard ratio enforcement (post-LLM)
// Upgrades ILLUSTRATION scenes to TEMPLATE until targetRatio% is reached.
// ─────────────────────────────────────────────
function illustrationTemplateScore(script) {
  const s = script.toLowerCase()
  let score = 0
  if (/\$[\d,.]+|\d+\s*(million|billion|thousand)/.test(s))   score += 3
  if (/\d+\s*%|percent|ratio|rate|return|yield/.test(s))       score += 3
  if (/(grew|increased|decreased|peaked|dropped|reached|averaged|totaled|ranked|compared)/.test(s)) score += 2
  if (/\d+/.test(s))                                            score += 1
  if (/(revenue|profit|loss|debt|equity|portfolio|market|stock|fund|asset|price|cost|fee)/.test(s)) score += 1
  // Penalty for pure narrative
  if (/^\s*(he|she|they|i|we)\b/i.test(s))                    score -= 3
  if (/(said|told|called|walked|felt|saw|met|signed|paid)\b/.test(s)) score -= 2
  return score
}

function enforceRatio(scenes, targetRatio) {
  const needed  = Math.ceil(scenes.length * targetRatio / 100)
  const current = scenes.filter(s => s.type === 'TEMPLATE').length
  if (current >= needed) return scenes

  const toUpgrade = needed - current
  const candidates = scenes
    .filter(s => s.type === 'ILLUSTRATION')
    .map(s => ({ scene: s, score: illustrationTemplateScore(s.script) }))
    .sort((a, b) => b.score - a.score)

  let upgraded = 0
  for (const { scene, score } of candidates) {
    if (upgraded >= toUpgrade) break
    scene.type     = 'TEMPLATE'
    scene.category = 'FINANCIAL'
    scene.routing_reason = score >= 1
      ? `[ratio-enforced] Upgraded: financial data content (score: ${score})`
      : `[ratio-enforced:forced] Force-upgraded to meet ${targetRatio}% target`
    upgraded++
  }

  console.log(`   📊 Fiscal ratio enforcer: ${current} → ${current + upgraded} TEMPLATE scenes (target: ${needed}/${scenes.length})`)
  return scenes
}

// ─────────────────────────────────────────────
// Main Generation Flow
// ─────────────────────────────────────────────
export async function generateScenes(scriptText, generationSettings = null) {
  if (!scriptText?.trim()) throw new Error('Empty script')

  console.log(`🎬 Fiscal Pal: Two-Pass Generation Starting...`)

  const targetRatio = generationSettings?.templateRatio ?? 60

  let rawScenes = await routeScenes(scriptText, generationSettings)
  console.log(`   ✅ Pass 1 complete: ${rawScenes.length} scenes identified`)

  // Combine short sentences before processing (density configurable via generationSettings.wordsPerScene)
  const maxWords = generationSettings?.wordsPerScene ?? 25
  const minWords = Math.max(10, Math.floor(maxWords * 0.6))
  rawScenes = normalizeSceneWordCounts(rawScenes, minWords, maxWords)
  console.log(`   ✅ Word count normalized: ${rawScenes.length} scenes after combining`)

  // Enforce 60/40 ratio
  rawScenes = enforceRatio(rawScenes, targetRatio)

  // --- COVERAGE CHECK ---
  const sentences = scriptText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5)
  const llmContent = rawScenes.map(s => s.script).join(' ')
  const missingSentences = sentences.filter(s => !llmContent.toLowerCase().includes(s.toLowerCase().substring(0, 20)))

  if (missingSentences.length > 0) {
    console.warn(`   ⚠️ Fiscal LLM skipped ${missingSentences.length} sentences. Appending as illustrations.`)
    missingSentences.forEach(s => {
      rawScenes.push({
        type: 'ILLUSTRATION',
        script: s,
        reasoning: 'Fallback: Sentence skipped by LLM during analysis'
      })
    })
  }

  const processed = []
  const usedTemplates = new Set()

  for (let i = 0; i < rawScenes.length; i++) {
    const scene = rawScenes[i]
    scene.index = i + 1
    scene.duration = 15
    scene.theme = generationSettings?.colorScheme || 'CLEAN'

    if (scene.type === 'TEMPLATE') {
      const templates = TEMPLATE_CATEGORIES[scene.category] || TEMPLATE_CATEGORIES.FINANCIAL
      let choices = templates.filter(t => !usedTemplates.has(t))
      if (choices.length === 0) choices = templates

      const templateName = choices[i % choices.length]
      scene.template = templateName
      usedTemplates.add(templateName)

      console.log(`   🛠️ Scene ${scene.index}: ${scene.category} → ${templateName}`)

      try {
        const schema = loadSchema(templateName)
        let content = await fillSceneFields(scene, templateName)
        if (schema?.fields) content = fuzzyMapFields(content, schema.fields)

        const candidateCode = fillTemplate(templateName, scene.theme, content)
        const schemaKeys = schema?.fields ? Object.keys(schema.fields) : []
        const unfilled = schemaKeys.filter(k => candidateCode.includes(`'${k}'`) || candidateCode.includes(`"${k}"`))

        if (unfilled.length > 0) {
          console.warn(`   ⚠️ Scene ${scene.index}: ${unfilled.length} unfilled placeholders — retrying`)
          const retryContent = await fillSceneFields(scene, templateName, unfilled)
          const merged = { ...content, ...retryContent }
          const remapped = schema?.fields ? fuzzyMapFields(merged, schema.fields) : merged
          const retryCode = fillTemplate(templateName, scene.theme, remapped)
          const stillUnfilled = schemaKeys.filter(k => retryCode.includes(`'${k}'`) || retryCode.includes(`"${k}"`))
          content = remapped
          scene.code = stillUnfilled.length < unfilled.length ? retryCode : candidateCode
        } else {
          scene.code = candidateCode
        }

        scene.content = content
      } catch (err) { scene.error = err.message }
    } else {
      console.log(`   🎨 Scene ${scene.index}: Generating Editorial Illustration prompt...`)
      
      const imgModel = googleAI.getGenerativeModel({ 
        model: getGEMINI_MODEL(),
        systemInstruction: `You are the ARXXIS editorial illustrator. You write prompts for watercolor editorial illustrations in the style of courtroom sketches and financial newspaper artwork.

THREE-STEP METHOD:
1. MOOD WORD: Choose one (anxious, triumphant, secretive, chaotic) to set the palette.
2. SYMBOLIC OBJECT: Find the single object that carries the meaning. Avoid literal people.
3. COMPOSITIONAL DETAIL: Describe the foreground object, watercolor wash, and paper grain.

STYLE RULES:
- 50-65 words max. Loose ink linework over soft washes.
- Warm muted palette (burnt sienna, raw umber, slate blue).
- NO photorealism, NO text, NO writing.`
      })
      
      const promptRes = await callGemini(imgModel, `Script: "${scene.script}"`)
      scene.prompt = promptRes.response.text().trim()
      
      scene.environment = 'editorial-illustration'
      scene.lower_third = { text: scene.script.substring(0, 50) + '...', attribution: '' }
    }

    processed.push(scene)
  }

  return processed
}
