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
    
    // NEW: If NOT quoted but the value looks like a number that would break JS as an identifier
    // (e.g., placeholder used in an object key or variable name context)
    // We only sanitize if it's a known placeholder pattern
    return String(value)
  })
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
      // Check for background override in content
      if (key === 'BACKGROUND_COLOR' && contentJson.BACKGROUND_OVERRIDE) {
        code = safeReplace(code, key, contentJson.BACKGROUND_OVERRIDE)
      } else {
        code = safeReplace(code, key, val)
      }
    }
  })

  // Step 1b: Inject Stadia Maps API key (empty string if not configured)
  const stadiaKey = getStadiaKey()
  code = safeReplace(code, 'STADIA_API_KEY', stadiaKey)

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
    // Safety Fallback: Replace remaining theme placeholders with sensible defaults 
    // to prevent "blank" or invalid CSS colors in the final render.
    remaining.forEach(placeholder => {
      let fallback = '#FF00FF'; // High-visibility magenta for debugging
      if (placeholder.includes('BACKGROUND')) fallback = theme.BACKGROUND_COLOR || '#000000';
      if (placeholder.includes('PRIMARY'))    fallback = theme.PRIMARY_COLOR || '#FFFFFF';
      if (placeholder.includes('SECONDARY'))  fallback = theme.SECONDARY_COLOR || '#FF3333';
      if (placeholder.includes('TEXT'))       fallback = theme.PRIMARY_COLOR || '#FFFFFF';
      
      code = safeReplace(code, placeholder, fallback);
    });
  }

  // Step 4: Light-background safety sweep
  // If the theme background is light (luminance > 0.5), hardcoded white text colors
  // would be invisible. Replace them with the theme's primary (dark) color.
  const bgHex = (theme.BACKGROUND_COLOR || '#000000').replace(/['"]/g, '');
  if (/^#[0-9a-f]{6}$/i.test(bgHex) && hexLuminance(bgHex) > 0.5) {
      const darkText = theme.PRIMARY_COLOR || '#111111';
      const dimText  = theme.SUPPORT_COLOR  || '#555555';
      // Replace exact white color: values in style objects (text color only, not backgroundColor)
      // Pattern: color: '#fff' | color: "#fff" | color: 'white' | color: '#ffffff' | color: '#FFF' etc.
      code = code.replace(/(\bcolor:\s*)(['"])(?:#[Ff]{3,6}|white)\2/g, `$1'${darkText}'`);
      // Replace rgba(255,255,255, alpha) used as text color where alpha >= 0.4 (visible-intent text)
      // Only in a `color:` context, not `backgroundColor:` or `border:`
      code = code.replace(
          /(\bcolor:\s*['"]?)rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/g,
          (match, prefix, alpha) => {
              const a = parseFloat(alpha);
              // Skip very transparent whites — decorative/overlay, not main text
              if (a < 0.35) return match;
              // For semi-transparent text, blend with dark: use dimText at reduced opacity
              return `${prefix}rgba(26,43,68,${a})`;
          }
      );
      console.log(`   🎨 Light-background sweep applied (bg luminance ${hexLuminance(bgHex).toFixed(2)})`);
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
