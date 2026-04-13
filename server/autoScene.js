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
import { generateImage } from './services/gemini.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCHEMAS_DIR = path.join(__dirname, 'schemas')

// ─────────────────────────────────────────────
// Template Categories Mapping
// ─────────────────────────────────────────────
const TEMPLATE_CATEGORIES = {
  CHAPTER: {
    desc: 'Chapter openers, structural beats, transitions',
    templates: ['42-chapter-word-drop', '43-chapter-typewriter', '44-chapter-countup', '45-chapter-wipe', '46-chapter-glitch', '158-chapter-word-drop', '159-chapter-word-drop', '81-transition-fade-title', '82-transition-wipe-chapter', '83-transition-zoom-reveal', '84-transition-glitch-cut']
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
    templates: ['07-comparisonchart-dual', '112-comparison-table', '99-before-after-split', '09-split-2panel', '10-split-3panel', '11-split-topbottom', '12-split-diagonal', '13-split-percentage', '64-split-quadrant', '65-split-spotlight', '66-split-overlay', '67-split-morph', '68-split-reveal-wipe', '152-asset-comparison-slope']
  },
  FINANCIAL: {
    desc: 'Corporate earnings reports, quarterly results (EPS/revenue beats), profit/loss waterfalls, KPI dashboards for legitimate businesses. DO NOT use for crime statistics, laundered amounts, fraud figures, or victim counts — those belong in STAT or DRAMATIC.',
    templates: ['08-waterfall-chart', '144-profit-loss-waterfall', '154-earnings-reveal', '145-kpi-financial-dashboard', '103-dashboard-summary', '147-inflation-erosion', '151-break-even-chart']
  },
  TIMELINE: {
    desc: 'Dated events, sequence of history, escalations',
    templates: ['14-timeline-horizontal', '15-timeline-vertical', '16-timeline-escalation', '59-timeline-comparison', '60-timeline-gantt', '61-timeline-circular', '79-timeline-incident', '135-threat-actor-timeline', '153-debt-payoff-timeline', '162-threat-actor-timeline']
  },
  FLOW: {
    desc: 'Process diagrams, attack chains, kill chains, exploit flows',
    templates: ['57-flowdiagram-linear', '58-flowdiagram-branching', '119-kill-chain-steps', '121-exploit-chain', '120-lateral-movement', '17-phase-horizontal', '18-phase-circular', '62-phase-vertical', '63-phase-numbered']
  },
  NETWORK: {
    desc: 'Relationships, connections, attack networks, attribution webs',
    templates: ['19-nodenetwork-centered', '20-nodenetwork-flow', '21-nodenetwork-attack', '24-nodenetwork-hierarchy', '53-nodenetwork-bipartite', '54-nodenetwork-timeline', '55-nodenetwork-cluster', '136-attribution-web']
  },
  MAP: {
    desc: 'Geography, country highlights, trade routes, heatmaps, conflict zones, migration, supply chains',
    templates: ['34-map-dotplot', '34b-map-country-zoom', '35-map-region-highlight', '35b-map-country-compare', '36-map-arc-connection', '37-map-spread', '139-attack-origin-heatmap', '140-botnet-spread', '86-map-flight-path', '87-map-supply-chain', '88-map-migration-flow', '89-map-choropleth', '91-map-territory-control', '159-map-timeline-spread', '160-map-location-pin', '162-map-city-neighborhood', '164-map-satellite-reveal', '165-map-before-after', '166-map-multi-city-stats', '167-map-radar-sweep', '168-map-conflict-markers']
  },
  CODE: {
    desc: 'Source code, terminal logs, registry keys, wireshark streams',
    templates: ['38-codesnippet-reveal', '39-terminal-typewriter', '40-logstream-highlight', '41-registrykey-reveal', '122-port-scan-reveal', '123-c2-beacon', '125-hex-dump-scroll', '126-memory-map', '127-wireshark-row-stream', '128-sql-injection-demo', '129-log-anomaly-detect']
  },
  PARTICLE: {
    desc: 'Infection spread, DDoS floods, packet flows',
    templates: ['25-particle-burst', '26-particle-stream', '27-particle-scatter', '28-particle-converge', '29-particle-infection', '22-expanding-origin', '23-expanding-web', '56-expanding-pulse', '74-pulse-rings', '124-packet-flood-ddos']
  },
  ICON_GRID: {
    desc: 'Grids of icons, techniques, spotlight highlights',
    templates: ['30-icongrid-3x3', '31-icongrid-4x4', '32-icongrid-scatter', '33-icongrid-spotlight', '133-ioc-list-stream']
  },
  EVIDENCE: {
    desc: 'Documents, classified reports, newspaper archives, redactions',
    templates: ['78-evidence-item', '157-archive-newspaper-reel', '107-redacted-reveal', '108-stamped-verdict', '115-wanted-poster', '118-classified-stamp', '130-news-article-highlight', '111-magazine-cover', '137-vulnerability-card', '154-file-explorer-leak']
  },
  KNOWLEDGE: {
    desc: 'Web search, knowledge cards, annotations',
    templates: ['152-search-engine-reveal', '151-knowledge-card', '100-zoom-to-detail', '101-scrollytelling-step', '102-annotation-callout', '105-zoom-to-detail', '106-word-highlight-scan', '160-word-highlight-scan', '161-annotation-callout']
  },
  SOCIAL: {
    desc: 'Chat interfaces, social media, dark web listings',
    templates: ['153-social-media-impact', '150-mobile-chat-ui', '156-biometric-access-scan', '138-dark-web-chatter', '116-dark-web-listing']
  },
  DATE: {
    desc: 'Calendars, countdowns, breach counters, alerts',
    templates: ['155-calendar-date-highlight', '131-countdown-breach', '141-breach-counter', '104-alert-notification', '157-alert-notification']
  },
  GAUGE: {
    desc: 'Meters, scores, risk ratings, spider charts',
    templates: ['52-gaugechart', '134-cvss-score-reveal', '149-interest-rate-gauge', '86-radarchart-spider', '87-radarchart-spider', '88-radarchart-spider', '89-radarchart-spider', '91-radarchart-spider']
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
    templates: ['49-heatmap-grid', '48-scatterplot', '155-risk-return-scatter', '90-bubblemap-sized', '92-bubblemap-sized']
  },
  DRAMATIC: {
    desc: 'Glitches, corruption, ransom notes, error cascades, matrix effects',
    templates: ['130-glitch-corrupt', '132-ransom-note-reveal', '110-scramble-decode', '70-glitchreveal-full', '69-morphshape-transform', '71-splitword-assembly', '163-error-cascade', '163-matrix-rain']
  },
  QUOTE: {
    desc: 'Direct quotes, punchy claims',
    templates: ['77-quote-fullscreen']
  },
  IMAGE_SEQUENCE: {
    desc: 'Photo sequences, image montages, evidence reveals, surveillance footage, polaroid collections, filmstrip animations, image grids',
    templates: ['170-image-cascade', '171-image-kenburns', '172-image-polaroid', '173-image-filmstrip', '174-image-stack', '175-image-grid']
  },
  IMAGE_GRID: {
    desc: 'Static image layouts with labeled boxes: 1 image (176), 2 side-by-side (177), 3 in a row (178), 4 in 2x2 grid (179), 5 in 2+3 layout (180), 6 in 3x2 grid (181). Use when the script references people, locations, evidence, products, or any set of images that should be shown together with captions. Each slot shows an upload suggestion when no image is present.',
    templates: ['176-image-1up', '177-image-2up', '178-image-3up', '179-image-4up', '180-image-5up', '181-image-6up']
  }
}

