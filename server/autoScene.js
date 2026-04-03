/**
 * autoScene.js — Hierarchical Router Refactor
 * 
 * Two-Pass Architecture:
 *   Pass 1 (The Router): Segment script into scenes and assign categories.
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
// Template Categories Mapping
// ─────────────────────────────────────────────
const TEMPLATE_CATEGORIES = {
  CHAPTER: {
    desc: 'Chapter openers, structural beats, transitions',
    templates: ['42-chapter-word-drop', '43-chapter-typewriter', '44-chapter-countup', '45-chapter-wipe', '46-chapter-glitch', '158-chapter-word-drop', '81-transition-fade-title', '82-transition-wipe-chapter', '83-transition-zoom-reveal', '84-transition-glitch-cut']
  },
  PERSON: {
    desc: 'Profiles of people, threat actors, hackers',
    templates: ['75-person-profile', '80-threat-actor-card', '85-person-profile']
  },
  ORGANIZATION: {
    desc: 'Company profiles, victims, organizations, dossiers',
    templates: ['76-organization-card', '114-dossier-open', '117-breach-report-card']
  },
  STAT: {
    desc: 'Single big numbers, key figures, percentages',
    templates: ['01-statcluster-3box', '02-statcluster-2box', '72-countup-hero', '109-number-odometer', '06-percentagefill-single', '96-bulletchart-kpi']
  },
  BAR_CHART: {
    desc: 'Ranked comparisons, distributions, race charts',
    templates: ['03-barchart-vertical', '47-barchart-horizontal', '98-barchart-race', '113-bracket-tournament']
  },
  LINE_CHART: {
    desc: 'Trends over time, line data, interest curves',
    templates: ['04-linechart-draw', '97-slopechart-change', '146-compound-interest-curve']
  },
  PIE_CHART: {
    desc: 'Market share, percentages, donut charts, treemaps',
    templates: ['05-donutchart-fill', '143-portfolio-allocation', '50-treemap', '148-market-cap-treemap', '94-marimekko-mosaic']
  },
  COMPARISON: {
    desc: 'Side-by-side comparisons, tables, split panels',
    templates: ['07-comparisonchart-dual', '112-comparison-table', '99-before-after-split', '09-split-2panel', '64-split-quadrant', '152-asset-comparison-slope']
  },
  FINANCIAL: {
    desc: 'Waterfall charts, profit/loss, earnings, dashboards',
    templates: ['08-waterfall-chart', '144-profit-loss-waterfall', '154-earnings-reveal', '145-kpi-financial-dashboard', '103-dashboard-summary']
  },
  TIMELINE: {
    desc: 'Dated events, sequence of history, escalations',
    templates: ['14-timeline-horizontal', '15-timeline-vertical', '16-timeline-escalation', '59-timeline-comparison', '60-timeline-gantt', '79-timeline-incident', '135-threat-actor-timeline', '153-debt-payoff-timeline']
  },
  FLOW: {
    desc: 'Process diagrams, attack chains, kill chains, exploit flows',
    templates: ['57-flowdiagram-linear', '58-flowdiagram-branching', '119-kill-chain-steps', '121-exploit-chain', '120-lateral-movement', '17-phase-horizontal', '63-phase-numbered']
  },
  NETWORK: {
    desc: 'Relationships, connections, attack networks, attribution webs',
    templates: ['19-nodenetwork-centered', '20-nodenetwork-flow', '21-nodenetwork-attack', '24-nodenetwork-hierarchy', '53-nodenetwork-bipartite', '55-nodenetwork-cluster', '136-attribution-web']
  },
  MAP: {
    desc: 'Geography, country highlights, trade routes, heatmaps',
    templates: ['34-map-dotplot', '34b-map-country-zoom', '35-map-region-highlight', '35b-map-country-compare', '36-map-arc-connection', '37-map-spread', '139-attack-origin-heatmap', '140-botnet-spread']
  },
  CODE: {
    desc: 'Source code, terminal logs, registry keys, wireshark streams',
    templates: ['38-codesnippet-reveal', '39-terminal-typewriter', '40-logstream-highlight', '41-registrykey-reveal', '122-port-scan-reveal', '125-hex-dump-scroll', '126-memory-map', '127-wireshark-row-stream', '128-sql-injection-demo', '129-log-anomaly-detect']
  },
  PARTICLE: {
    desc: 'Infection spread, DDoS floods, packet flows',
    templates: ['25-particle-burst', '26-particle-stream', '27-particle-scatter', '29-particle-infection', '124-packet-flood-ddos', '56-expanding-pulse']
  },
  ICON_GRID: {
    desc: 'Grids of icons, techniques, spotlight highlights',
    templates: ['30-icongrid-3x3', '31-icongrid-4x4', '32-icongrid-scatter', '33-icongrid-spotlight', '133-ioc-list-stream']
  },
  EVIDENCE: {
    desc: 'Documents, classified reports, newspaper archives, redactions',
    templates: ['78-evidence-item', '157-archive-newspaper-reel', '107-redacted-reveal', '108-stamped-verdict', '118-classified-stamp', '130-news-article-highlight', '111-magazine-cover']
  },
  KNOWLEDGE: {
    desc: 'Web search, knowledge cards, annotations',
    templates: ['152-search-engine-reveal', '151-knowledge-card', '100-zoom-to-detail', '102-annotation-callout']
  },
  SOCIAL: {
    desc: 'Chat interfaces, social media, dark web listings',
    templates: ['153-social-media-impact', '150-mobile-chat-ui', '156-biometric-access-scan', '138-dark-web-chatter', '116-dark-web-listing']
  },
  DATE: {
    desc: 'Calendars, countdowns, breach counters',
    templates: ['155-calendar-date-highlight', '131-countdown-breach', '141-breach-counter']
  },
  GAUGE: {
    desc: 'Meters, scores, risk ratings, spider charts',
    templates: ['52-gaugechart', '134-cvss-score-reveal', '149-interest-rate-gauge', '86-radarchart-spider']
  },
  FLOW_SANKEY: {
    desc: 'Cash flow, funnel charts, money movement',
    templates: ['93-sankey-flow', '150-cash-flow-sankey', '51-funnelchart']
  },
  MARKET: {
    desc: 'Stock tickers, crypto prices, candlestick charts',
    templates: ['142-stock-ticker-strip', '95-candlestick-ohlc', '73-ticker-scroll', '156-crypto-price-candles']
  },
  HEATMAP: {
    desc: 'Correlation grids, scatterplots, bubble maps',
    templates: ['49-heatmap-grid', '48-scatterplot', '155-risk-return-scatter', '90-bubblemap-sized']
  },
  DRAMATIC: {
    desc: 'Glitches, corruption, ransom notes, error cascades',
    templates: ['130-glitch-corrupt', '132-ransom-note-reveal', '110-scramble-decode', '70-glitchreveal-full', '163-error-cascade']
  },
  QUOTE: {
    desc: 'Direct quotes, punchy claims',
    templates: ['77-quote-fullscreen']
  }
}

// ─────────────────────────────────────────────
// Helper: Infer best template category from script text
// Used by ratio enforcer when upgrading 3D_RENDER → TEMPLATE
// ─────────────────────────────────────────────
function inferCategory(script) {
  const s = script.toLowerCase()
  if (/\$|million|billion|revenue|profit|loss|cost|fund|earn|paid/.test(s))        return 'FINANCIAL'
  if (/country|countries|nation|region|world|global|continent|geographic/.test(s)) return 'MAP'
  if (/timeline|history|since|before|after|when|year|date|decade/.test(s))         return 'TIMELINE'
  if (/attack|exploit|malware|hack|breach|phish|inject|vulnerab|payload/.test(s))  return 'FLOW'
  if (/network|connect|node|hub|link|relationship|attribution/.test(s))             return 'NETWORK'
  if (/step|phase|stage|process|method|how it works|procedure/.test(s))            return 'FLOW'
  if (/chat|message|post|social|dark web|forum/.test(s))                           return 'SOCIAL'
  if (/document|file|record|report|classified|evidence/.test(s))                   return 'EVIDENCE'
  if (/\d+\s*%|percent|rate|ratio|share|portion/.test(s))                          return 'STAT'
  if (/\d/.test(s))                                                                return 'STAT'
  return 'STAT'
}

// ─────────────────────────────────────────────
// Helper: Hard ratio enforcement (post-LLM)
// Upgrades 3D_RENDER scenes to TEMPLATE until targetRatio% is reached.
// Prefers scenes with numbers/mechanisms; only touches pure narrative as last resort.
// ─────────────────────────────────────────────
function enforceRatio(scenes, targetRatio) {
  const needed  = Math.ceil(scenes.length * targetRatio / 100)
  const current = scenes.filter(s => s.type === 'TEMPLATE').length
  if (current >= needed) return scenes

  const toUpgrade = needed - current
  let upgraded = 0

  // Pure narrative guard — sentences where a named person is clearly the subject
  const isPureNarrative = (script) =>
    /^\s*(he|she|they|i|we)\s+(clicked|opened|called|walked|arrived|sat|felt|saw|said|wrote|sent|ran|fled|denied|paid|signed|met|waited|replied|threatened)\b/i.test(script)

  // Pass 1: upgrade non-narrative scenes first
  for (const scene of scenes) {
    if (upgraded >= toUpgrade) break
    if (scene.type !== '3D_RENDER' || isPureNarrative(scene.script)) continue
    scene.type           = 'TEMPLATE'
    scene.category       = inferCategory(scene.script)
    scene.routing_reason = `[ratio-enforced] Upgraded to meet ${targetRatio}% TEMPLATE target`
    upgraded++
  }

  // Pass 2: if still short, upgrade even pure narrative scenes (last resort)
  for (const scene of scenes) {
    if (upgraded >= toUpgrade) break
    if (scene.type !== '3D_RENDER') continue
    scene.type           = 'TEMPLATE'
    scene.category       = 'STAT'
    scene.routing_reason = `[ratio-enforced:forced] Force-upgraded to meet ${targetRatio}% target`
    upgraded++
  }

  console.log(`   📊 Ratio enforcer: ${current} → ${current + upgraded} TEMPLATE scenes (target: ${needed}/${scenes.length})`)
  return scenes
}

// ─────────────────────────────────────────────
// Helper: Build story context for image prompts
// Gives the cinematographer the who/where/when of the full chapter
// ─────────────────────────────────────────────
function buildStoryContext(scriptText) {
  // Take the first 400 chars as the story lead — enough to establish setting/characters
  const lead = scriptText.replace(/\s+/g, ' ').trim().substring(0, 400)

  // Extract candidate proper nouns (capitalized words that aren't sentence starters)
  const properNouns = [...new Set(
    (scriptText.match(/(?<=[a-z,;]\s)[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*/g) || [])
      .filter(w => w.length > 2)
      .slice(0, 8)
  )].join(', ')

  return `STORY CONTEXT:
"${lead}${scriptText.length > 400 ? '…' : ''}"
KEY ENTITIES: ${properNouns || 'not identified'}

Use this context to make the imagery feel specific to THIS story, not generic.`
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
    // Find the first valid start of a JSON block
    const startIdx = str.split('').findIndex(c => c === '[' || c === '{')
    if (startIdx === -1) return null
    
    const openChar = str[startIdx]
    const closeChar = openChar === '[' ? ']' : '}'

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
  if (!jsonBlock) {
    console.error('--- JSON EXTRACTION FAILED ---')
    console.error('Raw LLM Response:', cleaned)
    throw new Error("No valid JSON structure found in response")
  }

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
// Helper: Load JSON Schema
// ─────────────────────────────────────────────
function loadSchema(templateName) {
  try {
    const p = path.join(SCHEMAS_DIR, `${templateName}.json`)
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (err) {
    console.error(`Error loading schema for ${templateName}:`, err.message)
    return null
  }
}

// ─────────────────────────────────────────────
// Scene Word-Count Normalizer (15–25 word band)
// ─────────────────────────────────────────────
function countWords(text) {
  return text.trim().split(/\s+/).length
}

function splitScriptNearMiddle(script) {
  const mid = Math.floor(script.length / 2)
  // Search outward from the midpoint for a punctuation boundary
  for (let r = 0; r < mid; r++) {
    for (const offset of [mid - r, mid + r]) {
      if (offset < 1 || offset >= script.length - 1) continue
      if (/[,;.!?—–]/.test(script[offset]) && script[offset + 1] === ' ') {
        return [script.slice(0, offset + 1).trim(), script.slice(offset + 1).trim()]
      }
    }
  }
  // No punctuation found — split at the nearest word boundary to the middle
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
          // Merge forward into next scene — keep first scene's type/category/theme
          const next = result[i + 1]
          merged.push({ ...scene, script: scene.script.trim() + ' ' + next.script.trim() })
          i += 2
        } else if (merged.length > 0) {
          // Last scene is short — merge backward into previous
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
// Helper: Robust Gemini Call with Retry
// ─────────────────────────────────────────────
async function callGemini(model, prompt, maxRetries = 3) {
  let lastErr = null
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Use a custom signal to force a timeout if fetch hangs
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60_000) // 60s timeout
      
      const result = await model.generateContent(prompt, { signal: controller.signal })
      clearTimeout(timeout)
      return result
    } catch (err) {
      lastErr = err
      const msg = err.message.toLowerCase()
      if (msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('503') || msg.includes('429')) {
        console.log(`   ⚠️ Gemini retry ${i + 1}/${maxRetries} due to: ${err.message}`)
        await new Promise(r => setTimeout(r, 2000 * (i + 1))) // Exponential backoff
        continue
      }
      throw err // Persistent or critical error
    }
  }
  throw lastErr
}

