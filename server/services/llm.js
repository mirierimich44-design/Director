import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import {
    getGoogleKey, getAnthropicKey,
    getLanguageModel, getFastModel,
    getClaudeModel, getClaudeFastModel,
    getImageModel, getImageFallback,
    withGoogleKeyFallback,
} from '../settings.js';

// ─────────────────────────────────────────────
// API Clients (lazy — rebuilt when keys change)
// ─────────────────────────────────────────────
let _anthropic = null;
let _googleAI = null;
let _lastGoogleKey = '';
let _lastAnthropicKey = '';

function getAnthropicClient() {
    const key = getAnthropicKey();
    if (!key) return null;
    if (_anthropic && _lastAnthropicKey === key) return _anthropic;
    _anthropic = new Anthropic({ apiKey: key });
    _lastAnthropicKey = key;
    return _anthropic;
}

function getGoogleClient(keyOverride) {
    const key = keyOverride || getGoogleKey();
    if (!keyOverride && _googleAI && _lastGoogleKey === key) return _googleAI;
    const c = new GoogleGenerativeAI(key);
    if (!keyOverride) { _googleAI = c; _lastGoogleKey = key; }
    return c;
}

// ─────────────────────────────────────────────
// Exports — live getters so settings changes take effect immediately
// ─────────────────────────────────────────────

// Clients
export const anthropic = new Proxy({}, {
    get(_, prop) { const c = getAnthropicClient(); return c ? c[prop] : undefined; }
});
export const googleAI = new Proxy({}, {
    get(_, prop) { return getGoogleClient()[prop]; }
});

/**
 * Call fn(geminiClient) with the primary Google key.
 * If it hits a quota/429 error and a second key is configured, retries with the fallback key.
 * @param {(client: GoogleGenerativeAI) => Promise<any>} fn
 */
export async function callGeminiWithFallback(fn) {
    return withGoogleKeyFallback((key) => fn(getGoogleClient(key)));
}
export const client = anthropic; // Backward compatibility

// Model names — use getter functions so they read live settings
export function getCLAUDE_MODEL() { return getClaudeModel(); }
export function getCLAUDE_FAST_MODEL() { return getClaudeFastModel(); }
export function getGEMINI_MODEL() { return getLanguageModel(); }
export function getGEMINI_FLASH_MODEL() { return getFastModel(); }
export function getIMAGE_MODEL() { return getImageModel(); }
export function getIMAGE_FALLBACK() { return getImageFallback(); }

// Static exports for backward compatibility — read current value at call time
// These are getters on the module so they return fresh values
let _modelExports = {};
Object.defineProperty(_modelExports, 'CLAUDE_MODEL', { get: () => getClaudeModel(), enumerable: true });
Object.defineProperty(_modelExports, 'CLAUDE_FAST_MODEL', { get: () => getClaudeFastModel(), enumerable: true });
Object.defineProperty(_modelExports, 'GEMINI_MODEL', { get: () => getLanguageModel(), enumerable: true });
Object.defineProperty(_modelExports, 'GEMINI_FLASH_MODEL', { get: () => getFastModel(), enumerable: true });

// For ESM named exports, we use mutable variables updated by a refresh function
export let CLAUDE_MODEL = getClaudeModel();
export let CLAUDE_FAST_MODEL = getClaudeFastModel();
export let GEMINI_MODEL = getLanguageModel();
export let GEMINI_FLASH_MODEL = getFastModel();

// Call this after settings change to refresh the exported constants
export function refreshModels() {
    CLAUDE_MODEL = getClaudeModel();
    CLAUDE_FAST_MODEL = getClaudeFastModel();
    GEMINI_MODEL = getLanguageModel();
    GEMINI_FLASH_MODEL = getFastModel();
    // Force client rebuild on next access
    _lastGoogleKey = '';
    _lastAnthropicKey = '';
    console.log(`⚙️  Models refreshed: Language=${GEMINI_MODEL}, Claude=${CLAUDE_MODEL}, Image=${getImageModel()}`);
}

// Log startup config
const gKey = getGoogleKey();
const aKey = getAnthropicKey();
if (!gKey) console.warn('⚠️ GOOGLE_AI_API_KEY is not configured. Gemini features will be disabled.');
if (!aKey) console.warn('⚠️ ANTHROPIC_API_KEY is not configured. Claude features will be disabled.');
console.log(`⚙️  LLM Config: Language=${GEMINI_MODEL}, Fast=${GEMINI_FLASH_MODEL}, Claude=${CLAUDE_MODEL}, Image=${getImageModel()}`);
