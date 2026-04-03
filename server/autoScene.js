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

  const systemPrompt = `You are the ARXXIS structural director. Your job is to break a documentary script into scenes and assign them to a broad category.

SCENE TYPES:
- [TEMPLATE]: ONLY use for explicit data, charts, lists, timelines, or technical flows.
- [3D_RENDER]: DEFAULT for narrative action, story beats, phone calls, people-centric events, and atmosphere.

CATEGORIES:
${catalogSummary}

DIRECTIVE:
- VISUAL-STORY MATCHING: The visual MUST match the literal event in the script.
- If the script says "The phone rang", it is [3D_RENDER] (office environment), NOT a technical flow.
- If the script says "He didn't believe it", it is [3D_RENDER] (moody atmosphere), NOT a chart.
- YOU MUST COVER THE ENTIRE SCRIPT. DO NOT SKIP ANY SENTENCES.
- EVERY SINGLE WORD from the provided script must appear in the "script" field of exactly one scene.
- EXACTLY ${ratio}% of scenes MUST be TEMPLATE type. This is a hard requirement, not a suggestion. Count your scenes before outputting and adjust.
- Each scene script must be 15–25 words. Split long sentences at natural pauses. Combine short ones.
- Assign a THEME based on mood: THREAT (urgent/red), COLD (analytical/blue), INTEL (mysterious/purple), DARK (dramatic/black), CLEAN (neutral/white).

POST-PROCESSING ENFORCER:
1. Final check: Count your TEMPLATE vs 3D_RENDER scenes. If you have 10 scenes and the ratio is 60%, exactly 6 MUST be TEMPLATE.
2. If short on TEMPLATES, force-convert 3D_RENDER scenes by finding ANY technical or data-driven angle in the text.
3. Templates are the priority. 3D Renders are only for physical environments where no data exists.

OUTPUT FORMAT (JSON array only):
[
  {
    "type": "TEMPLATE",
    "category": "STATS",
    "theme": "THREAT",
    "script": "exact sentence(s)",
    "reasoning": "why this category/theme fits"
  },
  {
    "type": "3D_RENDER",
    "subject": "main character or object (e.g., a server rack)",
    "setting": "background setting (e.g., a data center in a snowy forest)",
    "style": "artistic medium or aesthetic (e.g., cinematic 3D render, holographic, brushed metal)",
    "script": "exact sentence(s)",
    "reasoning": "why this remix fits"
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

  // --- PASS 1: ROUTING ---
  let rawScenes = await routeScenes(scriptText, generationSettings)
  console.log(`   ✅ Pass 1 complete: ${rawScenes.length} scenes identified`)

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
      // 3D Render Prompt Generation
      console.log(`   🖼️ Scene ${scene.index}: Generating 3D Render prompt...`)
      const model = googleAI.getGenerativeModel({ model: getGEMINI_MODEL() })
      
      const imgPrompt = `Create a 60-80 word photorealistic 3D render prompt based on this scene: "${scene.script}".
      Visual style: Dark, moody, cinematic 3D render focusing on objects/infrastructure. NO HUMANS.`

      const promptRes = await callGemini(model, imgPrompt)
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