export { TEMPLATE_CATEGORIES }

// ─────────────────────────────────────────────
// Helper: Infer best template category from script text
// Used by ratio enforcer when upgrading 3D_RENDER → TEMPLATE
// ─────────────────────────────────────────────
function inferCategory(script) {
  const s = script.toLowerCase()
  // Corporate finance only — not crime/fraud money amounts
  if (/revenue|profit|loss|earn|quarter|fiscal|eps|dividend|waterfall/.test(s) &&
      !/launder|fraud|scheme|victim|illegal|stolen|corrupt|crime|criminal/.test(s)) return 'FINANCIAL'
  if (/country|countries|nation|region|world|global|continent|geographic/.test(s)) return 'MAP'
  if (/timeline|history|since|before|after|when|year|date|decade/.test(s))         return 'TIMELINE'
  if (/attack|exploit|malware|hack|breach|phish|inject|vulnerab|payload/.test(s))  return 'FLOW'
  if (/network|connect|node|hub|link|relationship|attribution/.test(s))             return 'NETWORK'
  if (/step|phase|stage|process|method|how it works|procedure/.test(s))            return 'FLOW'
  if (/chat|message|post|social|dark web|forum/.test(s))                           return 'SOCIAL'
  if (/document|file|email|record|report|classified|evidence|contract|receipt/.test(s)) return 'EVIDENCE'
  if (/\d+\s*%|percent|rate|ratio|share|portion/.test(s))                          return 'STAT'
  if (/\d/.test(s))                                                                return 'STAT'
  // Atmospheric/narrative object mentions — use dramatic visual templates, NOT data charts
  if (/phone|door|screen|computer|laptop|device|server|terminal|camera|alarm/.test(s)) return 'DRAMATIC'
  // Pure speech / quote
  if (/said|replied|told|asked|admitted|confessed|whispered|shouted/.test(s))      return 'QUOTE'
  return 'STAT'
}

