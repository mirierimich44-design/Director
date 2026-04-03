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
  CHAPTER: ['42-chapter-word-drop', '43-chapter-typewriter', '44-chapter-countup', '45-chapter-wipe', '158-chapter-word-drop', '81-transition-fade-title', '82-transition-wipe-chapter'],
  MARKET: ['142-stock-ticker-strip', '95-candlestick-ohlc', '156-crypto-price-candles', '98-barchart-race'],
  PIE_CHART: ['143-portfolio-allocation', '05-donutchart-fill', '06-percentagefill-single', '50-treemap', '148-market-cap-treemap'],
  FINANCIAL: ['144-profit-loss-waterfall', '08-waterfall-chart', '154-earnings-reveal', '109-number-odometer', '72-countup-hero', '145-kpi-financial-dashboard', '103-dashboard-summary', '01-statcluster-3box', '02-statcluster-2box', '96-bulletchart-kpi'],
  GAUGE: ['146-compound-interest-curve', '147-inflation-erosion', '149-interest-rate-gauge', '52-gaugechart', '04-linechart-draw'],
  FLOW_SANKEY: ['150-cash-flow-sankey', '93-sankey-flow', '57-flowdiagram-linear'],
  TIMELINE: ['153-debt-payoff-timeline', '14-timeline-horizontal', '15-timeline-vertical', '16-timeline-escalation', '135-threat-actor-timeline', '60-timeline-gantt'],
  COMPARISON: ['155-risk-return-scatter', '48-scatterplot', '152-asset-comparison-slope', '97-slopechart-change', '07-comparisonchart-dual', '99-before-after-split', '09-split-2panel', '64-split-quadrant', '112-comparison-table'],
  FLOW: ['51-funnelchart', '47-barchart-horizontal', '113-bracket-tournament', '57-flowdiagram-linear', '58-flowdiagram-branching', '17-phase-horizontal', '63-phase-numbered', '119-kill-chain-steps'],
  PERSON: ['76-organization-card', '75-person-profile', '80-threat-actor-card'],
  MAP: ['34-map-dotplot', '34b-map-country-zoom', '35-map-region-highlight', '36-map-arc-connection', '139-attack-origin-heatmap'],
  NETWORK: ['19-nodenetwork-centered', '24-nodenetwork-hierarchy', '20-nodenetwork-flow', '136-attribution-web'],
  EVIDENCE: ['130-news-article-highlight', '111-magazine-cover', '157-archive-newspaper-reel'],
  DRAMATIC: ['49-heatmap-grid', '30-icongrid-3x3', '31-icongrid-4x4', '77-quote-fullscreen']
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
  const theme = settings?.colorScheme || 'CLEAN'

  const systemPrompt = `You are the FISCAL PAL structural director. You analyze financial scripts and break them into scenes.

CORE IDENTITY:
Illustrations must feel painted by a senior editorial illustrator (WSJ, FT). NO 3D RENDERS.

SCENE TYPES:
- [TEMPLATE]: Financial charts, data, timelines, or structural beats.
- [ILLUSTRATION]: Editorial watercolor illustrations of people, power dynamics, or symbolic scenes.

CATEGORIES (for TEMPLATE only):
${Object.keys(TEMPLATE_CATEGORIES).join(', ')}

DIRECTIVE:
- YOU MUST COVER THE ENTIRE SCRIPT. DO NOT SKIP ANY SENTENCES.
- EVERY SINGLE WORD from the provided script must appear in the "script" field of exactly one scene.
- Maintain exactly a 50/50 split between TEMPLATE and ILLUSTRATION.
- Combine short sentences into single scenes (25-40 words each).

POST-PROCESSING ENFORCER:
1. Final check: Count your TEMPLATE vs ILLUSTRATION scenes. You MUST maintain a 50/50 balance.
2. If short on TEMPLATES, force-convert ILLUSTRATION scenes by extracting data or creating a timeline/chart from the script.
3. Templates are essential for channel identity. Use them aggressively.

OUTPUT FORMAT (JSON array only):
[
  {
    "type": "TEMPLATE",
    "category": "FINANCIAL",
    "script": "exact sentence(s)",
    "reasoning": "why this category fits"
  },
  {
    "type": "ILLUSTRATION",
    "subject": "main character or object (e.g., a stressed banker at a desk)",
    "setting": "background setting (e.g., a busy stock exchange, a quiet library)",
    "style": "editorial watercolor illustration, courtroom sketch aesthetic, loose ink linework",
    "script": "exact sentence(s)",
    "reasoning": "why this illustration fits"
  }
]
`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  })

  const result = await model.generateContent(`Analyze this financial script:\n\n${scriptText}`)
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

  const systemPrompt = `Extract values from the script to fill the fields for the template "${templateName}".

FIELDS TO FILL:
${fieldList}

RULES:
- ALL CAPS labels, max 3 words.
- Keep units ($4.5B).
- If a field is missing, infer logically.

OUTPUT FORMAT (JSON object only):
{ "FIELD_NAME": "value", ... }`

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
// Main Generation Flow
// ─────────────────────────────────────────────
export async function generateScenes(scriptText, generationSettings = null) {
  if (!scriptText?.trim()) throw new Error('Empty script')

  console.log(`🎬 Fiscal Pal: Two-Pass Generation Starting...`)

  let rawScenes = await routeScenes(scriptText, generationSettings)
  console.log(`   ✅ Pass 1 complete: ${rawScenes.length} scenes identified`)

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
        scene.content = await fillSceneFields(scene, templateName)
        const schema = loadSchema(templateName)
        if (schema?.fields) scene.content = fuzzyMapFields(scene.content, schema.fields)
        scene.code = fillTemplate(templateName, scene.theme, scene.content)
      } catch (err) { scene.error = err.message }
    } else {
      console.log(`   🎨 Scene ${scene.index}: Generating Editorial Illustration prompt...`)
      
      const imgModel = googleAI.getGenerativeModel({ model: getGEMINI_MODEL() })
      const imgPrompt = `Create a 60-word editorial watercolor illustration prompt based on this scene: "${scene.script}". 
      Style: courtroom sketch aesthetic, loose ink linework, soft washes, warm muted palette.`
      
      const promptRes = await callGemini(imgModel, imgPrompt)
      scene.prompt = promptRes.response.text().trim()
      
      scene.environment = 'editorial-illustration'
      scene.lower_third = { text: scene.script.substring(0, 50) + '...', attribution: '' }
    }

    processed.push(scene)
  }

  return processed
}
