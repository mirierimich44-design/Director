/**
 * autoScene.js — Paste script text → Gemini routes + fills templates automatically
 *
 * Flow:
 *   1. User pastes raw script text (one or more sentences)
 *   2. Gemini analyzes each sentence using the ARXXIS routing engine
 *   3. For [TEMPLATE SCENE]: selects template, theme, fills all schema fields
 *   4. For [3D RENDER]: generates render prompt + lower-third if needed
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

// ─────────────────────────────────────────────
// Build the template catalog string for the prompt
// ─────────────────────────────────────────────
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

// Cache the catalog (doesn't change at runtime)
const TEMPLATE_CATALOG = buildTemplateCatalog()

// ─────────────────────────────────────────────
// System prompt for scene generation
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the ARXXIS scene director. You analyze documentary script text and generate scene breakdowns.

SCENE TYPES:
- [TEMPLATE SCENE]: Remotion animated template (stats, timelines, networks, maps, code, profiles, chapters, transitions)
- [3D RENDER]: AI-generated photorealistic environment (physical spaces, infrastructure, technology, objects — STRICTLY NO HUMANS, NO PEOPLE, NO FACES, NO BODY PARTS).

ROUTING ENGINE — run on every sentence, stop at first YES:
Q1: Physical space/object/infrastructure/environment/hardware? → [3D RENDER] (Focus on objects only, NEVER include humans)
Q2: Chapter opener/structural beat/transition? → [TEMPLATE SCENE] → 42-chapter-word-drop / 43-chapter-typewriter / 44-chapter-countup / 45-chapter-wipe / 46-chapter-glitch / 158-chapter-word-drop / 81-transition-fade-title / 82-transition-wipe-chapter / 83-transition-zoom-reveal / 84-transition-glitch-cut
Q3: Named hacker/threat actor/person? → [TEMPLATE SCENE] → 75-person-profile / 80-threat-actor-card / 85-person-profile
Q4: Named organization/company/victim? → [TEMPLATE SCENE] → 76-organization-card / 114-dossier-open / 117-breach-report-card
Q5: Single big number/stat/key figure? → [TEMPLATE SCENE] → 01-statcluster-3box / 02-statcluster-2box / 72-countup-hero / 109-number-odometer / 06-percentagefill-single / 96-bulletchart-kpi
Q6: Bar chart data/ranked comparison? → [TEMPLATE SCENE] → 03-barchart-vertical / 47-barchart-horizontal / 98-barchart-race / 113-bracket-tournament
Q7: Trend over time/line data? → [TEMPLATE SCENE] → 04-linechart-draw / 97-slopechart-change / 146-compound-interest-curve
Q8: Percentage/share/pie breakdown? → [TEMPLATE SCENE] → 05-donutchart-fill / 143-portfolio-allocation / 50-treemap / 148-market-cap-treemap / 94-marimekko-mosaic
Q9: Two+ items compared side-by-side? → [TEMPLATE SCENE] → 07-comparisonchart-dual / 112-comparison-table / 99-before-after-split / 09-split-2panel / 64-split-quadrant / 152-asset-comparison-slope
Q10: Financial waterfall/profit-loss/revenue? → [TEMPLATE SCENE] → 08-waterfall-chart / 144-profit-loss-waterfall / 154-earnings-reveal / 145-kpi-financial-dashboard / 103-dashboard-summary
Q11: Sequence of dated events/timeline? → [TEMPLATE SCENE] → 14-timeline-horizontal / 15-timeline-vertical / 16-timeline-escalation / 59-timeline-comparison / 60-timeline-gantt / 79-timeline-incident / 135-threat-actor-timeline / 153-debt-payoff-timeline
Q12: Attack method/kill chain/exploit flow? → [TEMPLATE SCENE] → 57-flowdiagram-linear / 58-flowdiagram-branching / 119-kill-chain-steps / 121-exploit-chain / 120-lateral-movement / 17-phase-horizontal / 63-phase-numbered
Q13: Network of connections/relationships? → [TEMPLATE SCENE] → 19-nodenetwork-centered / 20-nodenetwork-flow / 21-nodenetwork-attack / 24-nodenetwork-hierarchy / 53-nodenetwork-bipartite / 55-nodenetwork-cluster / 136-attribution-web
Q14: Country/geography/trade routes? → [TEMPLATE SCENE] → 34-map-dotplot / 34b-map-country-zoom / 35-map-region-highlight / 35b-map-country-compare / 36-map-arc-connection / 37-map-spread / 139-attack-origin-heatmap / 140-botnet-spread
Q15: Code/malware/exploit/terminal output? → [TEMPLATE SCENE] → 38-codesnippet-reveal / 39-terminal-typewriter / 40-logstream-highlight / 41-registrykey-reveal / 122-port-scan-reveal / 125-hex-dump-scroll / 126-memory-map / 127-wireshark-row-stream / 128-sql-injection-demo / 129-log-anomaly-detect
Q16: Scale of spread/infection/particle? → [TEMPLATE SCENE] → 25-particle-burst / 26-particle-stream / 27-particle-scatter / 29-particle-infection / 124-packet-flood-ddos / 56-expanding-pulse
Q17: List of icons/techniques/grid? → [TEMPLATE SCENE] → 30-icongrid-3x3 / 31-icongrid-4x4 / 32-icongrid-scatter / 33-icongrid-spotlight / 133-ioc-list-stream
Q18: Evidence/documents/archive records? → [TEMPLATE SCENE] → 78-evidence-item / 157-archive-newspaper-reel / 107-redacted-reveal / 108-stamped-verdict / 118-classified-stamp / 130-news-article-highlight / 111-magazine-cover
Q19: Web discovery/search/knowledge? → [TEMPLATE SCENE] → 152-search-engine-reveal / 151-knowledge-card / 100-zoom-to-detail / 102-annotation-callout
Q20: Social media/chat/biometric? → [TEMPLATE SCENE] → 153-social-media-impact / 150-mobile-chat-ui / 156-biometric-access-scan / 138-dark-web-chatter / 116-dark-web-listing
Q21: Specific date/calendar/countdown? → [TEMPLATE SCENE] → 155-calendar-date-highlight / 131-countdown-breach / 141-breach-counter
Q22: Gauge/meter/score/rating? → [TEMPLATE SCENE] → 52-gaugechart / 134-cvss-score-reveal / 149-interest-rate-gauge / 86-radarchart-spider
Q23: Flow/sankey/money movement? → [TEMPLATE SCENE] → 93-sankey-flow / 150-cash-flow-sankey / 51-funnelchart
Q24: Stock/ticker/market data? → [TEMPLATE SCENE] → 142-stock-ticker-strip / 95-candlestick-ohlc / 73-ticker-scroll / 156-crypto-price-candles
Q25: Heatmap/correlation/grid data? → [TEMPLATE SCENE] → 49-heatmap-grid / 48-scatterplot / 155-risk-return-scatter / 90-bubblemap-sized
Q26: Glitch/corruption/ransom/dramatic reveal? → [TEMPLATE SCENE] → 130-glitch-corrupt / 132-ransom-note-reveal / 110-scramble-decode / 70-glitchreveal-full / 163-error-cascade
Q27: Direct quote or single punchy claim? → [3D RENDER] + lower-third OR 77-quote-fullscreen
DEFAULT: [3D RENDER] with lower-third

STRICT VARIETY RULE: 
- DO NOT repeat a template within the same chapter.
- Rotate between 3D renders and Templates to maintain visual pacing.
- Prefer a mix of "Micro" (code/logs) and "Macro" (maps/infrastructure) views.

TEMPLATE SELECTION:
- MAXIMIZE VARIETY: Do not over-use a few common templates. ARXXIS has a vast library (see below); select the most specific and visually appropriate one for each moment.
- If multiple templates fit, choose the one used less frequently in this script.
- Aim for a dynamic visual flow by alternating between different template categories (stats, timelines, networks, maps).

MOOD-BASED THEME & COLOR SELECTION:
Analyze the emotional "mood" of each scene before selecting its visual style:
- URGENT / AGGRESSIVE (Breaches, active attacks, data loss) → Theme: THREAT. Use deep reds or dark charcoal backgrounds.
- ANALYTICAL / COLD (Calculated moves, nation-state actors, code analysis) → Theme: COLD or TECHNICAL. Use midnight blues or dark cyans.
- MYSTERIOUS / CLASSIFIED (Uncovering secrets, hidden identities, dossiers) → Theme: INTEL or DARK. Use deep purples or muted ambers.
- DRAMATIC / TRANSITIONAL (Major reveals, shifting focus, chapter starts) → Theme: DARK. Use near-black (#050505).
- NEUTRAL / INFORMATIONAL (General stats, market data, broad context) → Theme: CLEAN. Use soft off-whites or very light greys.

CUSTOM COLOR OVERRIDE:
If the standard themes don't perfectly match the mood, you MUST provide a specific hex code in the "background_color" field that better captures the atmosphere (e.g., a very dark forest green for "espionage in nature" or a deep blood-red for "catastrophic failure").

TEMPLATE CATALOG (name [description]: fields):
${TEMPLATE_CATALOG}

SCENE LENGTH & PACING RULES (STRICT ENFORCEMENT):
The goal is viewer rhythm. Scenes that are too long cause fatigue; scenes that are too short feel rushed.
Target sweet spot: 25–40 words per scene (~10–16 seconds of narration at 150 wpm).

COMBINING (scenes that are too short):
- SHORT sentences (under 15 words) MUST be combined with up to 3–4 consecutive sentences that share the same cinematic beat or mood.
- Never give a single short sentence its own scene unless it is a major structural beat (chapter transition, dramatic reveal, or punch line — e.g. "Then the botnet was rebuilt." is a valid standalone beat).
- Combine up to 5 consecutive short sentences into one scene if they form a single idea.

SPLITTING (scenes that are too long):
- Any script block over 50 words MUST be split at a natural clause boundary.
- Split so each half lands at 25–40 words, not unevenly (e.g. 10/40).

TEMPLATE-SPECIFIC WORD COUNT TARGETS:
- Data/stat templates (statcluster, comparisonchart, icongrid, gaugechart, countup): 15–30 words. The visual carries the weight — keep narration tight.
- Person/event/date templates (person-profile, organization-card, calendar-date-highlight, dossier): 25–35 words. Introduce and name, don't explain at length.
- Process/network/movement templates (lateral-movement, kill-chain, nodenetwork, flowdiagram): 35–45 words. Name the action clearly; stop before explaining every step.
- Transition/chapter templates (chapter-wipe, transition-fade-title, transition-wipe-chapter): 30–45 words. These are interstitial; slightly longer is acceptable.
- 3D Render scenes: 25–40 words. The image is the scene; narration sets atmosphere only.

VARIETY ACROSS A CHAPTER:
- After two consecutive long scenes (35+ words), the next should be short (15–25 words) to reset pace.
- After two consecutive 3D Renders, insert a TEMPLATE scene.
- Punchy one-beat sentences (10–18 words) are valuable as rhythmic breaks — use them deliberately, not as overflow.

EXACT TEXT RULE:
- The "script" field MUST contain the exact text for that scene (full sentence, combined sentences, or split portion).
- Every word from the input must appear in exactly one scene's "script" field. Do NOT drop any content.

CONTENT RULES:
- Fill EVERY field from the schema using EXACT field names from the catalog above.
- Labels: ALL CAPS, max 3 words. Values: keep units ($4.5B, 44%, 47 days).
- If a field cannot be filled from the script → infer logically, never leave blank.
- For fields that don't apply, use empty string "".

OUTPUT FORMAT — Return ONLY a JSON array, no markdown:
[
  {
    "type": "TEMPLATE",
    "script": "exact sentence(s)",
    "template": "template-name-from-catalog",
    "theme": "THEME_NAME",
    "background_color": "#HEXCODE",
    "reasoning": "why this mood/color fits",
    "content": { "FIELD_NAME": "value", ... },
    "duration": 15
  },
  {
    "type": "3D_RENDER",
    "script": "exact sentence(s)",
    "environment": "category",
    "camera": "angle",
    "lighting": "A/B/C",
    "background_color": "#HEXCODE",
    "object_link": "This object represents X because Y",
    "prompt": "60-80 word render prompt",
    "motion": "Cinematic motion. Use keywords like 'zoom-in' (dolly forward), 'zoom-out' (dolly back), 'pan-left', or 'pan-right'. Describe it clearly.",
    "lower_third": { "text": "...", "attribution": "...", "tone": "#FF6600" },
    "duration": 15
  }
]`

// ─────────────────────────────────────────────
// Recover complete scene objects from truncated JSON
// Gemini hits its output token limit mid-array; this extracts
// every object that has a balanced closing brace before the cut.
// ─────────────────────────────────────────────
function recoverPartialSceneArray(raw) {
  const scenes = []
  // Find the opening [ of the array
  const arrayStart = raw.indexOf('[')
  if (arrayStart === -1) return scenes

  let i = arrayStart + 1
  while (i < raw.length) {
    // Skip whitespace and commas between objects
    while (i < raw.length && /[\s,]/.test(raw[i])) i++
    if (i >= raw.length || raw[i] !== '{') break

    // Find the matching closing } by counting brace depth
    let depth = 0
    let inStr = false
    let strChar = ''
    let j = i
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
      } catch (_) { /* object itself malformed — skip */ }
    } else {
      break // hit truncation — rest is incomplete
    }
    i = j
  }
  return scenes
}

