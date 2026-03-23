/**
 * templateSystem.js — Main entry point for the Template System
 *
 * Flow:
 *   1. routeToTemplate(sentence)      → { template, theme }
 *   2. loadSchema(template)           → { FIELD: "description", ... }
 *   3. extractContentValues(sentence, schema) → { FIELD: "value", ... }
 *   4. fillTemplate(template, theme, values)  → filled TSX string
 *
 * Usage:
 *   import { generateFromTemplate } from './templateSystem.js'
 *   const tsxCode = await generateFromTemplate(scriptSentence)
 */

import 'dotenv/config'

import { fillTemplate, templateExists, listTemplates, listThemes } from './templateFiller.js'
import { loadSchema, routeToTemplate, extractContentValues } from './templateRouter.js'
import { googleAI, getGEMINI_FLASH_MODEL } from './services/llm.js'

// ─────────────────────────────────────────────
// Lightweight Gemini call for JSON-only tasks
// (routing + extraction — no TSX, no validator)
// ─────────────────────────────────────────────
async function callGeminiForJson(prompt) {
  const model = googleAI.getGenerativeModel({
    model: getGEMINI_FLASH_MODEL(),
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 1024
    }
  })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

// ─────────────────────────────────────────────
// Fuzzy field matcher — maps AI-generated field names to schema fields
// Works across ALL templates without needing a static entry for every variation
// ─────────────────────────────────────────────

/**
 * Given user-provided field values and a schema's expected fields,
 * returns a new object with keys mapped to schema field names.
 *
 * Strategy (in priority order):
 *   1. Exact match — key already matches a schema field
 *   2. Static dictionary — known aliases (FIELD_MAPPINGS)
 *   3. Suffix + number match — CHANGE_1 → BAR_VALUE_2 (same trailing _N)
 *   4. Keyword overlap — score each unmatched key against each unclaimed schema field
 */
export function fuzzyMapFields(userValues, schemaFields) {
  if (!userValues || !schemaFields) return userValues || {}

  const schemaKeys = Object.keys(schemaFields)
  const mapped = {}
  const claimedSchema = new Set()
  const unmatchedUser = []

  // ── Pass 1: Exact match + static dictionary ──
  for (const [userKey, val] of Object.entries(userValues)) {
    if (schemaKeys.includes(userKey)) {
      mapped[userKey] = val
      claimedSchema.add(userKey)
    } else if (FIELD_MAPPINGS[userKey] && schemaKeys.includes(FIELD_MAPPINGS[userKey]) && !claimedSchema.has(FIELD_MAPPINGS[userKey])) {
      const target = FIELD_MAPPINGS[userKey]
      mapped[target] = val
      claimedSchema.add(target)
      console.log(`   🔄 Static map: ${userKey} → ${target}`)
    } else {
      unmatchedUser.push([userKey, val])
    }
  }

  if (unmatchedUser.length === 0) return mapped

  // ── Helper: extract keywords from a field name ──
  const toKeywords = (name) =>
    name.toLowerCase().replace(/_/g, ' ').split(/\s+/).filter(w => w.length > 1)

  // ── Helper: extract trailing number (e.g. _2 → 2) ──
  const trailingNum = (name) => {
    const m = name.match(/_(\d+)$/)
    return m ? parseInt(m[1]) : null
  }

  // ── Helper: keyword similarity score (0-1) ──
  const keywordScore = (userWords, schemaWords) => {
    if (userWords.length === 0 || schemaWords.length === 0) return 0
    let hits = 0
    for (const uw of userWords) {
      for (const sw of schemaWords) {
        // Exact word match or one contains the other
        if (uw === sw || sw.includes(uw) || uw.includes(sw)) { hits++; break }
      }
    }
    return hits / Math.max(userWords.length, schemaWords.length)
  }

  // ── Semantic category tags to boost matching ──
  const categoryTags = {
    value: ['value', 'val', 'amount', 'number', 'count', 'total', 'start', 'change', 'end', 'result', 'cost', 'price', 'revenue', 'loss', 'gain'],
    label: ['label', 'name', 'text', 'title', 'heading', 'caption', 'desc', 'description', 'category'],
    date:  ['date', 'time', 'year', 'month', 'day', 'period', 'when'],
    event: ['event', 'step', 'phase', 'stage', 'milestone', 'action'],
  }

  const getCategory = (words) => {
    for (const [cat, tags] of Object.entries(categoryTags)) {
      if (words.some(w => tags.includes(w))) return cat
    }
    return null
  }

  // ── Pass 2: Fuzzy match remaining fields ──
  const availableSchema = schemaKeys.filter(k => !claimedSchema.has(k))

  for (const [userKey, val] of unmatchedUser) {
    const userWords = toKeywords(userKey)
    const userNum = trailingNum(userKey)
    const userCat = getCategory(userWords)

    let bestKey = null
    let bestScore = 0

    for (const schemaKey of availableSchema) {
      if (claimedSchema.has(schemaKey)) continue

      const schemaWords = toKeywords(schemaKey)
      const schemaNum = trailingNum(schemaKey)
      const schemaCat = getCategory(schemaWords)

      let score = keywordScore(userWords, schemaWords)

      // Boost: same trailing number (_1 ↔ _1)
      if (userNum !== null && schemaNum !== null && userNum === schemaNum) {
        score += 0.3
      }

      // Boost: same semantic category (both are "value" fields, both are "label" fields)
      if (userCat && schemaCat && userCat === schemaCat) {
        score += 0.2
      }

      // Boost: numbered fields with offset pattern (CHANGE_1 is often the 2nd bar)
      // If user has sequential numbering starting at 1 and schema has higher numbers,
      // try offset matching within the same category
      if (userNum !== null && schemaNum !== null && userCat === schemaCat && userNum !== schemaNum) {
        score += 0.05 // small boost — better than nothing
      }

      if (score > bestScore) {
        bestScore = score
        bestKey = schemaKey
      }
    }

    // Threshold: require meaningful relevance (raised from 0.2 to avoid wrong mappings)
    if (bestKey && bestScore >= 0.35) {
      mapped[bestKey] = val
      claimedSchema.add(bestKey)
      console.log(`   🔍 Fuzzy map: ${userKey} → ${bestKey} (score: ${bestScore.toFixed(2)})`)
    } else {
      // No match — pass through as-is (might be a custom field or CONTEXT_TEXT etc.)
      mapped[userKey] = val
      console.log(`   ⚠️  No schema match for: ${userKey} (best score: ${bestScore.toFixed(2)})`)
    }
  }

  return mapped
}

