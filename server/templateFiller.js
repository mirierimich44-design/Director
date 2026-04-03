import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getStadiaKey } from './settings.js'

// Returns 0–1 relative luminance of a hex color
function hexLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const themes = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'themes/themes.json'),
    'utf8'
  )
)

// Helper: Safe replace that only replaces whole word matches or quoted placeholders
function safeReplace(code, placeholder, value) {
  const escaped = escapeRegex(placeholder)
  // Match the placeholder as a whole word, or inside quotes: "PLACEHOLDER" or 'PLACEHOLDER'
  const regex = new RegExp(`(['"])${escaped}\\1|\\b${escaped}\\b`, 'g')
  
  return code.replace(regex, (match, quote) => {
    // If it was quoted, return the quoted value (escaped for JS string safety)
    if (quote) {
      const safeVal = String(value).replace(/['"\\\n\r]/g, s => ({
        "'": "\\'", '"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r'
      }[s]))
      return `${quote}${safeVal}${quote}`
    }
    
    // NEW: If NOT quoted, sanitize the value to be a valid JS identifier (e.g. 10.0 -> _10_0)
    let sanitizedVal = String(value).replace(/[^a-zA-Z0-9_]/g, '_');
    if (/^[0-9]/.test(sanitizedVal)) {
        sanitizedVal = '_' + sanitizedVal;
    }
    return sanitizedVal;
  })
}

// Escape special regex characters in placeholder string
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function fillTemplate(templateName, themeName, contentJson) {
  const resolvedName = (name) => {
      const templateDir = path.join(__dirname, 'templates');
      if (fs.existsSync(path.join(templateDir, `${name}.tsx`))) return name;
      const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.tsx'));
      return files.find(f => f.includes(name))?.replace('.tsx', '');
  }(templateName);

  if (!resolvedName) throw new Error(`Template not found: ${templateName}`);

  let code = fs.readFileSync(path.join(__dirname, `templates/${resolvedName}.tsx`), 'utf8');

  // Inject Theme
  const theme = themes[themeName] || themes['DARK'];
  Object.entries(theme).forEach(([k, v]) => { if (k !== 'name') code = code.split(k).join(v) });
  code = code.split('STADIA_API_KEY').join(getStadiaKey());

  // Inject Content with Identifier Protection
  // Ensure every injected value is quoted to prevent raw numbers from breaking the TS/JS syntax
  Object.entries(contentJson).forEach(([key, val]) => {
    if (val === null || val === undefined) return;
    const safeVal = String(val).replace(/['"]/g, ''); 
    
    // Replace the placeholder (optionally surrounded by existing quotes) with a forced quoted string
    // This turns "10.0" or 10.0 into "10.0"
    const regex = new RegExp(`(['"]?)\\b${key}\\b\\1`, 'g');
    code = code.replace(regex, `"${safeVal}"`);
  });

  return code;
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