// ─────────────────────────────────────────────
// Merge consecutive short 3D_RENDER scenes
// Runs after LLM response as a guaranteed pass.
// Short = script under SHORT_WORD_LIMIT words.
// ─────────────────────────────────────────────
const SHORT_WORD_LIMIT = 10
const MAX_GROUP_SIZE = 4

function mergeShortRenderScenes(scenes) {
  const merged = []
  let i = 0

  while (i < scenes.length) {
    const scene = scenes[i]

    // Only try to merge 3D_RENDER scenes with short scripts
    const isShortRender = scene.type === '3D_RENDER' &&
      scene.script && scene.script.split(/\s+/).length < SHORT_WORD_LIMIT

    if (!isShortRender) {
      merged.push(scene)
      i++
      continue
    }

    // Collect consecutive short 3D_RENDER neighbours
    const group = [scene]
    let j = i + 1
    while (
      j < scenes.length &&
      group.length < MAX_GROUP_SIZE &&
      scenes[j].type === '3D_RENDER' &&
      scenes[j].script &&
      scenes[j].script.split(/\s+/).length < SHORT_WORD_LIMIT
    ) {
      group.push(scenes[j])
      j++
    }

    if (group.length === 1) {
      // Nothing to merge
      merged.push(scene)
    } else {
      // Merge: join scripts, keep first scene's visual fields as base
      const combinedScript = group.map(s => s.script).join(' ')
      const base = group[0]
      const longestDuration = Math.max(...group.map(s => s.duration || 15))
      merged.push({
        ...base,
        script: combinedScript,
        duration: longestDuration + (group.length - 1) * 1, // add 1s per extra sentence
        _merged: group.length,
      })
      console.log(`   🔗 Merged ${group.length} short 3D_RENDER scenes into one`)
    }

    i = j
  }

  return merged
}

