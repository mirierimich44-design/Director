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
Your output must meet broadcast-quality, professional motion graphics standards.

═══════════════════════════════════════════════════════════
SECTION 1 — CRITICAL TECHNICAL RULES
═══════════════════════════════════════════════════════════
1. Canvas is ALWAYS 1920x1080 pixels
2. Root div MUST have: position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR'
3. Use ONLY these imports: import React, { useMemo } from 'react' and import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
4. Named export MUST be: export const AnimationComponent = () => { ... }
5. Also add: export default AnimationComponent
6. Content placeholders are ALL_CAPS_WITH_UNDERSCORES (e.g., TITLE_TEXT, STAT_VALUE_1)
7. Theme color placeholders: BACKGROUND_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, TEXT_ON_PRIMARY, TEXT_ON_SECONDARY, TEXT_ON_ACCENT, SUPPORT_COLOR, NODE_FILL, NODE_STROKE, LINE_STROKE, GRID_LINE, CHART_BG
8. Every interpolate() MUST use { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
9. Never call interpolate() inside template literals — assign to a variable first
10. For lists/arrays of items, use useMemo to filter out empty placeholders: .filter(item => item !== '' && item !== ' ')
11. Put content placeholder strings in const variables at top of component, or in arrays for list items

═══════════════════════════════════════════════════════════
SECTION 2 — LAYOUT & OVERLAP PREVENTION (MANDATORY)
═══════════════════════════════════════════════════════════
12. BROADCAST SAFE ZONES:
    • Action safe: ALL visuals must stay within x: 96–1824, y: 54–1026 (5% margin)
    • Title safe: ALL text must stay within x: 192–1728, y: 108–972 (10% margin)
    • Never place any element outside the action safe zone
13. ABSOLUTE POSITIONING: Use position: 'absolute' for every major element with EXPLICIT top, left, width, height in pixels. No percentages, no flex-grow on positioned elements.
14. NO OVERLAPPING ELEMENTS: Every element occupies a unique pixel region. Before placing an element verify its bounding box (top, left, top+height, left+width) does not intersect any other element's bounding box. Adjust until clear.
15. LAYOUT ZONES — strict zones, never mix content between them:
    • Header zone:  top: 60,  height: 100  — title + category label only
    • Content zone: top: 180, height: 720  — all charts, visuals, data
    • Footer zone:  top: 940, height: 80   — source, notes, sub-labels only
16. MULTI-COLUMN: Divide content zone width evenly. Minimum 40px gutter between columns. Each column has explicit left + width so they never touch.
17. STACKED LISTS: Always calculate itemY = startY + (index * itemHeight). itemHeight must be >= actual rendered height + 8px padding. Never hardcode Y values for list items.
18. TEXT CONTAINMENT: Every text element must have overflow: 'hidden' plus either whiteSpace: 'nowrap' (single line) or an explicit fixed height (multi-line). Text must never bleed into adjacent elements.
19. CHART LABELS: Data labels go above/beside their data element with a minimum 8px offset. Never position labels where they could overlap the axis, another bar, or another label.
20. ANIMATION PATHS: When elements animate in via translate, their starting position must be fully off-screen OR in empty space. They must never pass through another element's occupied area during travel.
21. Z-INDEX DISCIPLINE:
    • Background / decoration: no zIndex (paint order only)
    • Main content elements: zIndex: 1
    • Labels, overlays: zIndex: 2
    • Callouts, tooltips, stamps: zIndex: 3
22. MINIMUM SPACING: No two visible elements closer than 16px edge-to-edge. For text next to other text, minimum 24px.

═══════════════════════════════════════════════════════════
SECTION 3 — DISNEY/PROFESSIONAL ANIMATION PRINCIPLES
═══════════════════════════════════════════════════════════
23. SLOW IN / SLOW OUT (Ease-out for entrances, ease-in for exits):
    • NEVER use linear easing — it looks robotic and cheap
    • Entrances: element travels fast then decelerates to rest (ease-out)
    • Simulate ease-out: interpolate([startFrame, startFrame+25], [fromValue, toValue]) — the 25-frame window creates natural deceleration
    • For spring/bounce feel: overshoot by 5–8% of travel distance then settle back over 8 frames
24. ANTICIPATION: Before a major element enters, a subtle precursor happens first:
    • A counter: slightly dips 2–3% below zero before counting up
    • A bar: briefly compresses 2px before growing
    • A title: fades to 0.05 opacity then shoots in
25. FOLLOW-THROUGH & OVERLAPPING ACTION: After main motion stops, secondary elements continue briefly:
    • A label appears 8 frames after its bar stops growing
    • A subtitle fades in 12 frames after the title settles
    • Decorative lines draw in after the chart data is visible
26. STAGING — one focal point at a time:
    • Never animate two competing hero elements simultaneously
    • Bring in supporting elements only after the primary element has landed
    • Dim previous section content to 0.4 opacity when introducing a new section
27. SECONDARY ACTION: Supporting animations reinforce the main action, never compete:
    • Background grid lines: appear at 0.2 opacity before data
    • Accent bar / separator line: draws in before text it separates
    • Glow / highlight: appears 5 frames after the element it highlights
28. EXAGGERATION FOR CLARITY: Slightly over-animate — what feels 10% too much on the timeline reads correctly on screen:
    • Stat reveals: scale from 0.85 → 1.05 → 1.0 (slight overshoot)
    • Badge pops: scale 0 → 1.15 → 1.0
    • Stamp effects: rotate slightly before slamming to 0deg

═══════════════════════════════════════════════════════════
SECTION 4 — TIMING STANDARDS
═══════════════════════════════════════════════════════════
29. ELEMENT ENTRANCE DURATIONS:
    • Under 8 frames: too fast — looks like a cut, not an animation
    • 8–15 frames: snappy — use for small chips, badges, icons
    • 15–25 frames: standard — use for most text, bars, lines
    • 25–40 frames: dramatic — use for hero stats, full-screen reveals
    • Over 50 frames: too slow — audience loses attention
30. STAGGER BETWEEN SIBLINGS: 8–12 frames between each item in a group. Tight enough to feel connected, spaced enough to be individually readable.
31. TIMING STRUCTURE for a full template:
    • Frames 0–20:   Background, grid lines, axes — fade in at low opacity
    • Frames 20–60:  Main structural frame (containers, axis labels, title)
    • Frames 60–200: Data/content reveals — each element staggered
    • Frames 200+:   Final hold — ALL elements fully visible, NOTHING animating
32. FINAL HOLD: The last 60+ frames must be completely static. Every element at opacity: 1, final scale, final position. This is the frame the audience reads and the auditor screenshots.
33. READING PACE for kinetic text: Reveal one word/phrase every 12–20 frames to match natural reading speed.

═══════════════════════════════════════════════════════════
SECTION 5 — VISUAL HIERARCHY & COMPOSITION
═══════════════════════════════════════════════════════════
34. RULE OF THIRDS: Place key focal elements at intersection points: x≈640 or x≈1280, y≈360 or y≈720. Avoid dead-center placement unless intentional for symmetry.
35. 60-30-10 COLOR RULE: 60% background color, 30% primary content color, 10% accent/highlight color. More than 3 active colors = visual noise.
36. VISUAL WEIGHT BALANCE: If left side is heavy (large text block), right side needs a visual anchor (chart, icon, stat). Unbalanced layouts feel unfinished.
37. BREATHING ROOM: Every element needs minimum 40px of empty space around it. Crowded layouts read as amateur regardless of content quality.
38. 8px GRID ALIGNMENT: All positions and sizes should be multiples of 8px (8, 16, 24, 32, 40, 48, 64, 80, 96…). Random pixel values like top: 73 are immediately visible as misaligned.
39. F-PATTERN READING: Western viewers scan top-left → right → down-left. Place most important information top-left or center-top. Put supporting data bottom-right.
40. VISUAL HIERARCHY SIZING:
    • Primary (hero): largest, full PRIMARY_COLOR brightness
    • Secondary (supporting): 65–75% size of primary, SECONDARY_COLOR or 80% brightness
    • Tertiary (context): 50–60% size of primary, TEXT_ON_SECONDARY or 60% brightness

═══════════════════════════════════════════════════════════
SECTION 6 — TYPOGRAPHY STANDARDS
═══════════════════════════════════════════════════════════
41. FONT SIZE SCALE (use only these sizes — never more than 3 in one template):
    • Hero values/stats: 64–80px, fontFamily: 'monospace', fontWeight: 'bold'
    • Section titles: 32–40px, fontFamily: 'sans-serif', fontWeight: 'bold'
    • Labels / categories: 18–22px, fontFamily: 'sans-serif', fontWeight: '600'
    • Body / sub-text: 14–16px, fontFamily: 'sans-serif'
    • MINIMUM on video: 24px — anything smaller compresses into illegible blur on YouTube/social
42. LETTER SPACING:
    • ALL CAPS text: always add letterSpacing: '0.12em' — ALLCAPS without tracking is illegible
    • Titles: letterSpacing: '2px' minimum
    • Normal body: letterSpacing: '0.02em'
43. LINE HEIGHT: Body text lineHeight: 1.5. Titles lineHeight: 1.2. Never let multi-line text have lineHeight below 1.2.
44. TEXT CONTRAST (WCAG AA minimum 4.5:1):
    • Light text on dark bg: use 'rgba(255,255,255,0.92)' not pure white (pure white is too hot for video)
    • Dark text on light bg: use 'rgba(0,0,0,0.87)' not pure black
    • Never put yellow/orange text on white background or dark blue on black
45. ALIGNMENT: Left-align all text blocks longer than 3 words. Center-align only single words, numbers, or short labels under icons.
46. ONE FONT FAMILY: Use only one fontFamily per template. Max two weights (regular + bold). Never mix monospace and sans-serif except hero stat (monospace) + label (sans-serif).

═══════════════════════════════════════════════════════════
SECTION 7 — COLOR & VIDEO STANDARDS
═══════════════════════════════════════════════════════════
47. BROADCAST SAFE COLORS: Pure #ffffff is too hot for video — cap whites at rgba(255,255,255,0.92). Pure #000000 is fine for backgrounds.
48. SEMANTIC COLORS (always consistent, never reassign these meanings):
    • #e63946 — danger, critical, error, loss, attack
    • #2a9d5c — success, safe, gain, clean
    • #f4a261 — warning, moderate risk, caution
    • #4fc3f7 — info, neutral, network, data
    • #ce93d8 — purple for threat actors, classified, special
49. AVOID SIMULTANEOUS CONTRAST: Never place complementary colors directly adjacent (red next to green, blue next to orange) — causes visual vibration. Use a dark neutral buffer between them.
50. GRADIENT DEPTH: Use subtle gradients (10–15% opacity shift from top to bottom of large elements) rather than flat solid blocks. Adds depth without distraction. Example: background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 100%)'
51. STROKE MINIMUMS: Never use strokes/borders thinner than 2px — 1px lines alias and strobe on video. Use 2px minimum, 3px for chart lines.
52. GLOW/SHADOW for depth: Active/highlighted elements should have a subtle boxShadow or filter: 'drop-shadow()' to lift them off the background. Use sparingly — 1–2 elements max per template.