// ─────────────────────────────────────────────
// Static field name aliases — known exact mappings for common AI variations
// Used as first-pass before fuzzy matching kicks in
// ─────────────────────────────────────────────
export const FIELD_MAPPINGS = {
  // Origin label variations
  'ORIGIN_POINT': 'ORIGIN_LABEL',
  'ORIGIN': 'ORIGIN_LABEL',

  // Count value variations
  'TARGET_COUNT': 'COUNT_VALUE',
  'COUNT': 'COUNT_VALUE',
  'TOTAL': 'COUNT_VALUE',

  // Count label variations
  'COUNT_LABEL_TEXT': 'COUNT_LABEL',
  'AFFECTED_LABEL': 'COUNT_LABEL',

  // Map label variations
  'REGION_1': 'MAP_LABEL_1',
  'REGION_2': 'MAP_LABEL_2',
  'REGION_3': 'MAP_LABEL_2',
  'LOCATION_1': 'MAP_LABEL_1',
  'LOCATION_2': 'MAP_LABEL_2',
  'MAP_LABEL': 'MAP_LABEL_1',

  // Title variations
  'HEADING': 'TITLE_TEXT',
  'HEADER': 'TITLE_TEXT',
  'MAIN_TEXT': 'TITLE_TEXT',
  'CONTEXT_TEXT': 'TITLE_TEXT',

  // Duration variations
  'DURATION': 'DURATION_SECONDS',
  'LENGTH': 'DURATION_SECONDS',
  'TIME': 'DURATION_SECONDS',
  'SECONDS': 'DURATION_SECONDS',

  // Waterfall chart variations
  'START_VALUE': 'BAR_VALUE_1',
  'CHANGE_1': 'BAR_VALUE_2',
  'CHANGE_2': 'BAR_VALUE_3',
  'CHANGE_3': 'BAR_VALUE_4',
  'TOTAL_VALUE': 'BAR_VALUE_5',
  'LABEL_START': 'WATERFALL_1',
  'LABEL_CHANGE': 'WATERFALL_2',
  'LABEL_CHANGE_1': 'WATERFALL_2',
  'LABEL_CHANGE_2': 'WATERFALL_3',
  'LABEL_CHANGE_3': 'WATERFALL_4',
  'LABEL_TOTAL': 'WATERFALL_5',
}

