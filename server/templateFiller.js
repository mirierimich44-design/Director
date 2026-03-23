import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const themes = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'themes/themes.json'),
    'utf8'
  )
)

// Helper: Safe replace that only replaces whole word matches
// This prevents partial matches like "PRIMARY_COLOR" matching inside "PRIMARY_COLORS_USED"
function safeReplace(code, placeholder, value) {
  // Create a regex that matches the placeholder as a whole word
  // Uses word boundaries \b to ensure exact match
  const regex = new RegExp(`\\b${escapeRegex(placeholder)}\\b`, 'g')
  return code.replace(regex, String(value))
}

// Escape special regex characters in placeholder string
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function fillTemplate(templateName, themeName, contentJson) {
  const resolvedName = resolveTemplateName(templateName)
  if (!resolvedName) {
    throw new Error(`Template not found: ${templateName}`)
  }

  const templatePath = path.join(
    __dirname,
    `templates/${resolvedName}.tsx`
  )

  let code = fs.readFileSync(templatePath, 'utf8')

  // Step 1: Apply theme colors (with word boundary safety)
  const theme = themes[themeName] || themes['CLEAN']
  Object.entries(theme).forEach(([key, val]) => {
    if (key !== 'name' && key !== 'description') {
      code = safeReplace(code, key, val)
    }
  })

  // Step 2: Apply content values (with word boundary safety)
  Object.entries(contentJson).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      code = safeReplace(code, key, String(val))
    }
  })

  // Step 3: Check for unfilled placeholders
  // Build a list of expected placeholders from theme keys and content keys
  const expectedPlaceholders = new Set([
    ...Object.keys(theme).filter(k => k !== 'name' && k !== 'description'),
    ...Object.keys(contentJson)
  ])

  // Check which expected placeholders are still in the code
  const remaining = []
  expectedPlaceholders.forEach(placeholder => {
    if (code.includes(placeholder)) {
      remaining.push(placeholder)
    }
  })

  if (remaining.length > 0) {
    console.warn('⚠️  Unfilled placeholders:', remaining)
  }

  return code
}

export function listTemplates() {
  const templateDir = path.join(__dirname, 'templates')
  if (!fs.existsSync(templateDir)) return []
  return fs.readdirSync(templateDir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => f.replace('.tsx', ''))
}

export function listThemes() {
  return Object.keys(themes).map(key => ({
    id: key,
    name: themes[key].name,
    description: themes[key].description
  }))
}

export function resolveTemplateName(templateName) {
  const templateDir = path.join(__dirname, 'templates')
  if (!fs.existsSync(templateDir)) return null

  // Exact match first
  if (fs.existsSync(path.join(templateDir, `${templateName}.tsx`))) {
    return templateName
  }

  // Fuzzy match (ignore prefixes like 01-, 02-)
  const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.tsx'))
  const match = files.find(f => f.includes(templateName))
  
  if (match) {
    return match.replace('.tsx', '')
  }
  
  return null
}

export function templateExists(templateName) {
  return resolveTemplateName(templateName) !== null
}

// ─────────────────────────────────────────────
// Validate schema matches template placeholders
// Returns { valid: boolean, missingInSchema: [], missingInTemplate: [], warnings: [] }
// ─────────────────────────────────────────────
export function validateSchemaMatchesTemplate(templateName, schema) {
  const resolvedName = resolveTemplateName(templateName)
  if (!resolvedName) {
    return { valid: false, error: `Template not found: ${templateName}` }
  }

  const templatePath = path.join(__dirname, `templates/${resolvedName}.tsx`)
  const templateCode = fs.readFileSync(templatePath, 'utf8')

  // Get all expected field names from schema
  const schemaFields = schema.fields || {}
  const schemaFieldNames = new Set(Object.keys(schemaFields))

  // Extract placeholder names from template code
  // Matches patterns like: const name = "PLACEHOLDER"
  // Also catches variables assigned from strings: const target1 = "TARGET_1"
  const placeholderRegex = /(?:const|let)\s+(\w+)\s*=\s*["']([A-Z][A-Z0-9_]*)["']/g
  const templatePlaceholders = new Set()
  let match

  while ((match = placeholderRegex.exec(templateCode)) !== null) {
    templatePlaceholders.add(match[2]) // The second group is the placeholder name
  }

  // Also check for array patterns like const targets = ["TARGET_1", "TARGET_2", ...]
  const arrayRegex = /const\s+\w+\s*=\s*\[([^\]]+)\]/g
  while ((match = arrayRegex.exec(templateCode)) !== null) {
    const arrayContent = match[1]
    const arrayItems = arrayContent.match(/["']([A-Z][A-Z0-9_]*)["']/g) || []
    arrayItems.forEach(item => {
      const placeholderName = item.replace(/["']/g, '')
      templatePlaceholders.add(placeholderName)
    })
  }

  // Find fields in schema but not in template
  const missingInTemplate = [...schemaFieldNames].filter(
    field => !templatePlaceholders.has(field)
  )

  // Find placeholders in template but not in schema
  const missingInSchema = [...templatePlaceholders].filter(
    placeholder => !schemaFieldNames.has(placeholder) && !Object.keys(themes.CLEAN).includes(placeholder)
  )

  // Warnings for theme color placeholders (these are not content fields)
  const themeColorPlaceholders = [...templatePlaceholders].filter(
    placeholder => Object.keys(themes.CLEAN).includes(placeholder)
  )

  const warnings = []
  if (themeColorPlaceholders.length > 0) {
    warnings.push(`Template contains theme color placeholders: ${themeColorPlaceholders.join(', ')}`)
  }

  return {
    valid: missingInTemplate.length === 0 && missingInSchema.length === 0,
    missingInSchema,
    missingInTemplate,
    warnings,
    templatePlaceholders: [...templatePlaceholders],
    schemaFields: [...schemaFieldNames]
  }
}
