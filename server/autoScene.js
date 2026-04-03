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
  
  // 1. Strip markdown code blocks if present
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    // 2. Try to extract the first valid JSON array or object
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (innerErr) {
        // 3. Last ditch: try to fix trailing/leading junk manually
        const firstBracket = cleaned.indexOf('[')
        const lastBracket = cleaned.lastIndexOf(']')
        const firstBrace = cleaned.indexOf('{')
        const lastBrace = cleaned.lastIndexOf('}')

        let start = -1, end = -1
        if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
          start = firstBracket; end = lastBracket
        } else if (firstBrace !== -1) {
          start = firstBrace; end = lastBrace
        }

        if (start !== -1 && end !== -1 && end > start) {
          try {
            return JSON.parse(cleaned.substring(start, end + 1))
          } catch (lastErr) {
            console.error('JSON Extraction failed:', lastErr.message)
          }
        }
      }
    }
    throw new Error(`JSON Syntax Error: ${err.message}. Raw text length: ${text.length}`)
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
- [TEMPLATE]: Data visualizations, charts, timelines, or structural beats.
- [3D_RENDER]: Physical environments, objects, or infrastructure (NO HUMANS).

CATEGORIES:
${catalogSummary}

DIRECTIVE:
- YOU MUST COVER THE ENTIRE SCRIPT. DO NOT SKIP ANY SENTENCES.
- EVERY SINGLE WORD from the provided script must appear in the "script" field of exactly one scene.
- Target approximately ${ratio}% TEMPLATE and ${100 - ratio}% 3D_RENDER.
- Combine short sentences into single scenes (25-40 words each).
- Assign a THEME based on mood: THREAT (urgent/red), COLD (analytical/blue), INTEL (mysterious/purple), DARK (dramatic/black), CLEAN (neutral/white).

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

  const result = await model.generateContent(`Analyze this script:\n\n${scriptText}`)
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

  const result = await model.generateContent(`SCRIPT: "${scene.script}"`)
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

      const promptRes = await model.generateContent(imgPrompt)
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
