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

// Escape special regex characters in a string for use inside a RegExp pattern
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveTemplatePath(name) {
  const templateDir = path.join(__dirname, 'templates');
  if (fs.existsSync(path.join(templateDir, `${name}.tsx`))) return name;
  const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.tsx'));
  const match = files.find(f => f.includes(name));
  return match ? match.replace('.tsx', '') : undefined;
}

export function fillTemplate(templateName, themeName, contentJson) {
  const resolvedName = resolveTemplatePath(templateName);

  if (!resolvedName) throw new Error(`Template not found: ${templateName}`);

  let code = fs.readFileSync(path.join(__dirname, `templates/${resolvedName}.tsx`), 'utf8');

  // Inject Theme
  const theme = themes[themeName] || themes['DARK'];
  Object.entries(theme).forEach(([k, v]) => { if (k !== 'name' && k !== 'description') code = code.split(k).join(v) });
  code = code.split('STADIA_API_KEY').join(getStadiaKey());

  // Inject Content — ONLY replace quoted placeholders, never bare identifiers.
  //
  // The previous approach used `(['"]?)\bKEY\b\1` which also matched bare variable
  // names like `const percentValue = ...`, replacing the identifier itself with a
  // quoted string → `const "10.0" = ...` → esbuild syntax error.
  //
  // Safe rules:
  //   "KEY"  → "value"   (double-quoted string literal)
  //   'KEY'  → 'value'   (single-quoted string literal)
  //   {KEY}  → {"value"} (JSX expression — uppercase-only keys to avoid false positives)
  //
  // Bare identifiers (variable names, property keys in declarations) are NEVER touched.
  Object.entries(contentJson).forEach(([key, val]) => {
    if (val === null || val === undefined) return;
    const escaped = escapeRegex(key);
    const raw = String(val);

    // Escape value for each quote style
    const forDouble = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    const forSingle = raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');

    // 1. Double-quoted placeholders: "KEY" → "value"
    code = code.replace(new RegExp(`"${escaped}"`, 'g'), `"${forDouble}"`);

    // 2. Single-quoted placeholders: 'KEY' → 'value'
    code = code.replace(new RegExp(`'${escaped}'`, 'g'), `'${forSingle}'`);

    // 3. JSX expression placeholders: {KEY} → {"value"}
    //    Only for UPPERCASE_UNDERSCORE keys (genuine template placeholders).
    //    camelCase / lowercase keys are skipped here to avoid matching JS expressions like {frame}.
    if (/^[A-Z][A-Z0-9_]*$/.test(key)) {
      code = code.replace(new RegExp(`\\{${escaped}\\}`, 'g'), `{"${forDouble}"}`);
    }
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