// ─────────────────────────────────────────────
// Main function: script text → scene array
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Build dynamic prompt additions from project generation settings
// ─────────────────────────────────────────────
function buildSettingsPromptBlock(settings) {
  if (!settings) return ''
  const lines = []

  // Template vs 3D_RENDER ratio
  const ratio = settings.templateRatio ?? 60
  lines.push(`\nVISUAL CONSISTENCY: Always use the theme "${settings.defaultTheme || 'THREAT'}" for every TEMPLATE scene.`)
  lines.push(`\nTEMPLATE / IMAGE RATIO DIRECTIVE:`)
  lines.push(`- Target approximately ${ratio}% TEMPLATE scenes and ${100 - ratio}% 3D_RENDER scenes.`)
  if (ratio >= 80) lines.push(`- Strongly prefer templates over 3D renders. Only use 3D_RENDER for physical environments or quotes.`)
  else if (ratio <= 30) lines.push(`- Strongly prefer 3D renders for visual richness. Only use TEMPLATE for hard statistics or timelines.`)

  // Color scheme
  if (settings.colorScheme && settings.colorScheme !== 'auto') {
    if (settings.colorScheme === 'custom' && settings.customColors) {
      lines.push(`\nCOLOR SCHEME OVERRIDE:`)
      lines.push(`- Use this custom palette for ALL scenes unless the mood strongly demands otherwise:`)
      lines.push(`  Primary: ${settings.customColors.primary}, Background: ${settings.customColors.background}, Accent: ${settings.customColors.accent}`)
    } else {
      lines.push(`\nCOLOR SCHEME OVERRIDE:`)
      lines.push(`- Default theme for all scenes: ${settings.colorScheme}. Only deviate if the mood is clearly mismatched.`)
    }
  }

  // Template variety enforcement
  const variety = settings.templateVariety || 'high'
  const maxReuse = settings.maxTemplateReuse ?? 1
  lines.push(`\nTEMPLATE VARIETY ENFORCEMENT (${variety.toUpperCase()} mode):`)
  if (variety === 'high') {
    lines.push(`- CRITICAL: A template name MUST NOT appear more than ${maxReuse} time(s) across all scenes in this chapter.`)
    lines.push(`- Before selecting a template, mentally review which templates you have already used and PICK A DIFFERENT ONE.`)
    lines.push(`- If you run out of unique templates in a category, switch to a related category (e.g., use a different stat visualization, a different timeline style).`)
    lines.push(`- NEVER repeat the same template in consecutive scenes.`)
  } else if (variety === 'medium') {
    lines.push(`- A template should not appear more than ${maxReuse + 1} times. Prefer variety but occasional reuse is acceptable.`)
  } else {
    lines.push(`- Template reuse is acceptable when the same visualization type fits multiple scenes.`)
  }

  // Custom user prompt
  if (settings.customPrompt && settings.customPrompt.trim()) {
    lines.push(`\nDIRECTOR'S ADDITIONAL INSTRUCTIONS:`)
    lines.push(settings.customPrompt.trim())
  }

  return lines.join('\n')
}