// ─────────────────────────────────────────────
// Helper: Hard ratio enforcement (post-LLM)
// Upgrades 3D_RENDER scenes to TEMPLATE until targetRatio% is reached.
// Prefers scenes with numbers/mechanisms; only touches pure narrative as last resort.
// ─────────────────────────────────────────────
// Score how "TEMPLATE-worthy" a scene is.
// Positive = has data/mechanism signal worth visualising as a chart/diagram.
// Negative = pure human narrative or atmosphere — avoid upgrading if possible.
function templateScore(script) {
  const s = script.toLowerCase()
  let score = 0

  // Strong data signals — these scenes SHOULD be templates
  if (/\$[\d,.]+|\d+\s*(million|billion|thousand)/.test(s))                                        score += 3
  if (/\d+\s*%|percent|ratio|rate|share/.test(s))                                                  score += 3
  if (/\d+\s*(countries|nations|servers|systems|victims|files|records|devices|machines)/.test(s))  score += 3
  if (/(ranked|distributed|allocated|totaled|averaged|peaked|reached|dropped|grew|increased|decreased)/.test(s)) score += 2
  // Mechanism being EXPLAINED (passive — the thing is the subject, not a person)
  if (/(the (malware|virus|exploit|ransomware|botnet|software|algorithm|attack|payload)\s+(spread|encrypts?|infected|scanned|generated|executed|ran|processes?))/.test(s)) score += 2
  if (/(how it works|the process|the method|the technique|the system|the attack chain)/.test(s))   score += 2
  // General numeric/technical content
  if (/\d+/.test(s))                                                                                score += 1
  if (/(global|worldwide|infrastructure|network|database|servers?)/.test(s))                       score += 1

  // Pure human-action penalties — these belong in 3D_RENDER
  if (/^\s*(he|she|they|i|we|his|her|their)\b/i.test(s))                                          score -= 3
  if (/^[A-Z][a-z]+ (said|told|called|walked|sent|wrote|clicked|opened|signed|paid|met|replied|threatened|denied|ran|fled|sat|felt|saw|received|noticed|believed|realized|arrived|waited)/i.test(s)) score -= 3
  if (/(said|replied|told|asked|answered|shouted|whispered|explained|warned|admitted|confessed|denied)\b/.test(s)) score -= 2
  // Atmospheric / sensory — a device doing something ≠ data being shown
  if (/^(the )?(phone|door|email|screen|light|computer|laptop|device|window|car|office|room|building|voice|call|signal|bell|alarm)\s+(rang|opened|flashed|appeared|showed|displayed|arrived|came|started|began|went|turned|lit up)/i.test(s)) score -= 2
  if (/(sat in|sat at|stood at|walked into|entered the|left the|arrived at)/.test(s))              score -= 2

  return score
}

function enforceRatio(scenes, targetRatio) {
  const needed  = Math.ceil(scenes.length * targetRatio / 100)
  const current = scenes.filter(s => s.type === 'TEMPLATE').length
  if (current >= needed) return scenes

  const toUpgrade = needed - current

  // Rank all 3D_RENDER candidates by how data-like they are, highest first.
  // This ensures we always upgrade the most visually "template-worthy" scenes
  // first, and only fall back to pure narrative as a last resort.
  const candidates = scenes
    .filter(s => s.type === '3D_RENDER')
    .map(s => ({ scene: s, score: templateScore(s.script) }))
    .sort((a, b) => b.score - a.score)

  let upgraded = 0
  for (const { scene, score } of candidates) {
    if (upgraded >= toUpgrade) break
    scene.type           = 'TEMPLATE'
    scene.category       = inferCategory(scene.script)
    scene.routing_reason = score >= 1
      ? `[ratio-enforced] Upgraded: data/mechanism content (score: ${score})`
      : `[ratio-enforced:forced] Force-upgraded to meet ${targetRatio}% target`
    upgraded++
  }

  console.log(`   📊 Ratio enforcer: ${current} → ${current + upgraded} TEMPLATE scenes (target: ${needed}/${scenes.length})`)
  return scenes
}

