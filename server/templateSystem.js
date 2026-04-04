/**
 * templateSystem.js — Template System Utilities
 * 
 * Provides field mapping and matching logic to bridge 
 * AI-generated values with specific template schemas.
 */

import 'dotenv/config'
import { fillTemplate, templateExists, listTemplates, listThemes } from './templateFiller.js'

// ─────────────────────────────────────────────
// Fuzzy field matcher — maps AI-generated field names to schema fields
// Works across ALL templates without needing a static entry for every variation
// ─────────────────────────────────────────────

/**
 * Given user-provided field values and a schema's expected fields,
 * returns a new object with keys mapped to schema field names.
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
    } else {
      unmatchedUser.push([userKey, val])
    }
  }

  if (unmatchedUser.length === 0) return mapped

  // ── Helper: extract keywords from a field name ──
  const toKeywords = (name) =>
    name.toLowerCase().replace(/_/g, ' ').split(/\s+/).filter(w => w.length > 1)

  const trailingNum = (name) => {
    const m = name.match(/_(\d+)$/)
    return m ? parseInt(m[1]) : null
  }

  const keywordScore = (userWords, schemaWords) => {
    if (userWords.length === 0 || schemaWords.length === 0) return 0
    let hits = 0
    for (const uw of userWords) {
      for (const sw of schemaWords) {
        if (uw === sw || sw.includes(uw) || uw.includes(sw)) { hits++; break }
      }
    }
    return hits / Math.max(userWords.length, schemaWords.length)
  }

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

      if (userNum !== null && schemaNum !== null && userNum === schemaNum) score += 0.3
      if (userCat && schemaCat && userCat === schemaCat) score += 0.2

      if (score > bestScore) {
        bestScore = score
        bestKey = schemaKey
      }
    }

    if (bestKey && bestScore >= 0.15) {
      // Confident-enough fuzzy match — use schema key
      mapped[bestKey] = val
      claimedSchema.add(bestKey)
    } else if (bestKey && availableSchema.length > 0) {
      // No keyword overlap at all, but there's an unclaimed schema slot — map to it
      // so the template gets a value rather than leaving a literal placeholder.
      mapped[bestKey] = val
      claimedSchema.add(bestKey)
    } else {
      // Pass through with original key (fillTemplate will ignore it harmlessly)
      mapped[userKey] = val
    }
  }

  return mapped
}

export const FIELD_MAPPINGS = {
  'ORIGIN_POINT': 'ORIGIN_LABEL',
  'ORIGIN': 'ORIGIN_LABEL',
  'TARGET_COUNT': 'COUNT_VALUE',
  'COUNT': 'COUNT_VALUE',
  'TOTAL': 'COUNT_VALUE',
  'COUNT_LABEL_TEXT': 'COUNT_LABEL',
  'AFFECTED_LABEL': 'COUNT_LABEL',
  'REGION_1': 'MAP_LABEL_1',
  'REGION_2': 'MAP_LABEL_2',
  'LOCATION_1': 'MAP_LABEL_1',
  'LOCATION_2': 'MAP_LABEL_2',
  'HEADING': 'TITLE_TEXT',
  'HEADER': 'TITLE_TEXT',
  'MAIN_TEXT': 'TITLE_TEXT',
  'CONTEXT_TEXT': 'TITLE_TEXT',
  'DURATION': 'DURATION_SECONDS',
}

export { listTemplates, listThemes, templateExists, fillTemplate }