export async function generateScenes(scriptText, generationSettings = null) {
  if (!scriptText || typeof scriptText !== 'string' || scriptText.trim().length === 0) {
    throw new Error('scriptText is empty or missing — the chapter has no script to analyze')
  }
  console.log(`\n🎬 Auto-Scene: Processing ${scriptText.length} chars of script...`)
  if (generationSettings) console.log(`   ⚙️ Generation settings: ratio=${generationSettings.templateRatio}%, variety=${generationSettings.templateVariety}, scheme=${generationSettings.colorScheme}`)

  // Build the full system prompt: base + project-level settings
  const settingsBlock = buildSettingsPromptBlock(generationSettings)
  const fullSystemPrompt = settingsBlock ? SYSTEM_PROMPT + '\n' + settingsBlock : SYSTEM_PROMPT

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: fullSystemPrompt,
    generationConfig: {
      temperature: 0.15,
      topP: 0.8,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
    }
  })

  // Pre-split sentences so Gemini knows the expected count
  // Split on sentence-ending punctuation followed by whitespace, or on newlines
  const sentences = scriptText
    .split(/\n+/)
    .flatMap(line => line.trim().split(/(?<=[.!?…""])\s+/))
    .map(s => s.trim())
    .filter(s => s.length > 5)

  // Classify sentences by word count for the prompt hint
  const shortSentences = sentences.filter(s => s.split(/\s+/).length < 10)
  const mediumSentences = sentences.filter(s => { const w = s.split(/\s+/).length; return w >= 10 && w < 25 })
  const longSentences = sentences.filter(s => s.split(/\s+/).length >= 25)

  function classifySentence(s) {
    const words = s.split(/\s+/).length
    if (words < 10) return 'SHORT — combine if possible'
    if (words < 25) return 'MEDIUM — own scene'
    return 'LONG — SPLIT into 2+ scenes'
  }

  const userPrompt = `Analyze this script and generate the complete scene breakdown. Use EXACT field names from the template catalog.

CRITICAL RULES:
- REDUCE SCENE COUNT: Aggressively combine multiple sentences into single scenes.
- You MUST combine short and medium sentences into groups of 3 or 4 per scene.
- DO NOT generate one scene per sentence if they are short.
- Target a higher word-count per scene (20-30 words) to maintain cinematic pacing.
- Every word from the input must appear in exactly one scene's "script" field. Do NOT drop any content.

SCRIPT:
${scriptText}

SENTENCES (Combine these into fewer scenes):
${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}`

  let rawResponse
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(userPrompt)
      rawResponse = result.response.text()
      break
    } catch (e) {
      const msg = e.message?.toLowerCase() || ''
      if ((msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('503')) && attempt < 3) {
        console.log(`   ⚠️ Gemini retry ${attempt}/3: ${e.message}`)
        await new Promise(r => setTimeout(r, 2000))
      } else {
        throw e
      }
    }
  }

  // Parse JSON response — with truncation recovery
  let scenes
  try {
    let cleaned = rawResponse.replace(/```json?\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    scenes = JSON.parse(cleaned)
  } catch (e) {
    // Gemini sometimes truncates the output mid-array (token limit hit).
    // Try to salvage complete scene objects from the partial JSON.
    console.warn(`⚠️ JSON parse failed (${e.message}) — attempting truncation recovery...`)
    scenes = recoverPartialSceneArray(rawResponse)
    if (scenes.length === 0) {
      console.error('❌ Failed to parse Gemini response:', rawResponse?.substring(0, 300))
      throw new Error(`Failed to parse scene JSON: ${e.message}`)
    }
    console.log(`   ♻️ Recovered ${scenes.length} scene(s) from truncated response`)
  }

  if (!Array.isArray(scenes)) {
    scenes = [scenes]
  }

  console.log(`   ✅ Gemini returned ${scenes.length} scene(s) for ${sentences.length} sentence(s)`)

  // --- COVERAGE CHECK & FALLBACK ---
  const coveredSentences = new Set()
  for (const scene of scenes) {
    if (scene.script) {
      for (let si = 0; si < sentences.length; si++) {
        // Check if the sentence (or a significant portion) appears in this scene's script
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
    console.warn(`   ⚠️ ${missingSentences.length} sentence(s) not covered by any scene — adding as 3D_RENDER fallbacks`)
    for (const missed of missingSentences) {
      scenes.push({
        type: '3D_RENDER',
        script: missed.text,
        environment: 'abstract',
        camera: 'medium shot',
        lighting: 'B',
        prompt: `Cinematic documentary scene. Visualizing: ${missed.text.substring(0, 100)}. Dark moody atmosphere, volumetric lighting, photorealistic 3D render, no humans.`,
        motion: 'Slow dolly forward, subtle atmospheric haze.',
        lower_third: { text: missed.text, attribution: '', tone: '#FFAA00' },
        duration: 15,
        _recovered: true,
      })
    }
    // Re-sort by approximate script order
    scenes.sort((a, b) => {
      const aIdx = sentences.findIndex(s => a.script?.toLowerCase().includes(s.substring(0, 20).toLowerCase()))
      const bIdx = sentences.findIndex(s => b.script?.toLowerCase().includes(s.substring(0, 20).toLowerCase()))
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }

  // Process template scenes — fuzzy match fields and fill templates
  const processed = []
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    scene.index = i + 1
    
    // ENFORCE 15s DEFAULT: ensure every scene has a duration of 15 if missing or 0
    if (!scene.duration || scene.duration < 1) {
      scene.duration = 15
    }

    if (scene.type === 'TEMPLATE' && scene.template) {
      // Resolve template name (fuzzy match prefix) — if not found, auto-generate
      if (!templateExists(scene.template)) {
        console.warn(`   ⚠️ Scene ${i + 1}: Template "${scene.template}" not found — auto-generating...`)
        try {
          const genDescription = `${scene.reasoning || scene.script || ''}\nVisualization type: ${scene.template}\nContent fields needed: ${Object.keys(scene.content || {}).join(', ')}`
          const generated = await generateTemplate(genDescription, {
            suggestedName: scene.template,
            category: 'auto-generated',
          })
          scene.template = generated.template
          scene.generated = true
          console.log(`   🏗️ Scene ${i + 1}: Auto-generated template "${generated.template}"`)
        } catch (genErr) {
          console.error(`   ❌ Scene ${i + 1}: Auto-generate failed — ${genErr.message}`)
          scene.error = `Template "${scene.template}" not found and auto-generation failed: ${genErr.message}`
          processed.push(scene)
          continue
        }
      }

      // Load schema and fuzzy-match fields
      const schema = loadSchema(scene.template)
      const schemaFields = schema?.fields || {}

      if (scene.content && Object.keys(scene.content).length > 0) {
        scene.content = fuzzyMapFields(scene.content, schemaFields)
      }

      // Fill missing fields with defaults
      Object.keys(schemaFields).forEach(key => {
        if (!(key in scene.content)) {
          scene.content[key] = /_\d+$/.test(key) ? ' ' : ''
        }
      })

      // Generate filled TSX
      try {
        const tsxCode = fillTemplate(scene.template, scene.theme || 'THREAT', scene.content)
        scene.code = tsxCode
        scene.codeLength = tsxCode.length
        console.log(`   🎨 Scene ${i + 1}: ${scene.template} [${scene.theme}] → ${tsxCode.length} chars`)
      } catch (err) {
        console.error(`   ❌ Scene ${i + 1}: Fill failed — ${err.message}`)
        scene.error = err.message
      }
    } else if (scene.type === '3D_RENDER') {
      console.log(`   🖼️ Scene ${i + 1}: 3D Render — ${scene.environment || 'unknown'}`)
    }

    processed.push(scene)
  }

  // Auto-save generation for future reference
  autoSaveGeneration(scriptText, processed)

  return processed
}

// ─────────────────────────────────────────────
// Auto-save each generation to disk
// ─────────────────────────────────────────────
function autoSaveGeneration(scriptText, scenes) {
  try {
    const genDir = path.join(__dirname, 'generations')
    if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const filename = `gen_${timestamp}.json`

    const data = {
      timestamp: new Date().toISOString(),
      scriptLength: scriptText.length,
      scriptPreview: scriptText.substring(0, 200),
      scriptFull: scriptText,
      totalScenes: scenes.length,
      templateCount: scenes.filter(s => s.type === 'TEMPLATE').length,
      renderCount: scenes.filter(s => s.type === '3D_RENDER').length,
      scenes: scenes.map(s => ({
        index: s.index,
        type: s.type,
        script: s.script,
        template: s.template,
        theme: s.theme,
        reasoning: s.reasoning,
        content: s.content,
        prompt: s.prompt,
        environment: s.environment,
        camera: s.camera,
        motion: s.motion,
        lower_third: s.lower_third,
        duration: s.duration,
        generated: s.generated,
        _recovered: s._recovered,
      }))
    }

    fs.writeFileSync(path.join(genDir, filename), JSON.stringify(data, null, 2))
    console.log(`   💾 Auto-saved generation → ${filename}`)
  } catch (e) {
    console.warn(`   ⚠️ Auto-save failed: ${e.message}`)
  }
}

// ─────────────────────────────────────────────
// Refine a scene based on user edit instructions
// ─────────────────────────────────────────────
export async function refineScene(sceneData) {
  const { type, editInstruction, history = [] } = sceneData

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    }
  })

  if (type === 'template') {
    // Use plain text response to avoid JSON corruption from TSX code
    const plainModel = googleAI.getGenerativeModel({
      model: getGEMINI_MODEL(),
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `You are a Remotion TSX code editor. You have a working animation component and the user wants changes.

CURRENT TSX CODE:
\`\`\`tsx
${sceneData.code}
\`\`\`

TEMPLATE: ${sceneData.template || 'unknown'}
THEME: ${sceneData.theme || 'DARK'}
CURRENT CONTENT VALUES: ${JSON.stringify(sceneData.content || {})}

${history.length > 0 ? `PREVIOUS EDITS (already applied):\n${history.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n` : ''}

USER'S EDIT REQUEST: "${editInstruction}"

Apply the requested changes to the TSX code. Keep the component structure, imports, and Remotion patterns intact. Only modify what was requested.

Return the FULL updated TSX code inside a single tsx code fence. After the code fence, on a new line write CHANGES: followed by a one-line summary.

\`\`\`tsx
...full updated component code...
\`\`\`
CHANGES: what you changed`

    const result = await plainModel.generateContent(prompt)
    const text = result.response.text()

    // Extract code from markdown fence
    const codeMatch = text.match(/```tsx\s*\n([\s\S]*?)```/)
    if (!codeMatch) {
      throw new Error('AI did not return valid TSX code block')
    }
    const code = codeMatch[1].trim()

    // Extract changes summary
    const changesMatch = text.match(/CHANGES:\s*(.+)/i)
    const changes = changesMatch ? changesMatch[1].trim() : 'Code updated'

    return {
      success: true,
      code,
      content: sceneData.content,
      changes,
    }

  } else if (type === '3d_render') {
    const prompt = `You are a 3D scene prompt editor. The user wants to modify a render prompt.

CURRENT PROMPT: "${sceneData.prompt || ''}"
ENVIRONMENT: ${sceneData.environment || 'unknown'}
CAMERA: ${sceneData.camera || 'unknown'}
LIGHTING: ${sceneData.lighting || 'unknown'}
LOWER THIRD: ${JSON.stringify(sceneData.lower_third || {})}

${history.length > 0 ? `PREVIOUS EDITS (already applied):\n${history.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n` : ''}

USER'S EDIT REQUEST: "${editInstruction}"

Apply the requested changes. Return JSON:
{
  "prompt": "updated 60-80 word render prompt",
  "environment": "updated environment",
  "camera": "updated camera angle",
  "lighting": "updated lighting",
  "lower_third": { "text": "...", "attribution": "...", "tone": "#color" },
  "changes": "one-line summary"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text)

    // Also regenerate the image with the new prompt
    let imageUrl = null
    try {
      const { generateImage } = await import('./services/gemini.js')
      const imgResult = await generateImage(parsed.prompt, {
        format: 'landscape',
        channel: 'arxxis',
        directPrompt: true
      })
      if (imgResult.success) imageUrl = imgResult.url
    } catch (err) {
      console.warn('⚠️ Image regeneration failed:', err.message)
    }

    return {
      success: true,
      prompt: parsed.prompt,
      environment: parsed.environment || sceneData.environment,
      camera: parsed.camera || sceneData.camera,
      lighting: parsed.lighting || sceneData.lighting,
      lower_third: parsed.lower_third || sceneData.lower_third,
      imageUrl,
      changes: parsed.changes,
    }
  }

  throw new Error(`Unknown scene type: ${type}`)
}