// ─────────────────────────────────────────────
// Pass 1: The Structural Director (Router)
// ─────────────────────────────────────────────
async function routeScenes(scriptText, settings) {
  const ratio = settings?.templateRatio ?? 60
  const theme = settings?.colorScheme || 'THREAT'

  const catalogSummary = Object.entries(TEMPLATE_CATEGORIES)
    .map(([cat, info]) => `${cat}: ${info.desc}`)
    .join('\n')

  const systemPrompt = `You are the ARXXIS structural director. Your job is to read each sentence of a documentary script and assign it to exactly one scene type: [TEMPLATE] or [3D_RENDER].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — VERB-BASED ROUTING (primary signal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Look at the MAIN VERB of the sentence first.

→ NARRATIVE VERBS = [3D_RENDER]
clicked, opened, called, walked, arrived, sat, felt, saw, said, wrote, sent, received, noticed, believed, suspected, realized, decided, logged in, downloaded, uploaded, ran, fled, denied, signed, printed, met, waited, replied, threatened, paid

→ DATA / EXPLANATORY VERBS = [TEMPLATE]
grew, increased, decreased, compared, ranked, scheduled, analyzed, totaled, reached, peaked, dropped, averaged, distributed, comprised, mapped, connected, tracked, flowed, spread, generated, processed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 2 — SENTENCE STRUCTURE TEST (secondary signal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ask: Is a PERSON doing something, OR is DATA being described?
  "He clicked the link"         → PERSON doing → [3D_RENDER]
  "The link exploited a buffer" → DATA/MECHANISM explained → [TEMPLATE]
  "She opened the email"        → PERSON doing → [3D_RENDER]
  "Revenue grew 50%"            → DATA metric → [TEMPLATE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 3 — KEYWORD CONTEXT TEST (disambiguation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Technical keywords do NOT automatically trigger [TEMPLATE].
  Is the keyword the SUBJECT of a person's action?  → [3D_RENDER]
  Is the keyword being EXPLANED or QUANTIFIED?     → [TEMPLATE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENE TYPE DEFINITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[TEMPLATE] — ONLY for explicit data, stats, lists, trends, process/mechanism explanations, geography, timelines, technical structures, or physical evidence (files/records).
[3D_RENDER] — DEFAULT for human action, decision, emotion, dialogue, scene-setting, environments, phone calls, or moments in a narrative sequence.

CATEGORIES:
${catalogSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVERAGE AND RATIO REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. YOU MUST COVER EVERY SENTENCE verbatim.
2. Target ratio: ${ratio}% TEMPLATE, ${100 - ratio}% 3D_RENDER.
3. POST-PROCESSING ENFORCER: After planning, count your totals. If TEMPLATE count is below ${ratio}%, scan [3D_RENDER] scenes that describe a mechanism or quantity and upgrade them to [TEMPLATE]. Never downgrade pure narrative action.

OUTPUT FORMAT (strict JSON array only):
[
  {
    "type": "TEMPLATE" | "3D_RENDER",
    "category": "STAT" | "FLOW" | ... (TEMPLATE only),
    "script": "original sentence verbatim",
    "routing_reason": "One sentence: WHY this type was chosen"
  }
]`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  })

  const result = await callGemini(model, `Analyze this script:\n\n${scriptText}`)
  const raw = result.response.text()
  return robustParseJSON(raw)
}

