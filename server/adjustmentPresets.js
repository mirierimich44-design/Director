/**
 * adjustmentPresets.js
 *
 * Pre-saved adjustment presets for template tweaking.
 * Each preset has an LLM-friendly prompt that targets specific code patterns.
 *
 * Usage:
 *   import { ADJUSTMENT_PRESETS, generateAdjustment } from './adjustmentPresets.js'
 */

import { googleAI } from './services/llm.js'
import { FIX_MODEL } from './templateAuditor.js'

// ─── Preset Library ───────────────────────────────────────────────────────────

export const ADJUSTMENT_PRESETS = {
  typography: {
    label: 'Typography',
    color: '#4fc3f7',
    presets: [
      {
        id: 'font-decrease',
        label: 'Decrease Font Size',
        prompt: 'Reduce all fontSize values by approximately 20%. Scale down proportionally across all text elements.',
      },
      {
        id: 'font-increase',
        label: 'Increase Font Size',
        prompt: 'Increase all fontSize values by approximately 20%. Scale up proportionally across all text elements.',
      },
      {
        id: 'tighter-spacing',
        label: 'Tighter Letter Spacing',
        prompt: 'Reduce letterSpacing values by 30%. If letterSpacing is not set, add letterSpacing: \'-0.02em\' to primary text elements.',
      },
      {
        id: 'bolder',
        label: 'Bolder Text',
        prompt: 'Set fontWeight to 700 or 800 on primary heading and label text elements.',
      },
    ],
  },

  layout: {
    label: 'Layout',
    color: '#81c784',
    presets: [
      {
        id: 'more-padding',
        label: 'More Padding',
        prompt: 'Increase padding and gap values by 25%. This improves breathing room between elements.',
      },
      {
        id: 'fix-clipping',
        label: 'Fix Text Clipping',
        prompt: 'Remove overflow:hidden on any container that may clip text. Increase fixed height values by 20% on containers that hold text content.',
      },
      {
        id: 'bigger-containers',
        label: 'Bigger Containers',
        prompt: 'Increase the height of main content containers by 20%. Ensure inner content has room to breathe.',
      },
      {
        id: 'better-wrapping',
        label: 'Better Text Wrap',
        prompt: 'Remove whiteSpace:\'nowrap\' from text elements. Add flexWrap:\'wrap\' to flex containers holding text.',
      },
    ],
  },

  visual: {
    label: 'Visual',
    color: '#ffb74d',
    presets: [
      {
        id: 'thicker-outline',
        label: 'Thicker Outline',
        prompt: 'Increase all border width values by 1-2px. Increase strokeWidth on any SVG elements. Make borders and outlines more prominent.',
      },
      {
        id: 'stronger-color',
        label: 'Stronger Accent Color',
        prompt: 'Make the primary accent/highlight color more vivid. Increase opacity of decorative elements from any partial transparency to at least 0.85.',
      },
      {
        id: 'higher-contrast',
        label: 'Higher Contrast',
        prompt: 'Ensure all text colors have strong contrast against their backgrounds. Replace any grey-on-grey or low-contrast color pairings with higher-contrast equivalents.',
      },
      {
        id: 'larger-icons',
        label: 'Larger Icons',
        prompt: 'Increase the size of icon elements, SVG symbols, and decorative shapes by 20%.',
      },
    ],
  },

  animation: {
    label: 'Animation',
    color: '#ce93d8',
    presets: [
      {
        id: 'faster',
        label: 'Faster Animation',
        prompt: 'Reduce all animation frame ranges (interpolate input ranges) by 30%. Make transitions and entrances snappier.',
      },
      {
        id: 'slower',
        label: 'Slower Animation',
        prompt: 'Increase all animation frame ranges (interpolate input ranges) by 30%. Make transitions more gradual and cinematic.',
      },
      {
        id: 'smoother',
        label: 'Smoother Easing',
        prompt: 'Apply Bezier(0.42, 0, 0.58, 1) easeInOut easing to all interpolate calls that use extrapolateRight or extrapolateLeft clamp. Add easing: { type: \'spring\', damping: 12 } where spring physics suit the element.',
      },
      {
        id: 'delay-entry',
        label: 'Delay Entry',
        prompt: 'Add a 15-20 frame delay to the start of all main element animations. Shift all interpolate frame start points forward by 15 frames.',
      },
    ],
  },

  fix: {
    label: 'Fix',
    color: '#ef9a9a',
    presets: [
      {
        id: 'fix-hardcoded',
        label: 'Fix Hardcoded Values',
        prompt: 'Replace any remaining hardcoded stub numbers or text strings with proper ALL_CAPS placeholder variables following the existing naming convention.',
      },
      {
        id: 'fix-overflow',
        label: 'Fix Overflow Hidden',
        prompt: 'Find all overflow:\'hidden\' declarations. For any that sit on containers holding dynamic text content from placeholders, change to overflow:\'visible\' or remove the overflow property.',
      },
      {
        id: 'remove-nowrap',
        label: 'Remove Nowrap',
        prompt: 'Remove all instances of whiteSpace:\'nowrap\' on elements that render placeholder variable content. This prevents text overflow on long values.',
      },
      {
        id: 'fix-scale',
        label: 'Fix 1920×1080 Scale',
        prompt: 'Audit all absolute pixel values and ensure elements are properly proportioned for a 1920×1080 canvas. Fix any elements that appear too small (< 5% canvas width) or oversized (> 90% canvas width) without reason.',
      },
    ],
  },
}

