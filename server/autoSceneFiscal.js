/**
 * autoSceneFiscal.js — FISCAL PAL Director
 *
 * Flow:
 *   1. User pastes raw script text
 *   2. Gemini analyzes using the FISCAL PAL routing engine
 *   3. For [TEMPLATE SCENE]: selects template, theme, fills all schema fields
 *   4. For [ILLUSTRATION]: generates editorial watercolor illustration prompt
 *   5. Returns structured scene array ready for rendering
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fuzzyMapFields } from './templateSystem.js'
import { loadSchema } from './templateRouter.js'
import { fillTemplate, templateExists } from './templateFiller.js'
import { generateTemplate } from './templateGenerator.js'
import { googleAI, getGEMINI_MODEL } from './services/llm.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function buildTemplateCatalog() {
  const schemasDir = path.join(__dirname, 'schemas')
  if (!fs.existsSync(schemasDir)) return ''
  const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'))
  return files.map(f => {
    const s = JSON.parse(fs.readFileSync(path.join(schemasDir, f), 'utf8'))
    const fields = Object.keys(s.fields || {})
    const name = s.template || f.replace('.json', '')
    const desc = s.description || ''
    return `${name} [${desc}]: ${fields.join(', ')}`
  }).join('\n')
}

const TEMPLATE_CATALOG = buildTemplateCatalog()

// ─────────────────────────────────────────────
// FISCAL PAL SYSTEM PROMPT
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the FISCAL PAL scene director. You analyze finance-related documentary scripts and generate scene breakdowns.

CORE IDENTITY:
Every illustration must feel painted by a senior editorial illustrator for a major financial newspaper (WSJ, Financial Times, NYT Courtroom Sketch).

SCENE TYPES:
- [TEMPLATE SCENE]: Remotion animated template (stats, financial charts, timelines, networks, maps)
- [ILLUSTRATION]: AI-generated editorial watercolor illustration. NO 3D RENDERS.

STYLE ANCHOR (INCLUDE VERBATIM IN EVERY ILLUSTRATION PROMPT):
"editorial watercolor illustration, courtroom sketch aesthetic, loose ink linework, soft layered watercolor washes, visible brush texture, warm muted palette, slightly exaggerated realistic proportions, painterly blending, news-media journalistic composition"

COLOR PALETTE (Use visual descriptions ONLY. NEVER use these literal names in your prompts, or they will be rendered as text which we don't want):
- Warm Parchment -> Use "aged paper texture", "cream parchment background"
- Ink Sepia -> Use "dark ink linework", "sepia-toned shadows"
- Federal Navy -> Use "deep navy blue", "dark slate blue"
- Burnished Gold -> Use "metallic gold accents", "warm amber highlights"
- Ledger Green -> Use "muted dollar green", "deep forest green"
- Alert Crimson -> Use "vivid red accents", "crimson highlights"
- Newsprint Gray -> Use "muted halftone gray", "newsprint texture"
- Courtroom Ochre -> Use "warm earthy yellow", "ochre-toned skin"

ROUTING ENGINE — run on every sentence, stop at first YES:
Q1: Human activity/power dynamics/historical moment/symbolic financial scene? → [ILLUSTRATION]
Q2: Chapter opener/structural beat/transition? → [TEMPLATE SCENE] → 42-chapter-word-drop / 43-chapter-typewriter / 44-chapter-countup / 45-chapter-wipe / 158-chapter-word-drop / 81-transition-fade-title / 82-transition-wipe-chapter
Q3: Stock price/market ticker/trading data? → [TEMPLATE SCENE] → 142-stock-ticker-strip / 95-candlestick-ohlc / 156-crypto-price-candles / 98-barchart-race
Q4: Portfolio/allocation/breakdown by percent? → [TEMPLATE SCENE] → 143-portfolio-allocation / 05-donutchart-fill / 06-percentagefill-single / 50-treemap / 148-market-cap-treemap
Q5: Profit/loss/revenue/earnings figure? → [TEMPLATE SCENE] → 144-profit-loss-waterfall / 08-waterfall-chart / 154-earnings-reveal / 109-number-odometer / 72-countup-hero
Q6: KPI/dashboard/multiple financial metrics? → [TEMPLATE SCENE] → 145-kpi-financial-dashboard / 103-dashboard-summary / 01-statcluster-3box / 02-statcluster-2box / 96-bulletchart-kpi
Q7: Interest rate/inflation/compound growth? → [TEMPLATE SCENE] → 146-compound-interest-curve / 147-inflation-erosion / 149-interest-rate-gauge / 52-gaugechart / 04-linechart-draw
Q8: Cash flow/money flow/fund movement? → [TEMPLATE SCENE] → 150-cash-flow-sankey / 93-sankey-flow / 57-flowdiagram-linear
Q9: Debt/payoff/loan timeline? → [TEMPLATE SCENE] → 153-debt-payoff-timeline / 14-timeline-horizontal / 15-timeline-vertical / 16-timeline-escalation
Q10: Risk vs return/comparison of assets? → [TEMPLATE SCENE] → 155-risk-return-scatter / 48-scatterplot / 152-asset-comparison-slope / 97-slopechart-change / 07-comparisonchart-dual
Q11: Break-even/threshold/target figure? → [TEMPLATE SCENE] → 151-break-even-chart / 04-linechart-draw / 03-barchart-vertical
Q12: Before vs after/two contrasting states? → [TEMPLATE SCENE] → 99-before-after-split / 09-split-2panel / 64-split-quadrant / 112-comparison-table
Q13: Ranked list/funnel/top-to-bottom? → [TEMPLATE SCENE] → 51-funnelchart / 47-barchart-horizontal / 113-bracket-tournament
Q14: Named company/institution/organization? → [TEMPLATE SCENE] → 76-organization-card / 75-person-profile / 80-threat-actor-card
Q15: Sequence of dated events/fiscal years? → [TEMPLATE SCENE] → 14-timeline-horizontal / 15-timeline-vertical / 135-threat-actor-timeline / 60-timeline-gantt
Q16: Geographic/country/trade flow/region? → [TEMPLATE SCENE] → 34-map-dotplot / 34b-map-country-zoom / 35-map-region-highlight / 36-map-arc-connection / 139-attack-origin-heatmap
Q17: Network of connections/corporate structure? → [TEMPLATE SCENE] → 19-nodenetwork-centered / 24-nodenetwork-hierarchy / 20-nodenetwork-flow / 136-attribution-web
Q18: Process/regulatory path/step-by-step? → [TEMPLATE SCENE] → 57-flowdiagram-linear / 58-flowdiagram-branching / 17-phase-horizontal / 63-phase-numbered / 119-kill-chain-steps
Q19: News headline/magazine cover/article? → [TEMPLATE SCENE] → 130-news-article-highlight / 111-magazine-cover / 157-archive-newspaper-reel
Q20: Direct quote or single punchy claim? → [TEMPLATE SCENE] → 77-quote-fullscreen OR [ILLUSTRATION] with lower-third
Q21: Heatmap/grid data/correlation matrix? → [TEMPLATE SCENE] → 49-heatmap-grid / 30-icongrid-3x3 / 31-icongrid-4x4
DEFAULT: [ILLUSTRATION] with lower-third

TEMPLATE DIVERSITY RULE:
- You have 170+ templates. USE THEM. Do NOT repeat the same template within a chapter.
- If you used 01-statcluster-3box for one stat, use 02-statcluster-2box, 109-number-odometer, or 72-countup-hero for the next.
- Rotate between chart types: bar → line → donut → waterfall → gauge.
- For financial data, STRONGLY prefer the finance-specific templates (142-156 range) over generic ones.

SENTENCE COMBINING RULES:
- SHORT sentences (under 10 words) that flow together as a sequence or describe the same thematic beat MUST be combined into a single scene.
- You MAY combine up to 3 consecutive short sentences into one scene if they share the same financial context or cinematic moment.
- The "script" field for a combined scene MUST contain the exact full text of all sentences it covers.
- Every word from the input script must appear in the "script" field of exactly one scene. Do NOT drop any content.

GROUNDING TEST (Apply to every [ILLUSTRATION]):
Ask: "Could an editorial illustrator at the Wall Street Journal draw this scene?"
- YES: CEO testifying, trading floor, bank vault, suit-and-tie meeting.
- NO: Abstract money raining, graphs floating in space (put them on a screen or document), futuristic sci-fi.

STRICT VARIETY RULE: 50% Templates / 50% Illustrations. 

TEMPLATE CATALOG:
${TEMPLATE_CATALOG}

OUTPUT FORMAT — Return ONLY a JSON array:
[
  {
    "type": "TEMPLATE",
    "script": "exact text",
    "template": "name",
    "theme": "CLEAN",
    "background_color": "#F2F2F0",
    "content": { ... },
    "duration": 15
  },
  {
    "type": "ILLUSTRATION",
    "script": "exact text",
    "grounding_test": "Reasoning why WSJ would draw this",
    "prompt": "60-80 word prompt including STYLE ANCHOR verbatim and mentioning color palette elements. IMPORTANT: Describe the colors (e.g. 'deep navy blues', 'burnished gold accents') rather than just using the palette names, to avoid the AI rendering the names as text.",
    "lower_third": { "text": "...", "attribution": "..." },
    "duration": 15
  }
]`

function recoverPartialSceneArray(raw) {
  const scenes = []
  const arrayStart = raw.indexOf('[')
  if (arrayStart === -1) return scenes
  let i = arrayStart + 1
  while (i < raw.length) {
    while (i < raw.length && /[\s,]/.test(raw[i])) i++
    if (i >= raw.length || raw[i] !== '{') break
    let depth = 0, inStr = false, strChar = '', j = i
    while (j < raw.length) {
      const ch = raw[j]
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; j++; continue }
      if (inStr) {
        if (ch === '\\') { j += 2; continue }
        if (ch === strChar) inStr = false
        j++; continue
      }
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { j++; break } }
      j++
    }
    if (depth === 0) {
      try {
        const obj = JSON.parse(raw.slice(i, j))
        if (obj && obj.type) scenes.push(obj)
      } catch (_) {}
    } else break
    i = j
  }
  return scenes
}

function buildSettingsPromptBlock(settings) {
  if (!settings) return ''
  const lines = []
  if (settings.defaultTheme) lines.push(`\nVISUAL CONSISTENCY: Always use the theme "${settings.defaultTheme}" for every TEMPLATE scene.`)
  lines.push(`\nSTRICT RATIO RULE: You MUST alternate between [TEMPLATE SCENE] and [ILLUSTRATION] to achieve exactly a 50/50 split. If there are an odd number of scenes, prioritize the type that fits the most recent sentence.`)
  if (settings.customPrompt) lines.push(`\nADDITIONAL INSTRUCTIONS: ${settings.customPrompt}`)
  return lines.join('\n')
}

export async function generateScenes(scriptText, generationSettings = null) {
  const settingsBlock = buildSettingsPromptBlock(generationSettings)
  const fullSystemPrompt = SYSTEM_PROMPT + settingsBlock

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: fullSystemPrompt,
    generationConfig: { temperature: 0.15, responseMimeType: 'application/json' }
  })

  // Pre-split sentences so Gemini knows the expected count
  const sentences = scriptText
    .split(/\n+/)
    .flatMap(line => line.trim().split(/(?<=[.!?…""])\s+/))
    .map(s => s.trim())
    .filter(s => s.length > 5)

  const userPrompt = `Analyze this script and generate a FISCAL PAL scene breakdown. 

CRITICAL COVERAGE RULE:
- Every word from the input script MUST appear in the "script" field of exactly one scene.
- For SHORT sentences, follow the COMBINING RULES provided in the system prompt.
- For all other sentences, generate one scene per sentence.
- Do NOT skip any content.

SCRIPT TO PROCESS:
${scriptText}

SENTENCE LIST (Use as a guide for coverage):
${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}`

  let rawResponse
  try {
    const result = await model.generateContent(userPrompt)
    rawResponse = result.response.text()
  } catch (e) { throw e }

  let scenes
  try {
    scenes = JSON.parse(rawResponse.replace(/```json?\s*\n?/g, '').replace(/```\s*$/g, '').trim())
  } catch (e) {
    scenes = recoverPartialSceneArray(rawResponse)
  }

  if (!Array.isArray(scenes)) scenes = [scenes]

  // --- COVERAGE CHECK & FALLBACK ---
  const coveredSentences = new Set()
  for (const scene of scenes) {
    if (scene.script) {
      for (let si = 0; si < sentences.length; si++) {
        const needle = sentences[si].substring(0, Math.min(30, sentences[si].length)).toLowerCase()
        if (scene.script.toLowerCase().includes(needle)) {
          coveredSentences.add(si)
        }
      }
    }
  }

  const missingSentences = sentences
    .map((s, i) => ({ index: i, text: s }))
    .filter((_, i) => !coveredSentences.has(i))

  if (missingSentences.length > 0) {
    console.warn(`   ⚠️ FISCAL PAL: ${missingSentences.length} sentence(s) skipped by AI — adding fallbacks`)
    for (const missed of missingSentences) {
      scenes.push({
        type: 'ILLUSTRATION',
        script: missed.text,
        grounding_test: "Automatic fallback for skipped sentence",
        prompt: `Editorial watercolor illustration for a financial newspaper. Visualizing: ${missed.text.substring(0, 100)}. Editorial watercolor illustration, courtroom sketch aesthetic, loose ink linework, soft layered watercolor washes, visible brush texture, warm muted palette, slightly exaggerated realistic proportions, painterly blending, news-media journalistic composition.`,
        duration: 15,
        _recovered: true
      })
    }
    // Sort to maintain original script order
    scenes.sort((a, b) => {
      const aIdx = sentences.findIndex(s => a.script?.toLowerCase().includes(s.substring(0, 20).toLowerCase()))
      const bIdx = sentences.findIndex(s => b.script?.toLowerCase().includes(s.substring(0, 20).toLowerCase()))
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }

  const processed = []
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    scene.index = i + 1
    if (!scene.duration) scene.duration = 15
    scene.environment = 'editorial-illustration'

    if (scene.type === 'TEMPLATE' && scene.template) {
      if (templateExists(scene.template)) {
        const schema = loadSchema(scene.template)
        const schemaFields = schema?.fields || {}
        scene.content = fuzzyMapFields(scene.content || {}, schemaFields)
        Object.keys(schemaFields).forEach(key => { if (!(key in scene.content)) scene.content[key] = '' })
        try {
          scene.code = fillTemplate(scene.template, scene.theme || 'CLEAN', scene.content)
        } catch (err) { scene.error = err.message }
      }
    } else if (scene.type === 'ILLUSTRATION') {
       scene.environment = 'editorial-illustration'
    }
    processed.push(scene)
  }

  return processed
}
