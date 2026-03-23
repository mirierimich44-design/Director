/**
 * templateGenerator.js — Auto-generates new .tsx templates + .json schemas
 *
 * When no existing template fits a scene description, this module:
 *   1. Analyzes the content need (what kind of visualization)
 *   2. Generates a Remotion .tsx template with placeholder variables
 *   3. Generates a matching .json schema
 *   4. Saves both to server/templates/ and server/schemas/
 *   5. Returns the template name for immediate use
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { googleAI, getGEMINI_MODEL } from './services/llm.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─────────────────────────────────────────────
// Get next available template number
// ─────────────────────────────────────────────
function getNextTemplateNumber() {
  const templatesDir = path.join(__dirname, 'templates')
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'))
  let maxNum = 0
  for (const f of files) {
    const match = f.match(/^(\d+)-/)
    if (match) {
      const num = parseInt(match[1])
      if (num > maxNum) maxNum = num
    }
  }
  return maxNum + 1
}

// ─────────────────────────────────────────────
// Load a few example templates for few-shot prompting
// ─────────────────────────────────────────────
function loadExampleTemplates() {
  const examples = [
    { tsx: '01-statcluster-3box.tsx', schema: '01-statcluster-3box.json' },
    { tsx: '14-timeline-horizontal.tsx', schema: '14-timeline-horizontal.json' },
  ]

  const result = []
  for (const ex of examples) {
    try {
      const tsxPath = path.join(__dirname, 'templates', ex.tsx)
      const schemaPath = path.join(__dirname, 'schemas', ex.schema)
      if (fs.existsSync(tsxPath) && fs.existsSync(schemaPath)) {
        result.push({
          tsx: fs.readFileSync(tsxPath, 'utf8'),
          schema: fs.readFileSync(schemaPath, 'utf8'),
        })
      }
    } catch (e) {
      // Skip if example not found
    }
  }
  return result
}

// ─────────────────────────────────────────────
// System prompt for template generation
// ─────────────────────────────────────────────
function buildSystemPrompt(examples) {
  const exampleBlocks = examples.map((ex, i) => `
--- EXAMPLE ${i + 1} TSX ---
${ex.tsx}
--- EXAMPLE ${i + 1} SCHEMA ---
${ex.schema}
`).join('\n')

  return `You are an expert Remotion template generator for the ARXXIS documentary animation system.

You create reusable .tsx templates with placeholder variables that get filled at render time.

CRITICAL RULES:
1. Canvas is ALWAYS 1920x1080 pixels
2. Root div MUST have: position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR'
3. Use ONLY these imports: import React, { useMemo } from 'react' and import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
4. Named export MUST be: export const AnimationComponent = () => { ... }
5. Also add: export default AnimationComponent
6. Content placeholders are ALL_CAPS_WITH_UNDERSCORES (e.g., TITLE_TEXT, STAT_VALUE_1)
7. Theme color placeholders: BACKGROUND_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, TEXT_ON_PRIMARY, TEXT_ON_SECONDARY, TEXT_ON_ACCENT, SUPPORT_COLOR, NODE_FILL, NODE_STROKE, LINE_STROKE, GRID_LINE, CHART_BG
8. Every interpolate() MUST use { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
9. Never call interpolate() inside template literals — assign to a variable first
10. Use staggered animations for multi-element layouts (delay each by 8-15 frames)
11. For lists/arrays of items, use useMemo to filter out empty placeholders: .filter(item => item !== '' && item !== ' ')
12. Use position: absolute for all major layout elements with explicit top/left/width/height
13. All text should have overflow: 'hidden' and whiteSpace: 'nowrap' (or 'pre-wrap' for multi-line)
14. Font sizes: titles 28-36px, values 60-80px, labels 18-22px, sub-text 14-16px
15. Use fontFamily: 'monospace' for numbers, 'sans-serif' for text
16. Put content placeholder strings in const variables at top of component, or in arrays for list items

PLACEHOLDER NAMING:
- TITLE_TEXT — main heading
- STAT_VALUE_1, STAT_VALUE_2 — numeric values
- LABEL_1, LABEL_2 — short labels (ALL CAPS, max 3 words)
- SUB_1, SUB_2 — sub-text lines
- EVENT_1, DATE_1 — timeline items
- ITEM_1, ITEM_2 — list items
- DESC_1, DESC_2 — descriptions
- Use _1, _2, _3 suffixes for repeated items

${exampleBlocks}

OUTPUT: Return ONLY a JSON object with two keys:
{
  "tsx": "the complete .tsx template code as a string",
  "schema": { "template": "name", "name": "Display Name", "description": "...", "category": "...", "duration": 9, "tags": [...], "fields": { "FIELD_NAME": "description", ... } }
}

Return valid JSON only. No markdown fences.`
}

// ─────────────────────────────────────────────
// Main: generate a new template
// ─────────────────────────────────────────────
export async function generateTemplate(description, options = {}) {
  const { suggestedName = null, category = 'generated' } = options

  console.log(`\n🏗️  Template Generator: "${description.substring(0, 80)}..."`)

  const examples = loadExampleTemplates()
  const systemPrompt = buildSystemPrompt(examples)

  const nextNum = getNextTemplateNumber()
  const numStr = String(nextNum).padStart(2, '0')

  const userPrompt = `Generate a new Remotion template for this visualization need:

DESCRIPTION: ${description}

REQUIREMENTS:
- Template number: ${numStr}
- Suggested name: ${suggestedName || 'auto-generate a kebab-case name based on the description'}
- Category: ${category}
- The template should be REUSABLE — it should work for any content that fits this visualization pattern
- Include 4-8 content placeholder fields (enough to be useful, not so many it's rigid)
- Animation should last ~8-10 seconds (240-300 frames at 30fps)
- Make it visually impressive with staggered reveals

Return the JSON object with "tsx" and "schema" keys.`

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.3,
      topP: 0.85,
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
    }
  })

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

  // Parse response
  let parsed
  try {
    let cleaned = rawResponse.replace(/```json?\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    parsed = JSON.parse(cleaned)
  } catch (e) {
    console.error('❌ Failed to parse generator response:', rawResponse?.substring(0, 300))
    throw new Error(`Failed to parse template JSON: ${e.message}`)
  }

  if (!parsed.tsx || !parsed.schema) {
    throw new Error('Generator response missing tsx or schema')
  }

  // Determine template name
  let templateName = parsed.schema?.template || suggestedName || 'custom-template'
  // Strip any existing number prefix
  templateName = templateName.replace(/^\d+-/, '')
  const fullName = `${numStr}-${templateName}`

  // Update schema with correct template name
  parsed.schema.template = fullName
  if (!parsed.schema.category) parsed.schema.category = category
  if (!parsed.schema.duration) parsed.schema.duration = 9
  if (!parsed.schema.tags) parsed.schema.tags = ['generated', 'auto']

  // Validate TSX has required structure
  const tsx = parsed.tsx
  if (!tsx.includes('AnimationComponent')) {
    throw new Error('Generated TSX missing AnimationComponent export')
  }
  if (!tsx.includes('useCurrentFrame')) {
    throw new Error('Generated TSX missing useCurrentFrame')
  }
  if (!tsx.includes('BACKGROUND_COLOR')) {
    throw new Error('Generated TSX missing BACKGROUND_COLOR placeholder')
  }

  // Save files
  const tsxPath = path.join(__dirname, 'templates', `${fullName}.tsx`)
  const schemaPath = path.join(__dirname, 'schemas', `${fullName}.json`)

  fs.writeFileSync(tsxPath, tsx, 'utf8')
  fs.writeFileSync(schemaPath, JSON.stringify(parsed.schema, null, 2), 'utf8')

  console.log(`   ✅ Template saved: ${fullName}`)
  console.log(`   📄 TSX: ${tsxPath}`)
  console.log(`   📋 Schema: ${schemaPath}`)
  console.log(`   📝 Fields: ${Object.keys(parsed.schema.fields || {}).join(', ')}`)

  return {
    template: fullName,
    name: parsed.schema.name || fullName,
    description: parsed.schema.description || description,
    category: parsed.schema.category,
    fields: parsed.schema.fields || {},
    tsxPath,
    schemaPath,
  }
}

// ─────────────────────────────────────────────
// List all generated templates
// ─────────────────────────────────────────────
export function listGeneratedTemplates() {
  const schemasDir = path.join(__dirname, 'schemas')
  const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'))
  const generated = []

  for (const f of files) {
    try {
      const schema = JSON.parse(fs.readFileSync(path.join(schemasDir, f), 'utf8'))
      if (schema.tags?.includes('generated')) {
        generated.push({
          template: schema.template,
          name: schema.name,
          description: schema.description,
          category: schema.category,
          fields: Object.keys(schema.fields || {}),
        })
      }
    } catch (e) {
      // skip
    }
  }
  return generated
}