// ─────────────────────────────────────────────
// Pass 2: The Focused Filler (Worker)
// ─────────────────────────────────────────────
async function fillSceneFields(scene, templateName) {
  const schema = loadSchema(templateName)
  if (!schema) return {}

  const fieldList = Object.entries(schema.fields || {})
    .map(([name, desc]) => `- ${name}: ${desc}`)
    .join('\n')

  const systemPrompt = `You are an expert data extractor. Extract values from the script to fill the fields for the template "${templateName}".

FIELDS TO FILL:
${fieldList}

RULES:
- Use ALL CAPS for labels, max 3 words.
- Keep units ($4.5B, 44%).
- If a field is not in the script, infer a logical value. Do not leave blank.

OUTPUT FORMAT (JSON object only):
{ "FIELD_NAME": "value", ... }`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  })

  const result = await callGemini(model, `SCRIPT: "${scene.script}"`)
  const raw = result.response.text()
  return robustParseJSON(raw)
}

// ─────────────────────────────────────────────
// Main Generation Flow
// ─────────────────────────────────────────────
export async function generateScenes(scriptText, generationSettings = null) {
  if (!scriptText?.trim()) throw new Error('Empty script')

  console.log(`🎬 Auto-Scene: Two-Pass Generation Starting...`)

  // Build story context once — used by all image prompt calls
  const storyContext = buildStoryContext(scriptText)

  // --- PASS 1: ROUTING ---
  let rawScenes = await routeScenes(scriptText, generationSettings)
  console.log(`   ✅ Pass 1 complete: ${rawScenes.length} scenes identified`)

  // --- HARD RATIO ENFORCEMENT (code-level, not LLM-level) ---
  const targetRatio = generationSettings?.templateRatio ?? 60
  rawScenes = enforceRatio(rawScenes, targetRatio)

  // --- COVERAGE CHECK ---
  const sentences = scriptText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5)
  const llmContent = rawScenes.map(s => s.script).join(' ')
  const missingSentences = sentences.filter(s => !llmContent.toLowerCase().includes(s.toLowerCase().substring(0, 20)))

  if (missingSentences.length > 0) {
    console.warn(`   ⚠️ LLM skipped ${missingSentences.length} sentences. Appending as fallback scenes.`)
    missingSentences.forEach(s => {
      rawScenes.push({
        type: '3D_RENDER',
        theme: generationSettings?.colorScheme || 'THREAT',
        script: s,
        reasoning: 'Fallback: Sentence skipped by LLM during analysis'
      })
    })
  }

  // Enforce 15–25 word band per scene
  const beforeCount = rawScenes.length
  rawScenes = normalizeSceneWordCounts(rawScenes, 15, 25)
  console.log(`   ✂️ Word-count normalization: ${beforeCount} → ${rawScenes.length} scenes`)

  const processed = []
  const usedTemplates = new Set()
  const maxReuse = generationSettings?.maxTemplateReuse ?? 1

  for (let i = 0; i < rawScenes.length; i++) {
    const scene = rawScenes[i]
    scene.index = i + 1
    scene.duration = 15

    if (scene.type === 'TEMPLATE') {
      // Pick a template from the category
      const catInfo = TEMPLATE_CATEGORIES[scene.category] || TEMPLATE_CATEGORIES.STAT
      let choices = catInfo.templates.filter(t => !usedTemplates.has(t))
      
      // If exhausted, fallback to allowing reuse
      if (choices.length === 0) choices = catInfo.templates

      // Pick one (deterministic or random)
      const templateName = choices[i % choices.length]
      scene.template = templateName
      usedTemplates.add(templateName)

      console.log(`   🛠️ Scene ${scene.index}: Category ${scene.category} → ${templateName}`)

      // --- PASS 2: FIELD FILLING ---
      try {
        scene.content = await fillSceneFields(scene, templateName)
        const schema = loadSchema(templateName)
        if (schema?.fields) scene.content = fuzzyMapFields(scene.content, schema.fields)
        
        // Final TSX generation
        scene.code = fillTemplate(templateName, scene.theme, scene.content)
        console.log(`   🎨 Scene ${scene.index}: ${templateName} [${scene.theme}] filled`)
      } catch (err) {
        console.error(`   ❌ Scene ${scene.index} failed:`, err.message)
        scene.error = err.message
      }
    } else {
      // 3D Render Prompt Generation — THREE-STEP CINEMATOGRAPHY METHOD
      console.log(`   🖼️ Scene ${scene.index}: Generating cinematic 3D prompt...`)
      const model = googleAI.getGenerativeModel({
        model: getGEMINI_MODEL(),
        systemInstruction: `You are the ARXXIS cinematographer. You write image generation prompts for photorealistic 3D documentary scenes. You NEVER describe people — only environments, objects, and atmosphere.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THREE-STEP METHOD (follow in order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — SET THE ATMOSPHERE
Begin with one emotional quality that fits the scene:
tension, isolation, dread, secrecy, discovery, betrayal, urgency, quiet menace, hollow bureaucracy, digital coldness

STEP 2 — CHOOSE THE SYMBOLIC OBJECT
Never draw the person. Find the ONE object from the scene that carries the meaning:
  "He clicked the link"       → glowing monitor in an empty dark room
  "She didn't believe it"     → a single coffee cup, steam rising, on a desk scattered with papers at 3 AM
  "The phone rang"            → a ringing desk phone, light flashing, in an otherwise silent office
  "He was arrested"           → an empty chair, handcuffs on a metal table
  "The company went bankrupt" → an empty lobby, single flickering light, abandoned reception desk
Use the STORY CONTEXT provided to make the object specific to this story's setting, era, and characters.

STEP 3 — DESCRIBE THE ENVIRONMENT
Add the space around the object: room type, lighting quality, depth of field, color temperature, surface materials, time of day.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 60–80 words maximum
• Dark, moody, cinematic color grading
• Deep shadows with single dramatic light source
• Hyperrealistic surface textures (brushed metal, worn leather, glass, concrete, aged wood)
• No humans, no faces, no hands, no body parts
• No text, no labels, no UI elements on screens (blur them)
• Shallow depth of field — hero object sharp, background soft
• 16:9 cinematic framing

Output only the prompt text. No explanation.`
      })

      const promptRes = await callGemini(model, `${storyContext}\n\nSCENE TO VISUALIZE: "${scene.script}"`)
      scene.prompt = promptRes.response.text().trim()
      
      scene.environment = 'infrastructure'
      scene.camera = 'cinematic'
      scene.lower_third = { text: scene.script.substring(0, 50) + '...', attribution: '', tone: '#FFAA00' }
    }

    processed.push(scene)
  }

  // Auto-save
  autoSaveGeneration(scriptText, processed)
  return processed
}

function autoSaveGeneration(scriptText, scenes) {
  try {
    const genDir = path.join(__dirname, 'generations')
    if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true })
    const filename = `gen_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    fs.writeFileSync(path.join(genDir, filename), JSON.stringify({ scriptText, scenes }, null, 2))
  } catch (e) {}
}

export async function refineScene(sceneData) {
    // Keep original refine logic or simplify
    return { success: false, message: 'Refinement not implemented in this version' }
}
