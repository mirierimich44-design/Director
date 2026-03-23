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
- [3D RENDER]: AI-generated photorealistic environment (physical spaces, objects — NO humans)

ROUTING ENGINE — run on every sentence, stop at first YES:
Q1: Physical space/object/infrastructure/environment? → [3D RENDER]
Q2: Chapter opener/structural beat? → [TEMPLATE SCENE] → chapter or transition templates
Q3: Named hacker/threat actor? → [TEMPLATE SCENE] → person-profile / threat-actor-card
Q4: Named organization/victim? → [TEMPLATE SCENE] → organization-card
Q5: Statistic/number/financial figure? → [TEMPLATE SCENE] → stat/chart templates
Q6: Sequence of dated events? → [TEMPLATE SCENE] → timeline templates
Q7: Attack method/kill chain/flow? → [TEMPLATE SCENE] → flowdiagram/phase templates
Q8: Network of connections? → [TEMPLATE SCENE] → nodenetwork/expanding templates
Q9: Country/geography? → [TEMPLATE SCENE] → map templates
Q10: Code/malware/exploit/terminal? → [TEMPLATE SCENE] → code/terminal templates
Q11: Scale of spread/infection? → [TEMPLATE SCENE] → map-spread/particle templates
Q12: Two contrasting states/before vs after? → [TEMPLATE SCENE] → split/comparison templates
Q13: List of attack vectors/techniques? → [TEMPLATE SCENE] → icongrid/split templates
Q14: Evidence item/document? → [TEMPLATE SCENE] → evidence-item
Q15: Direct quote? → [3D RENDER] + lower-third
Q16: Single punchy claim? → [3D RENDER] + lower-third
DEFAULT: [3D RENDER] with lower-third

THEME SELECTION:
THREAT (dark bg, red) → breaches, ransomware, active attacks
COLD (dark bg, blue/cyan) → nation-state, espionage
DARK (near-black) → chapter cards, transitions, cinematic beats
INTEL (dark bg, amber) → dossiers, profiles, evidence
TECHNICAL (very dark, green) → code, logs, terminal
CLEAN (white bg, navy/red) → informational stats (use sparingly)

TEMPLATE CATALOG (name [description]: fields):
${TEMPLATE_CATALOG}

SENTENCE COMBINING RULES:
- SHORT sentences (under 10 words) that flow together as a sequence, build the same mood, or describe the same moment MUST be combined into a single scene. Do not give each tiny fragment its own scene.
- You MAY combine up to 4 consecutive short sentences into one scene if they share the same cinematic beat (e.g. "The phone: silent." + "Not crashed." + "Not frozen." → one 3D_RENDER scene).
- LONGER sentences (10+ words) that introduce a new concept, statistic, or entity should each get their own scene — unless two consecutive ones describe the same stat or organization, in which case combining is fine.
- Never combine sentences that would need fundamentally different templates (e.g. a map template and a terminal template).
- The "script" field MUST contain ALL combined sentences verbatim, in order. Do not paraphrase or skip any sentence.
- Every sentence from the input must appear in exactly one scene's "script" field. Do NOT drop any sentence.

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
    "reasoning": "one sentence why",
    "content": { "FIELD_NAME": "value", ... },
    "duration": 8
  },
  {
    "type": "3D_RENDER",
    "script": "exact sentence(s)",
    "environment": "category",
    "camera": "angle",
    "lighting": "A/B/C",
    "object_link": "This object represents X because Y",
    "prompt": "60-80 word render prompt",
    "motion": "How the camera/scene should animate. Match the script energy. Examples: 'Slow dolly forward through smoke, camera drifts left', 'Static wide shot, subtle atmospheric haze drifts across frame', 'Slow zoom into screen, ambient light flickers', 'Crane up revealing full scale of damage, debris particles float'. Keep it cinematic and grounded.",
    "lower_third": { "text": "...", "attribution": "...", "tone": "#FF6600" },
    "duration": 5
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
      const longestDuration = Math.max(...group.map(s => s.duration || 5))
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
export async function generateScenes(scriptText) {
  if (!scriptText || typeof scriptText !== 'string' || scriptText.trim().length === 0) {
    throw new Error('scriptText is empty or missing — the chapter has no script to analyze')
  }
  console.log(`\n🎬 Auto-Scene: Processing ${scriptText.length} chars of script...`)

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: SYSTEM_PROMPT,
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
  const longSentences = sentences.filter(s => s.split(/\s+/).length >= 10)

  const userPrompt = `Analyze this script and generate the complete scene breakdown. Use EXACT field names from the template catalog.

CRITICAL RULES:
- This script has ${sentences.length} sentences total (${shortSentences.length} short, ${longSentences.length} long).
- SHORT sentences (under 10 words) should be COMBINED with adjacent short sentences into a single scene — do NOT give each tiny fragment its own scene.
- The final scene count will likely be FEWER than ${sentences.length} due to combining. That is correct and expected.
- Every sentence must appear verbatim in exactly one scene's "script" field. Do NOT drop any.

SCRIPT:
${scriptText}

SENTENCES (for your reference — each must appear in exactly one scene):
${sentences.map((s, i) => `${i + 1}. [${s.split(/\s+/).length < 10 ? 'SHORT — combine if possible' : 'LONG — own scene'}] ${s}`).join('\n')}`

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

  const shortCount = sentences.filter(s => s.split(/\s+/).length < 10).length
  console.log(`   ✅ Gemini returned ${scenes.length} scene(s) for ${sentences.length} sentence(s) (${shortCount} short — combining expected)`)

  // ── Post-process: merge consecutive short 3D_RENDER scenes ──────────────────
  // The LLM sometimes ignores combining instructions; this guarantees it happens.
  scenes = mergeShortRenderScenes(scenes)

  // Verify coverage — check that every sentence appears in at least one scene
  const coveredSentences = new Set()
  for (const scene of scenes) {
    if (scene.script) {
      for (let si = 0; si < sentences.length; si++) {
        // Check if the sentence (or a significant portion) appears in this scene's script
        const needle = sentences[si].substring(0, Math.min(40, sentences[si].length)).toLowerCase()
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
        prompt: `Cinematic documentary scene. ${missed.text.substring(0, 120)}. Dark moody atmosphere, volumetric lighting, no humans.`,
        motion: 'Slow dolly forward, subtle atmospheric haze.',
        lower_third: { text: missed.text, attribution: '', tone: '#FFAA00' },
        duration: 5,
        _recovered: true,
      })
    }
    // Re-sort by approximate script order
    scenes.sort((a, b) => {
      const aIdx = sentences.findIndex(s => a.script?.toLowerCase().includes(s.substring(0, 30).toLowerCase()))
      const bIdx = sentences.findIndex(s => b.script?.toLowerCase().includes(s.substring(0, 30).toLowerCase()))
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }

  // Process template scenes — fuzzy match fields and fill templates
  const processed = []
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    scene.index = i + 1

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