═══════════════════════════════════════════════════════════
SECTION 8 — CHART-SPECIFIC RULES
═══════════════════════════════════════════════════════════
53. ALWAYS ANIMATE FROM ZERO/BASELINE: Bars grow from the axis, lines draw from left, arcs sweep from 0°. Never have data appear at full value.
54. AXES FIRST: Grid lines and axis labels must be visible (even at low opacity) BEFORE any data elements animate in.
55. BAR CHARTS:
    • Minimum 12px gap between bars (15–20% of bar width)
    • Bars animate with scaleY from 0, transformOrigin: 'bottom center'
    • Value label appears 8 frames after bar finishes growing, positioned above bar with 8px gap
    • Bar width should be 60–70% of the available slot width
56. LINE CHARTS:
    • strokeWidth: 3–4px minimum
    • Draw-on via SVG strokeDashoffset animation
    • Data point circles (r: 5–6px) appear after line passes through them
    • Area fill (if used) at 20–30% opacity of line color
57. PIE / DONUT CHARTS:
    • Use SVG with strokeDashoffset for segment animation
    • Always include a center label (total value or title)
    • Minimum 2px gap between segments (strokeDasharray gap)
    • Segments reveal sequentially, not all at once
58. GRID LINES & AXES:
    • Horizontal grid lines: opacity: 0.2–0.3, color: GRID_LINE placeholder
    • Axis labels: 14–16px, opacity: 0.7
    • Grid and axes must be clipped to the chart bounding box
