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
      primary: 'gemini-3.1-flash-lite-preview',            // Main generation (TSX, scene routing, template gen)
      fast: 'gemini-3.1-flash-lite-preview',               // Fast/cheap JSON tasks (routing, extraction)
      claude: 'claude-sonnet-4-5',                         // Claude primary
      claudeFast: 'claude-haiku-4-0',                      // Claude fast
    },
    tts: {
      engine: 'kokoro',                        // 'kokoro', 'orpheus', or 'heygen'
    },
    image: {
      primary: 'imagen-4.0-generate-001',      // Image generation
      fallback: 'imagen-4.0-fast-generate-001',    // Fallback image model
    },
    video: {
      primary: 'veo-3.1-generate-preview',      // Video generation (Veo 3.1)
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
    // Atomic write: crash mid-write won't corrupt settings.json
    const tmp = SETTINGS_FILE + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(settings, null, 2), 'utf8')
    fs.renameSync(tmp, SETTINGS_FILE)
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
    // Only update keys that are explicitly provided and non-empty
    if (updates.keys.google !== undefined && updates.keys.google !== '') {
      settings.keys.google = updates.keys.google
    }
    if (updates.keys.anthropic !== undefined && updates.keys.anthropic !== '') {
      settings.keys.anthropic = updates.keys.anthropic
    }
    if (updates.keys.stadia !== undefined && updates.keys.stadia !== '') {
      settings.keys.stadia = updates.keys.stadia
    }
    if (updates.keys.heygen !== undefined && updates.keys.heygen !== '') {
      settings.keys.heygen = updates.keys.heygen
    }
    if (updates.keys.pexels !== undefined && updates.keys.pexels !== '') {
      settings.keys.pexels = updates.keys.pexels
    }
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
  return settings.models.video?.primary || 'veo-2.0-generate-001'
}

export function getGenerationProvider() {
  return settings.providers.generation
}

// ─────────────────────────────────────────────
// Available model options (for UI dropdowns)
// ─────────────────────────────────────────────
export const MODEL_OPTIONS = {
  language: [
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', provider: 'google' },
    { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', provider: 'google' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
    { id: 'claude-sonnet-4-5', name: 'Claude 4.5 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'claude-haiku-4-0', name: 'Claude 4.0 Haiku', provider: 'anthropic' },
  ],
  image: [
    { id: 'imagen-3.0-generate-001', name: 'Imagen 3.0 (Stable)', provider: 'google' },
    { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0', provider: 'google' },
    { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', provider: 'google' },
    { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', provider: 'google' },
    { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', provider: 'google' },
    { id: 'gemini-2.5-flash-image', name: 'Nano Banana', provider: 'google' },
  ],
  video: [
    { id: 'veo-3.1-generate-preview',      name: 'Veo 3.1 (latest, with audio)', provider: 'google' },
    { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast',                 provider: 'google' },
    { id: 'veo-3.0-generate-001',          name: 'Veo 3.0 (GA, with audio)',      provider: 'google' },
    { id: 'veo-3.0-fast-generate-001',     name: 'Veo 3.0 Fast (GA)',             provider: 'google' },
    { id: 'veo-2.0-generate-001',          name: 'Veo 2.0 (stable)',              provider: 'google' },
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
