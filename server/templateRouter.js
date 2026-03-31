import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Build template list dynamically from actual files on disk
function getAvailableTemplates() {
  const templatesDir = path.join(__dirname, 'templates')
  const schemasDir   = path.join(__dirname, 'schemas')
  if (!fs.existsSync(templatesDir)) return []

  return fs.readdirSync(templatesDir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => {
      const name = f.replace('.tsx', '')
      // strip leading number prefix (e.g. "01-statcluster-3box" → "statcluster-3box")
      const shortName = name.replace(/^\d+-/, '')
      // try to get description from schema
      const schemaPath = path.join(schemasDir, `${name}.json`)
      let description = ''
      try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
        description = schema.description || ''
      } catch (_) {}
      return { name, shortName, description }
    })
}

// ─────────────────────────────────────────────
// Load schema for a template
// ─────────────────────────────────────────────
export function loadSchema(templateName) {
  const schemasDir = path.join(__dirname, 'schemas')
  if (!fs.existsSync(schemasDir)) return {}

  let targetFile = `${templateName}.json`
  
  // Fuzzy match if exact doesn't exist
  if (!fs.existsSync(path.join(schemasDir, targetFile))) {
    const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'))
    const match = files.find(f => f.includes(templateName))
    if (match) {
      targetFile = match
    } else {
      console.warn(`No schema found for ${templateName}`)
      return {}
    }
  }

  const schemaPath = path.join(schemasDir, targetFile)
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
}

// ─────────────────────────────────────────────
// Build routing prompt for Gemini — dynamically from disk
// ─────────────────────────────────────────────
export function buildRoutingPrompt(scriptSentence) {
  const available = getAvailableTemplates()
  const templateLines = available.map(t =>
    `${t.shortName.padEnd(36)} → ${t.description || t.name}`
  ).join('\n')

  return `
Read this script sentence and return ONLY a JSON object.
No explanation. No markdown. Just JSON.

SENTENCE: "${scriptSentence}"

Return this exact format:
{
  "template": "template-name-here",
  "theme": "THEME_NAME_HERE",
  "reasoning": "brief explanation of why this template matches the script"
}

IMPORTANT: You MUST pick a template EXACTLY as listed below (use the short name on the left, without the number prefix).

TEMPLATE OPTIONS (pick the best match):
${templateLines}

THEME OPTIONS (pick the best match):
CLEAN      → neutral professional light background
THREAT     → red warm tones, breach or attack scenes
COLD       → blue-white, data or network scenes
DARK       → near-black, classified or intel scenes
INTEL      → lavender, surveillance or classified
TECHNICAL  → dark green-on-black, code or system scenes

Rules:
- If unsure on template, pick the closest visual match
- If unsure on theme, default to CLEAN
- Return ONLY the JSON object, nothing else
`.trim()
}

// ─────────────────────────────────────────────
// Build content extraction prompt for Gemini
// ─────────────────────────────────────────────
export function buildExtractionPrompt(scriptSentence, schema) {
  return `
Return ONLY valid JSON. No code. No markdown. No explanation.

Extract these values from the sentence below.
Use the field descriptions as guidance.
If a value cannot be determined:
- For text/label fields: use a sensible short placeholder string
- For URL or image fields (field names containing URL, IMAGE, SRC, PATH, LINK, PHOTO): use an empty string ""

FIELDS TO EXTRACT:
${JSON.stringify(schema, null, 2)}

SENTENCE: "${scriptSentence}"
`.trim()
}

// ─────────────────────────────────────────────
// Route a sentence to a template + theme via Gemini
// ─────────────────────────────────────────────
export async function routeToTemplate(scriptSentence, geminiCallFn) {
  const prompt = buildRoutingPrompt(scriptSentence)

  let raw
  try {
    raw = await geminiCallFn(prompt)
  } catch (err) {
    console.error('routeToTemplate: Gemini call failed:', err.message)
    return { template: null, theme: 'CLEAN', error: err.message }
  }

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, '').trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('routeToTemplate: JSON parse failed. Raw response:\n', raw)
    return { template: null, theme: 'CLEAN', error: 'JSON parse failed' }
  }

  return {
    template: parsed.template || null,
    theme:    parsed.theme    || 'CLEAN',
    reasoning: parsed.reasoning || 'No reasoning provided.'
  }
}

// ─────────────────────────────────────────────
// Extract content values from a sentence via Gemini
// ─────────────────────────────────────────────
export async function extractContentValues(scriptSentence, schema, geminiCallFn) {
  const prompt = buildExtractionPrompt(scriptSentence, schema)

  let raw
  try {
    raw = await geminiCallFn(prompt)
  } catch (err) {
    console.error('extractContentValues: Gemini call failed:', err.message)
    return {}
  }

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, '').trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('extractContentValues: JSON parse failed. Raw response:\n', raw)
    return {}
  }

  return parsed
}