// ─────────────────────────────────────────────
// Helper: Build story context for image prompts
// Gives the cinematographer the who/where/when of the full chapter
// ─────────────────────────────────────────────
export function buildStoryContext(scriptText) {
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
export function loadSchema(templateName) {
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
1. YOU MUST COVER EVERY SENTENCE — output one JSON object per sentence, no exceptions.
2. The "script" field MUST be a COPY-PASTE of the exact sentence from the input — do NOT paraphrase, summarize, merge, split, or add any words. Any deviation will corrupt the output.
3. Target ratio: ${ratio}% TEMPLATE, ${100 - ratio}% 3D_RENDER.
4. POST-PROCESSING ENFORCER: After planning, count your totals. If TEMPLATE count is below ${ratio}%, scan [3D_RENDER] scenes that describe a mechanism or quantity and upgrade them to [TEMPLATE]. Never downgrade pure narrative action.

OUTPUT FORMAT (strict JSON array only):
[
  {
    "type": "TEMPLATE" | "3D_RENDER",
    "category": "STAT" | "FLOW" | ... (TEMPLATE only),
    "script": "<EXACT verbatim sentence copied character-for-character from the input>",
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
export async function fillSceneFields(scene, templateName, priorityFields = null) {
  const schema = loadSchema(templateName)
  if (!schema) return {}

  const allEntries = Object.entries(schema.fields || {})
  // On retry, only send the fields that were unfilled — reduces noise for Gemini
  const schemaEntries = priorityFields
    ? allEntries.filter(([name]) => priorityFields.includes(name))
    : allEntries
  const fieldList = schemaEntries
    .map(([name, desc]) => {
      const description = typeof desc === 'string' ? desc : (desc?.description || name)
      return `- ${name}: ${description}`
    })
    .join('\n')

  // Build an example output block using the exact key names so Gemini
  // never invents shortened variants like STAT_VAL instead of STAT_VALUE_1.
  const exampleOutput = '{' + schemaEntries
    .map(([name, desc]) => {
      const example = typeof desc === 'string' ? '...' : (desc?.example || '...')
      return `"${name}": "${example}"`
    })
    .join(', ') + '}'

  const systemPrompt = `You are an expert data extractor. Extract values from the script to fill the fields for the template "${templateName}".

FIELDS TO FILL:
${fieldList}

RULES:
- Your JSON keys MUST match the field names EXACTLY as shown above — do not abbreviate or rename them.
- Use ALL CAPS for labels, max 3 words.
- Keep units ($4.5B, 44%).
- NEVER output 0, "0", "$0", or any zero placeholder. If the script contains a number ("four billion", "47 countries", "thousands"), extract it directly: "four billion" → "$4B", "forty-seven countries" → "47", "thousands of victims" → "THOUSANDS+".
- NEVER invent statistics, figures, percentages, dollar amounts, or quantities that do not appear in the script. Every value you output must be traceable to a word or phrase in the script.
- If a stat field has no corresponding number or quantity in the script, use a brief ALL-CAPS label extracted from the script topic (e.g. if the script says "budget agencies", use "BUDGET" — not an invented figure like "$85B" or "100%").
- NEVER output "NOT SPECIFIED", "N/A", "UNKNOWN", or any placeholder that signals missing data. Instead, infer the most contextually appropriate short label from the script (e.g. for a CVE field with no ID → "UNDISCLOSED", for a CVSS with no score → "CRITICAL", for patch status with no info → "UNPATCHED", for exploit status → "ACTIVE EXPLOIT").
- For IMAGE_URL_* fields: leave the value exactly as the field name (e.g. "IMAGE_URL_1") — do not invent URLs.

OUTPUT FORMAT (JSON object only, keys must be exact):
${exampleOutput}`

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
// Theme Assignment — per-scene variety
// ─────────────────────────────────────────────
const VALID_THEMES = new Set(['CLEAN', 'THREAT', 'COLD', 'DARK', 'INTEL', 'TECHNICAL', 'CREAM', 'VORTEXIS'])

// Each category maps to an ordered pool; scenes cycle through it so consecutive
// scenes in the same category still look different.
const CATEGORY_THEMES = {
  CODE:           ['TECHNICAL', 'DARK'],
  FLOW:           ['TECHNICAL', 'COLD'],
  NETWORK:        ['DARK', 'TECHNICAL'],
  PARTICLE:       ['TECHNICAL', 'DARK'],
  EVIDENCE:       ['DARK', 'THREAT'],
  DRAMATIC:       ['DARK', 'THREAT'],
  FINANCIAL:      ['CLEAN', 'CREAM'],
  MARKET:         ['CLEAN', 'COLD'],
  PIE_CHART:      ['COLD', 'CLEAN'],
  FLOW_SANKEY:    ['CREAM', 'CLEAN'],
  STAT:           ['COLD', 'DARK'],
  BAR_CHART:      ['COLD', 'CLEAN'],
  LINE_CHART:     ['COLD', 'CLEAN'],
  COMPARISON:     ['CLEAN', 'COLD'],
  HEATMAP:        ['DARK', 'COLD'],
  MAP:            ['DARK', 'INTEL'],
  TIMELINE:       ['DARK', 'COLD'],
  SOCIAL:         ['THREAT', 'DARK'],
  DATE:           ['THREAT', 'DARK'],
  GAUGE:          ['INTEL', 'CLEAN'],
  KNOWLEDGE:      ['INTEL', 'CLEAN'],
  QUOTE:          ['CREAM', 'INTEL'],
  PERSON:         ['INTEL', 'THREAT'],
  ORGANIZATION:   ['INTEL', 'DARK'],
  CHAPTER:        ['DARK', 'THREAT'],
  IMAGE_SEQUENCE: ['DARK', 'INTEL'],
  IMAGE_GRID:     ['DARK', 'COLD'],
  ICON_GRID:      ['TECHNICAL', 'DARK'],
}

// Track per-category usage so consecutive same-category scenes alternate themes
const _categoryCounters = {}

// Detects whether a scene script mentions a human subject (person performing an action)
export function sceneHasHumanSubject(script) {
  const s = script.toLowerCase()
  // Personal pronouns used as subject
  if (/\b(he|she|they|we)\s+\w/.test(s)) return true
  // Generic and role-based human nouns
  if (/\b(person|people|man|woman|men|women|team|group|individual|ceo|executive|employee|officer|hacker|attacker|victim|user|customer|worker|staff|agent|analyst|suspect|whistleblower|director|manager|developer|engineer|lawyer|judge|politician|senator|president|official|investigator|journalist|reporter|founder|investor|trader|banker|criminal|defendant|plaintiff|witness|administrator|technician|researcher|scientist|soldier|detective|spy|informant|perpetrator)\b/.test(s)) return true
  // Named person (capitalized name) followed by an action verb
  if (/^[A-Z][a-z]+\s+(said|told|called|walked|sent|wrote|clicked|opened|signed|paid|met|replied|threatened|denied|ran|fled|sat|felt|saw|received|noticed|believed|realized|arrived|waited|began|started|decided|ordered|hired|fired|bought|sold|built|created|launched|admitted|confessed|escaped|hid|transferred|stole|leaked|hacked|accessed|breached|attacked|warned|blackmailed|bribed|deceived|convinced)/.test(script)) return true
  return false
}

function assignSceneTheme(scene, userTheme) {
  // Scene already has a theme (e.g. coverage-check fallbacks) — keep it, but
  // validate it's a real theme name (not 'auto' or undefined).
  if (scene.theme && VALID_THEMES.has(scene.theme)) return scene.theme

  // User explicitly chose a fixed theme
  if (userTheme && VALID_THEMES.has(userTheme)) return userTheme

  // AUTO mode: derive from category
  const cat = scene.category || (scene.type === '3D_RENDER' ? '_3D' : 'STAT')
  const pool = CATEGORY_THEMES[cat] || ['DARK', 'COLD', 'THREAT']
  const count = _categoryCounters[cat] || 0
  _categoryCounters[cat] = count + 1
  return pool[count % pool.length]
}

// ─────────────────────────────────────────────
// Auto-generate images for IMAGE_SEQUENCE / IMAGE_GRID templates
// Uses SUGGESTION_* values to prompt Gemini image generation,
// then replaces IMAGE_URL_* placeholders with real saved URLs.
// ─────────────────────────────────────────────
async function generateImagesForTemplate(content, schema, sceneScript) {
  const fields = schema?.fields || {}
  const imageKeys = Object.keys(fields).filter(k => /^IMAGE_URL_\d+$/.test(k))
  if (imageKeys.length === 0) return content

  const updated = { ...content }

  for (const imageKey of imageKeys) {
    const idx = imageKey.replace('IMAGE_URL_', '')
    const suggestion = content[`SUGGESTION_${idx}`]

    // Skip if already a real URL (not a placeholder)
    if (content[imageKey] && !/^IMAGE_URL_/.test(content[imageKey])) continue
    // Skip empty suggestions
    if (!suggestion || suggestion.trim() === '') continue

    try {
      // Convert "Upload a screenshot of X" → "X" for image generation prompts
      const visual = suggestion.trim()
        .replace(/^(please\s+)?(upload|add|provide|attach|insert|use)\s+(an?\s+)?(screenshot|photo|photograph|picture|image|still)\s+(?:of|showing|depicting|displaying)\s+/i, '')
        .replace(/^(please\s+)?(upload|add|provide|attach|insert|use)\s+/i, '')
        .trim() || suggestion.trim()
      console.log(`   🖼️ Generating image for slot ${idx}: ${visual.substring(0, 60)}...`)
      const prompt = `Documentary-style photograph or illustration. ${visual}. Scene: "${sceneScript.substring(0, 100)}". Photorealistic, cinematic, 16:9 aspect ratio. No text overlays.`
      const result = await generateImage(prompt, { aspectRatio: '16:9' })
      if (result.success) {
        updated[imageKey] = result.url
        console.log(`   ✅ Slot ${idx} → ${result.url}`)
      } else {
        console.warn(`   ⚠️ Slot ${idx} image generation failed: ${result.error}`)
      }
    } catch (err) {
      console.warn(`   ⚠️ Slot ${idx} error: ${err.message}`)
    }
  }

  return updated
}

// ─────────────────────────────────────────────
// Main Generation Flow
// ─────────────────────────────────────────────
export async function generateScenes(scriptText, generationSettings = null) {
  if (!scriptText?.trim()) throw new Error('Empty script')

  console.log(`🎬 Auto-Scene: Two-Pass Generation Starting...`)

  // Reset per-run category counters so every generation gets fresh variety
  Object.keys(_categoryCounters).forEach(k => delete _categoryCounters[k])

  const userTheme = generationSettings?.colorScheme
  const fixedTheme = userTheme && VALID_THEMES.has(userTheme) ? userTheme : null

  // Build story context once — used by all image prompt calls
  const storyContext = buildStoryContext(scriptText)

  // --- PASS 1: ROUTING ---
  let rawScenes = await routeScenes(scriptText, generationSettings)
  console.log(`   ✅ Pass 1 complete: ${rawScenes.length} scenes identified`)

  // --- TYPE NORMALIZATION ---
  // The LLM sometimes outputs type: "QUOTE" or type: "FLOW" (a category name) instead of
  // type: "TEMPLATE" with category: "QUOTE". Normalize those here so downstream code works.
  rawScenes = rawScenes.map(s => {
    if (s.type !== 'TEMPLATE' && s.type !== '3D_RENDER' && TEMPLATE_CATEGORIES[s.type]) {
      return { ...s, category: s.type, type: 'TEMPLATE' }
    }
    return s
  })

  // --- THEME ASSIGNMENT — assign before ratio enforcement so all scenes get a theme ---
  rawScenes = rawScenes.map(s => ({ ...s, theme: assignSceneTheme(s, fixedTheme) }))

  // --- HARD RATIO ENFORCEMENT (code-level, not LLM-level) ---
  const targetRatio = generationSettings?.templateRatio ?? 60
  rawScenes = enforceRatio(rawScenes, targetRatio)

  // --- COVERAGE CHECK ---
  const sentences = scriptText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5)
  const llmContent = rawScenes.map(s => s.script).join(' ')
  // Use 40-char prefix (more reliable than 20) to detect sentences the LLM dropped or paraphrased
  const missingSentences = sentences.filter(s => {
    const needle = s.toLowerCase().substring(0, Math.min(40, s.length)).trim()
    return !llmContent.toLowerCase().includes(needle)
  })

  if (missingSentences.length > 0) {
    console.warn(`   ⚠️ LLM skipped ${missingSentences.length} sentences. Appending as fallback scenes.`)
    missingSentences.forEach(s => {
      rawScenes.push({
        type: '3D_RENDER',
        theme: fixedTheme || 'THREAT',
        script: s,
        reasoning: 'Fallback: Sentence skipped by LLM during analysis'
      })
    })
  }

  // Enforce word band per scene (configurable via generationSettings.wordsPerScene)
  const maxWords = generationSettings?.wordsPerScene ?? 25
  const minWords = Math.max(10, Math.floor(maxWords * 0.6))
  const beforeCount = rawScenes.length
  rawScenes = normalizeSceneWordCounts(rawScenes, minWords, maxWords)
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

      // Pick the next available template in category as alternative suggestion
      const allCatTemplates = catInfo.templates
      const primaryIdx = allCatTemplates.indexOf(templateName)
      const altChoices = allCatTemplates.filter(t => t !== templateName)
      scene.alternativeTemplate = altChoices.length > 0 ? altChoices[primaryIdx % altChoices.length] : null

      console.log(`   🛠️ Scene ${scene.index}: Category ${scene.category} → ${templateName} (alt: ${scene.alternativeTemplate})`)

      // --- PASS 2: FIELD FILLING ---
      try {
        const schema = loadSchema(templateName)

        // Attempt field fill — retry once if too many placeholders survive
        let content = await fillSceneFields(scene, templateName)
        if (schema?.fields) content = fuzzyMapFields(content, schema.fields)

        // Auto-generate images for image template categories
        if (scene.category === 'IMAGE_SEQUENCE' || scene.category === 'IMAGE_GRID') {
          content = await generateImagesForTemplate(content, schema, scene.script)
        }

        // Post-fill validation: count unfilled schema placeholders in generated code
        const candidateCode = fillTemplate(templateName, scene.theme, content)
        const schemaKeys = schema?.fields ? Object.keys(schema.fields) : []
        const unfilled = schemaKeys.filter(k => candidateCode.includes(`'${k}'`) || candidateCode.includes(`"${k}"`))

        if (unfilled.length > 0) {
          console.warn(`   ⚠️ Scene ${scene.index}: ${unfilled.length} unfilled placeholders after Pass 2 [${unfilled.slice(0, 3).join(', ')}${unfilled.length > 3 ? '...' : ''}] — retrying field fill`)
          // Retry: fresh Gemini call, same template, unfilled fields highlighted in prompt
          const retryContent = await fillSceneFields(scene, templateName, unfilled)
          const merged = { ...content, ...retryContent }
          const remapped = schema?.fields ? fuzzyMapFields(merged, schema.fields) : merged
          const retryCode = fillTemplate(templateName, scene.theme, remapped)
          const stillUnfilled = schemaKeys.filter(k => retryCode.includes(`'${k}'`) || retryCode.includes(`"${k}"`))
          if (stillUnfilled.length < unfilled.length) {
            content = remapped
            scene.code = retryCode
            console.log(`   ✅ Scene ${scene.index}: retry reduced unfilled from ${unfilled.length} → ${stillUnfilled.length}`)
          } else {
            scene.code = candidateCode
          }
        } else {
          scene.code = candidateCode
        }

        scene.content = content
        console.log(`   🎨 Scene ${scene.index}: ${templateName} [${scene.theme}] filled`)
      } catch (err) {
        console.error(`   ❌ Scene ${scene.index} failed:`, err.message)
        scene.error = err.message
      }
    } else {
      // 3D Render Prompt Generation — THREE-STEP CINEMATOGRAPHY METHOD
      console.log(`   🖼️ Scene ${scene.index}: Generating cinematic 3D prompt...`);
      
      let cinematographerIdentity = "You are the ARXXIS cinematographer. You write image generation prompts for photorealistic 3D documentary scenes.";
      let initialInstruction = "You NEVER describe people — only environments, objects, and atmosphere.";
      let styleRules = `• 60–80 words maximum
• Dark, moody, cinematic color grading — vary the palette: cool blue steel, amber tungsten, sickly green fluorescent, harsh white institutional, blood-red neon
• Lighting setup must differ from a generic "single dramatic spotlight" — use: overhead fluorescent wash, venetian blind shadow bars, backlit silhouette against a frosted window, emergency lighting, candlelight, monitor glow, golden-hour shaft through blinds
• Hyperrealistic surface textures (brushed metal, worn leather, glass, concrete, aged wood, glossy marble, cracked asphalt, laminate desk)
• No humans, no faces, no hands, no body parts
• No text, no labels, no UI elements on screens (blur or obscure them)
• Shallow depth of field — hero object sharp, background soft
• 16:9 cinematic framing`;

      if (scene.theme === 'VORTEXIS' || generationSettings?._directorType === 'vortexis') {
        const hasHuman = sceneHasHumanSubject(scene.script)
        const SILHOUETTE_COLORS = ['pure red', 'pure blue', 'pure black'];
        const assignedColor = SILHOUETTE_COLORS[i % SILHOUETTE_COLORS.length];
        cinematographerIdentity = "You are the VORTEXIS stylistic director. You write image generation prompts for highly stylized, minimalist Unity 3D engine renders.";
        if (hasHuman) {
          initialInstruction = `This scene involves a human subject. Render them as a featureless, solid-colored silhouette — for this scene the color MUST be ${assignedColor}. NEVER use realistic human details.`;
          styleRules = `• 60–80 words maximum
• Unity 3D engine render style
• True isometric orthographic camera angle
• Heavy vignette: bright spotlight illuminating the center, fading into pitch-black edges
• Human figures MUST be featureless, flat silhouettes in ${assignedColor}
• SCALE IS CRITICAL: all objects must be proportional to the human figure — a monitor is desktop-sized (roughly head-height), a desk is waist-height, a chair is seat-height. NEVER make any object larger than a real human would encounter it.
• If the scene involves data, charts, or a computer — silhouette must be SEATED at a desk facing a normal-sized monitor; the chart/graph appears ON the monitor screen, not floating or projected on a wall
• BANNED: floating screens, giant wall-mounted displays, oversized monitors larger than the figure, UI panels projected on walls, holograms — these are not real and must NEVER appear
• All props must be real, physical, correctly-scaled objects in a believable room
• Exactly depict the literal objects and actions described in the script
• Clean, minimalist environments with smooth matte materials
• NO text, NO labels, NO typography of any kind
• 16:9 aspect ratio`;
        } else {
          initialInstruction = "This scene has NO human subjects. Describe ONLY the specific objects, spaces, and environments from the script. No people, no silhouettes.";
          styleRules = `• 60–80 words maximum
• Unity 3D engine render style
• True isometric orthographic camera angle
• Heavy vignette: bright spotlight illuminating the center, fading into pitch-black edges
• NO people, NO silhouettes — objects and environments only
• BANNED: floating screens, giant wall-mounted displays, oversized UI panels, holograms — these are not real and must NEVER appear
• All objects must be physical, real-world, desk- or room-sized
• Exactly depict the literal objects described in the script
• Clean, minimalist environments with smooth matte materials
• NO text, NO labels, NO typography of any kind
• 16:9 aspect ratio`;
        }
      }

      const model = googleAI.getGenerativeModel({
        model: getGEMINI_MODEL(),
        systemInstruction: `${cinematographerIdentity} ${initialInstruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULE — SUBJECT FIRST, SPECIFIC ALWAYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your prompt MUST open with the EXACT subject from the scene — the specific object, device, place, or silhouette named in the script.
• Your FIRST 5–8 words must name the specific subject (e.g. "Stack of printed bank statements", "Server rack in a dimly lit cage", "Courtroom bench with scattered folders").
• NEVER open with mood, atmosphere, or setting ("A dark room...", "Dramatic lighting...", "Moody scene...").
• BANNED DEFAULTS — NEVER show these unless the script explicitly names them: smartphone, mobile phone, laptop, computer screen, keyboard, tablet, monitor, generic office desk.
• If the script says nothing about electronics, do NOT invent them. Use what IS in the script: physical spaces, documents, vehicles, furniture, machinery, signage, architecture.
• If the scene mentions a specific company, country, device, or event — name it directly.
• The viewer must be able to identify the story from the image alone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THREE-STEP METHOD (follow in order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — NAME THE SUBJECT
The ONE specific object, place, or silhouette from THIS scene. Make it concrete and named.
This is your opening clause — begin the prompt here.

STEP 2 — DESCRIBE ITS STATE OR ACTION
What is it doing, showing, or conveying? Be literal to the script.

STEP 3 — SET THE ENVIRONMENT AND ATMOSPHERE
Room type, lighting quality, depth of field, color temperature, surface materials.
One emotional quality: tension, isolation, dread, secrecy, discovery, betrayal, urgency.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styleRules}

Output only the prompt text. No explanation. No preamble. Begin with the subject.`
      })

      const promptRes = await callGemini(model, `${storyContext}\n\nSCENE TO VISUALIZE: "${scene.script}"`)
      scene.prompt = promptRes.response.text().trim()
      
      const isVortexis = scene.theme === 'VORTEXIS' || generationSettings?._directorType === 'vortexis';
      scene.environment = isVortexis ? 'vortexis' : 'infrastructure'
      scene.camera = 'cinematic'
      scene.lower_third = { text: scene.script.substring(0, 50) + '...', attribution: '', tone: '#FFAA00' }
    }

    processed.push(scene)
  }

  // Auto-save
  autoSaveGeneration(scriptText, processed)
  return processed
}

// ─────────────────────────────────────────────
// Exported: Re-generate image prompt for a single 3D_RENDER scene
// Called by POST /api/projects/:pid/chapters/:cid/scenes/:idx/regenerate-prompt
// ─────────────────────────────────────────────
export async function regenerateImagePrompt(sceneScript, chapterScriptText, theme = null, directorType = null) {
  const storyContext = buildStoryContext(chapterScriptText || sceneScript)

  let cinematographerIdentity = "You are the ARXXIS cinematographer. You write image generation prompts for photorealistic 3D documentary scenes.";
  let initialInstruction = "You NEVER describe people — only environments, objects, and atmosphere.";
  let styleRules = `60–80 words, dark cinematic, vary the lighting (fluorescent wash, venetian blind shadows, monitor glow, neon, golden-hour shaft), hyperrealistic textures, no humans/faces/hands, no readable text on screens, shallow DOF, 16:9. NEVER default to smartphone/laptop/screen unless the script explicitly names one.`;

  if (theme === 'VORTEXIS' || directorType === 'vortexis') {
    const hasHuman = sceneHasHumanSubject(sceneScript)
    cinematographerIdentity = "You are the VORTEXIS stylistic director. You write image generation prompts for highly stylized, minimalist Unity 3D engine renders.";
    if (hasHuman) {
      initialInstruction = "This scene involves a human subject. Render them as a featureless, solid-colored silhouette (pure red, pure blue, or pure black). NEVER use realistic human details.";
      styleRules = `60–80 words, Unity 3D engine render style, true isometric orthographic camera angle, heavy vignette (bright center, pitch-black edges), human figures MUST be featureless flat silhouettes in pure red/blue/black, SCALE IS CRITICAL — all objects must be proportional to the human figure (monitor is desktop-sized not room-sized, desk is waist-height, chair is seat-height), if scene involves data or a computer the silhouette must be SEATED at a desk with a normal-sized monitor (chart appears ON screen — NOT floating or on a wall), BANNED: floating screens/giant wall displays/holograms/oversized monitors larger than the figure/oversized UI panels, all props must be real physical correctly-scaled objects, EXACTLY depict objects from script, clean minimalist environments with smooth matte materials, NO text/labels, 16:9 aspect ratio.`;
    } else {
      initialInstruction = "This scene has NO human subjects. Describe ONLY the specific objects, spaces, and environments from the script. No people, no silhouettes.";
      styleRules = `60–80 words, Unity 3D engine render style, true isometric orthographic camera angle, heavy vignette (bright center, pitch-black edges), NO people or silhouettes — objects and environments only, BANNED: floating screens/giant wall displays/holograms/oversized UI panels, all objects must be physical real-world desk- or room-sized, EXACTLY depict objects from script, clean minimalist environments with smooth matte materials, NO text/labels, 16:9 aspect ratio.`;
    }
  }

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: `${cinematographerIdentity} ${initialInstruction}

CRITICAL RULE — SUBJECT FIRST, SPECIFIC ALWAYS
Your prompt MUST open with the EXACT subject from the scene — the specific object, device, place, or silhouette named in the script.
• Your FIRST 5–8 words must name the specific subject (e.g. "Stack of printed bank statements", "Red silhouette hunched over a keyboard", "Server rack in a dimly lit cage").
• NEVER open with mood, atmosphere, or setting ("A dark room...", "Dramatic lighting...", "Moody scene...").
• NEVER default to a smartphone, laptop, or screen unless the scene script explicitly mentions one.
• If the scene mentions a specific company, country, device, or event — name it directly.
• The viewer must be able to identify the story from the image alone.

THREE-STEP METHOD:
1. SUBJECT — name the ONE specific object, place, or silhouette from the scene. Begin the prompt here.
2. STATE / ACTION — what is it doing or showing? Be literal to the script.
3. ENVIRONMENT — room type, lighting, depth of field, color temperature, surface materials + one emotional quality.

STYLE: ${styleRules}
Output only the prompt text. Begin with the subject.`,
  })

  const result = await callGemini(model, `${storyContext}

SCENE TO VISUALIZE: "${sceneScript}"`)
  return result.response.text().trim()
}

function autoSaveGeneration(scriptText, scenes) {
  try {
    const genDir = path.join(__dirname, 'generations')
    if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true })
    const filename = `gen_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    fs.writeFileSync(path.join(genDir, filename), JSON.stringify({ scriptText, scenes }, null, 2))
  } catch (e) {}
}

