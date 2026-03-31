/**
 * settings.js — Centralized settings store (file-backed JSON)
 *
 * Manages API keys, model selections, and other configuration.
 * Settings persist to server/settings.json and can be updated via API.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SETTINGS_FILE = path.join(__dirname, 'settings.json')

// ─────────────────────────────────────────────
// Default settings
// ─────────────────────────────────────────────
const DEFAULTS = {
  // API Keys (override .env values)
  keys: {
    google: '',      // GOOGLE_AI_API_KEY
    anthropic: '',   // ANTHROPIC_API_KEY
    stadia: '',      // STADIA_API_KEY (Stadia Maps — free map tiles)
    heygen: '',      // HEYGEN_API_KEY
    pexels: '',      // PEXELS_API_KEY
  },

  // Deployment
  publicUrl: '',     // The public URL of this server (e.g., https://yourdomain.com)

  // Language models
  models: {
    language: {
      primary: 'gemini-2.5-flash',            // Main generation (TSX, scene routing, template gen)
      fast: 'gemini-2.5-flash',               // Fast/cheap JSON tasks (routing, extraction)
      claude: 'claude-3-7-sonnet-latest',      // Claude primary
      claudeFast: 'claude-3-5-haiku-latest',   // Claude fast
    },
    tts: {
      engine: 'kokoro',                        // 'kokoro', 'orpheus', or 'heygen'
    },
    image: {
      primary: 'imagen-4.0-generate-001',      // Image generation
      fallback: 'imagen-4.0-generate-001',    // Fallback image model
    },
    video: {
      primary: 'veo-2.0-generate-001',      // Video generation (Veo 2)
    },
  },

  // Providers
  providers: {
    generation: 'gemini',    // 'gemini' or 'claude' — default for TSX generation
    image: 'imagen',         // 'imagen' or 'gemini' — default for image generation
  },
}

// ─────────────────────────────────────────────
// In-memory settings (loaded on startup)
// ─────────────────────────────────────────────
let settings = structuredClone(DEFAULTS)

/**
 * Load settings from disk, merging with defaults
 */
export function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8')
      const saved = JSON.parse(raw)
      // Deep merge saved over defaults
      settings = deepMerge(structuredClone(DEFAULTS), saved)
      console.log('⚙️  Settings loaded from settings.json')
    } else {
      settings = structuredClone(DEFAULTS)
      console.log('⚙️  Using default settings (no settings.json found)')
    }
  } catch (e) {
    console.warn('⚠️ Failed to load settings.json, using defaults:', e.message)
    settings = structuredClone(DEFAULTS)
  }

  // Env vars fill in any empty key fields
  if (!settings.keys.google && process.env.GOOGLE_AI_API_KEY) {
    settings.keys.google = process.env.GOOGLE_AI_API_KEY
  }
  if (!settings.keys.anthropic && process.env.ANTHROPIC_API_KEY) {
    settings.keys.anthropic = process.env.ANTHROPIC_API_KEY
  }
  if (!settings.keys.stadia && process.env.STADIA_API_KEY) {
    settings.keys.stadia = process.env.STADIA_API_KEY
  }

  return settings
}

/**
 * Save current settings to disk
 */
export function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
    console.log('⚙️  Settings saved to settings.json')
  } catch (e) {
    console.error('❌ Failed to save settings:', e.message)
    throw e
  }
}

/**
 * Get all settings (safe copy — keys are masked)
 */
export function getSettings() {
  return {
    keys: {
      google: maskKey(settings.keys.google),
      anthropic: maskKey(settings.keys.anthropic),
      stadia: maskKey(settings.keys.stadia),
      heygen: maskKey(settings.keys.heygen),
      pexels: maskKey(settings.keys.pexels),
      googleSet: !!settings.keys.google,
      anthropicSet: !!settings.keys.anthropic,
      stadiaSet: !!settings.keys.stadia,
      heygenSet: !!settings.keys.heygen,
      pexelsSet: !!settings.keys.pexels,
    },
    publicUrl: settings.publicUrl,
    models: structuredClone(settings.models),
    providers: structuredClone(settings.providers),
  }
}

/**
 * Get raw settings (with actual keys — internal use only)
 */
export function getRawSettings() {
  return settings
}

/**
 * Update settings (partial merge)
 */
export function updateSettings(updates) {
  if (updates.keys) {
    // ... existing key updates ...
  }
  if (updates.publicUrl !== undefined) {
    settings.publicUrl = updates.publicUrl
  }
  if (updates.models) {
    settings.models = deepMerge(settings.models, updates.models)
  }
  if (updates.providers) {
    settings.providers = { ...settings.providers, ...updates.providers }
  }
  saveSettings()
  return getSettings()
}

// ─────────────────────────────────────────────
// Quick accessors used by other modules
// ─────────────────────────────────────────────
export function getGoogleKey() {
  return settings.keys.google || process.env.GOOGLE_AI_API_KEY || ''
}

export function getAnthropicKey() {
  return settings.keys.anthropic || process.env.ANTHROPIC_API_KEY || ''
}

export function getStadiaKey() {
  return settings.keys.stadia || process.env.STADIA_API_KEY || ''
}

export function getLanguageModel() {
  return settings.models.language.primary
}

export function getFastModel() {
  return settings.models.language.fast
}

export function getClaudeModel() {
  return settings.models.language.claude
}

export function getClaudeFastModel() {
  return settings.models.language.claudeFast
}

export function getImageModel() {
  return settings.models.image.primary
}

export function getImageFallback() {
  return settings.models.image.fallback
}

export function getVideoModel() {
  return settings.models.video?.primary || 'veo-3.0-generate-preview'
}

export function getGenerationProvider() {
  return settings.providers.generation
}

// ─────────────────────────────────────────────
// Available model options (for UI dropdowns)
// ─────────────────────────────────────────────
export const MODEL_OPTIONS = {
  language: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', provider: 'google' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite (Preview)', provider: 'google' },
    { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
    { id: 'claude-haiku-3-5', name: 'Claude Haiku 3.5', provider: 'anthropic' },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic' },
  ],
  image: [
    { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0', provider: 'google' },
    { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', provider: 'google' },
    { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', provider: 'google' },
  ],
  video: [
    { id: 'veo-3.0-generate-preview', name: 'Veo 3.0 (Preview)', provider: 'google' },
    { id: 'veo-2.0-generate-001', name: 'Veo 2.0', provider: 'google' },
  ],
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function maskKey(key) {
  if (!key) return ''
  if (key.length <= 8) return '****'
  return key.substring(0, 4) + '...' + key.substring(key.length - 4)
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// Initialize on import
loadSettings()