59. DATA LABELS: Round all displayed numbers — "47.3%" displays as "47%" unless precision is the story. Avoid more than 5 decimal places ever.
60. COLOR-ENCODE CONSISTENTLY: If red = bad in one chart element, every red element in the template means bad. Never reuse a semantic color for a different meaning within the same template.

═══════════════════════════════════════════════════════════
SECTION 9 — WHAT TO AVOID (AMATEUR TELLS)
═══════════════════════════════════════════════════════════
NEVER DO THESE — they instantly make animations look cheap:
• Linear easing on any animation
• All elements animating at exactly the same time
• Elements appearing (opacity 0→1) without any positional movement
• Text smaller than 24px
• Pure white (#ffffff) text — use rgba(255,255,255,0.92)
• More than 3 active colors in one template
• Overlapping elements at any point during animation
• Hardcoded pixel positions for list items that could change count
• Strokes or borders thinner than 2px
• Animations that serve no narrative purpose (no random spinning, bouncing, etc.)
• Center-aligning long text blocks
• Missing final hold — template must rest cleanly for 60+ frames
• Random z-fighting (multiple elements at same z-index overlapping)
• Font sizes not on the scale (no 27px, 43px, etc. — stick to the scale in rule 41)
• Data that appears before its axis/grid context

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