// ─── Flatten helper ───────────────────────────────────────────────────────────

/** Returns all preset objects as a flat array */
export function getAllPresets() {
  return Object.values(ADJUSTMENT_PRESETS).flatMap(cat => cat.presets)
}

/** Look up a single preset by id */
export function getPresetById(id) {
  return getAllPresets().find(p => p.id === id) || null
}

// ─── LLM Adjustment Generator ─────────────────────────────────────────────────

/**
 * Ask the LLM to apply a set of adjustments to a template.
 *
 * @param {string}   code          Full TSX source of the template
 * @param {object[]} selectedPresets  Array of preset objects { id, label, prompt }
 * @param {string}   [customPrompt]  Optional free-text additional instruction
 * @param {string}   templateName   Template filename for context
 * @returns {Promise<string>}        Adjusted TSX code
 */
export async function generateAdjustment(code, selectedPresets, customPrompt, templateName) {
  const model = googleAI.getGenerativeModel({ model: FIX_MODEL })

  const adjustmentList = selectedPresets
    .map((p, i) => `${i + 1}. **${p.label}**: ${p.prompt}`)
    .join('\n')

  const customSection = customPrompt?.trim()
    ? `\nADDITIONAL INSTRUCTIONS:\n${customPrompt.trim()}\n`
    : ''

  const prompt = `You are adjusting a Remotion animation template called "${templateName}".

REQUESTED ADJUSTMENTS:
${adjustmentList}
${customSection}
CURRENT TEMPLATE CODE:
\`\`\`tsx
${code}
\`\`\`

STRICT RULES:
- ONLY change what is needed for the adjustments listed above
- DO NOT alter placeholder variable strings (ALL_CAPS like "TITLE_TEXT", "BACKGROUND_COLOR", "COUNT_VALUE" etc)
- DO NOT restructure, rename, or remove JSX elements unless the adjustment explicitly requires it
- DO NOT change theme color variable references
- DO NOT add imports — use only what is already imported
- Preserve all existing animation logic that is not being adjusted
- Return ONLY the complete corrected TSX code with no explanation and no markdown code fences

Adjusted code:`

  const result = await model.generateContent(prompt)
  let adjusted = result.response.text().trim()
  // Strip any markdown fences the model added anyway
  adjusted = adjusted.replace(/^```(?:tsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '')
  return adjusted
}

// ─── Simple line diff ─────────────────────────────────────────────────────────

/**
 * Returns a simple diff summary between two code strings.
 * @returns {{ added: number, removed: number, changed: number }}
 */
export function diffSummary(original, adjusted) {
  const origLines = original.split('\n')
  const newLines  = adjusted.split('\n')
  const origSet   = new Set(origLines)
  const newSet    = new Set(newLines)

  const added   = newLines.filter(l => !origSet.has(l)).length
  const removed = origLines.filter(l => !newSet.has(l)).length
  const changed = Math.min(added, removed)

  return { added: added - changed, removed: removed - changed, changed }
}