// ─────────────────────────────────────────────
// Main export: generates filled TSX from a sentence
// ─────────────────────────────────────────────
export async function generateFromTemplate(scriptSentence, options = {}) {
  const { themeOverride = null, templateOverride = null, valuesOverride = null } = options

  console.log(`\n🗂️  Template System: "${scriptSentence}"`)

  // ── Step 1: Route to template + theme ──────────────────────────────────
  let template, theme, reasoning

  if (templateOverride) {
    template = templateOverride
    theme    = themeOverride || 'CLEAN'
    reasoning = 'Manual override (template scene format)'
    console.log(`   📌 Override → template: ${template}, theme: ${theme}`)
  } else {
    const route = await routeToTemplate(scriptSentence, callGeminiForJson)

    if (!route.template) {
      throw new Error(`routeToTemplate failed: ${route.error || 'no template returned'}`)
    }

    template = route.template
    theme    = themeOverride || route.theme
    reasoning = route.reasoning || 'No reasoning provided.'
    console.log(`   🧭 Routed → template: ${template}, theme: ${theme}`)
  }

  // ── Step 2: Verify template exists ─────────────────────────────────────
  if (!templateExists(template)) {
    const available = listTemplates()
    throw new Error(
      `Template "${template}" not found. Available: [${available.join(', ')}]`
    )
  }

  // ── Step 3: Load schema ─────────────────────────────────────────────────
  const schema = loadSchema(template)
  // Schema structure: { template, name, description, category, duration, tags, fields: { FIELD_NAME: "desc", ... } }
  const fields = schema.fields || {}
  const fieldCount = Object.keys(fields).length
  console.log(`   📋 Schema: ${schema.name || template} [${schema.category || 'uncategorized'}] - ${fieldCount} field(s)`)

  // ── Step 4: Extract content values ─────────────────────────────────────
  let contentValues = {}

  if (valuesOverride && Object.keys(valuesOverride).length > 0) {
    // Use fuzzy field matching to map AI-generated names to schema fields
    contentValues = fuzzyMapFields(valuesOverride, fields)

    const extracted = Object.keys(contentValues).length
    console.log(`   ✅ Using pre-extracted values: ${extracted}/${fieldCount} values`)
    console.log(`   📝 Provided keys:`, Object.keys(valuesOverride).sort().join(', '))
    console.log(`   📝 Mapped keys:`, Object.keys(contentValues).sort().join(', '))
  } else if (fieldCount > 0) {
    // Extract values using AI (pass only fields object, not full schema)
    contentValues = await extractContentValues(
      scriptSentence,
      fields,
      callGeminiForJson
    )
    const extracted = Object.keys(contentValues).length
    console.log(`   ✅ AI extracted ${extracted}/${fieldCount} values`)
    console.log(`   📝 Extracted keys:`, Object.keys(contentValues).sort().join(', '))
  }

  // Check for missing fields and warn
  const missingFields = Object.keys(fields).filter(f => !(f in contentValues))
  if (missingFields.length > 0) {
    console.warn(`   ⚠️  Missing content fields: ${missingFields.join(', ')}`)

    // Add fallback values for missing fields so animation can render
    const fallbacks = {
      'TITLE_TEXT': 'Title Here',
      'ORIGIN_LABEL': 'ORIGIN',
      'COUNT_VALUE': '30',
      'COUNT_LABEL': 'TOTAL AFFECTED',
      'MAP_LABEL_1': 'Location One',
      'MAP_LABEL_2': 'Location Two',
      'DURATION_SECONDS': '9'
    }
    missingFields.forEach(f => {
      // Use fallback value if available, otherwise:
      // - List-item fields (ending with _1, _2, etc.) get ' ' (space) to survive dynamic filtering
      // - Other fields get '' so they're truly invisible
      contentValues[f] = fallbacks.hasOwnProperty(f) ? fallbacks[f] : (/_\d+$/.test(f) ? ' ' : '')
      console.warn(`   🔄 Using fallback for ${f}: "${contentValues[f]}"`)
    })
  }

  // ── Step 5: Fill template ───────────────────────────────────────────────
  const tsxCode = fillTemplate(template, theme, contentValues)
  console.log(`   🎨 Template filled (${tsxCode.length} chars)`)

  // ── Step 5b: Post-fill scan for any still-unfilled ALL_CAPS tokens ──────
  const allCapsRegex = /\b([A-Z][A-Z0-9_]{3,})\b/g
  const themeKeys = new Set(['BACKGROUND_COLOR','PANEL_LEFT_BG','PANEL_RIGHT_BG','PRIMARY_COLOR','SECONDARY_COLOR','ACCENT_COLOR','SUPPORT_COLOR','TEXT_ON_PRIMARY','TEXT_ON_SECONDARY','TEXT_ON_ACCENT','NODE_FILL','NODE_STROKE','LINE_STROKE','GRID_LINE','CHART_BG','CHART_BORDER'])
  const leaked = new Set()
  let m
  while ((m = allCapsRegex.exec(tsxCode)) !== null) {
    const tok = m[1]
    if (!themeKeys.has(tok) && !(tok in contentValues) && tok !== 'AnimationComponent') {
      leaked.add(tok)
    }
  }
  if (leaked.size > 0) {
    console.warn(`   ⚠️  POST-FILL: ${leaked.size} unfilled token(s) remain in output:`, [...leaked].join(', '))
  }

  return {
    code:     tsxCode,
    template,
    theme,
    reasoning,
    values:   contentValues,
    schema
  }
}

// ─────────────────────────────────────────────
// Convenience re-exports
// ─────────────────────────────────────────────
export { listTemplates, listThemes, templateExists, loadSchema, fillTemplate }
