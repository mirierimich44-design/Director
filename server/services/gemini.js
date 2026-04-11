import { googleAI, getIMAGE_MODEL } from './llm.js';
import { withGoogleKeyFallback } from '../settings.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../../public/images');

/**
 * Generate an image using either Imagen (`:predict` endpoint) or Gemini image models.
 * Imagen models (imagen-*): use the generativelanguage :predict REST endpoint.
 * Gemini image models (gemini-*): use generateContent with responseModalities.
 */
// Try a single Imagen model via the :predict REST endpoint.
// Returns { success: true, url } or throws on failure.
async function tryImagenModel(modelName, prompt, aspectRatio) {
    const body = {
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio },
    };
    const response = await withGoogleKeyFallback(async (key) => {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${key}`;
        const r = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60_000),
        });
        if (r.status === 429) {
            const t = await r.text();
            const err = new Error(`Imagen API 429: ${t.substring(0, 200)}`);
            err.status = 429;
            throw err;
        }
        return r;
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Imagen API ${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('No image returned from Imagen API. Response: ' + JSON.stringify(data).substring(0, 200));

    const url = await saveImage(b64, 'image/jpeg');
    return { success: true, url };
}

export async function generateImage(prompt, options = {}) {
    try {
        const modelName = options.model || getIMAGE_MODEL() || 'imagen-4.0-generate-001';
        const aspectRatio = options.aspectRatio || '16:9';

        console.log(`   🎨 Image Gen: ${modelName} [${aspectRatio}]`);
        console.log(`   📋 Prompt: ${prompt.substring(0, 100)}...`);

        // Imagen models use the :predict REST endpoint (different from Gemini generateContent)
        if (modelName.startsWith('imagen-')) {
            // Try the configured model first, then fall back through stable alternatives
            const imagenFallbacks = ['imagen-3.0-generate-001', 'imagen-3.0-fast-generate-001'];
            try {
                return await tryImagenModel(modelName, prompt, aspectRatio);
            } catch (primaryErr) {
                console.warn(`   ⚠️ ${modelName} failed: ${primaryErr.message.substring(0, 120)}`);
                // Try fallback Imagen models
                for (const fallback of imagenFallbacks) {
                    if (fallback === modelName) continue;
                    try {
                        console.log(`   🔄 Retrying with ${fallback}...`);
                        const result = await tryImagenModel(fallback, prompt, aspectRatio);
                        console.log(`   ✅ Fallback ${fallback} succeeded`);
                        return result;
                    } catch (fbErr) {
                        console.warn(`   ⚠️ ${fallback} also failed: ${fbErr.message.substring(0, 80)}`);
                    }
                }
                // All Imagen models failed — fall through to Gemini SDK below
                console.warn(`   ⚠️ All Imagen models failed, trying Gemini image model...`);
            }
        }

        // Gemini image models (e.g. gemini-2.0-flash-exp) use generateContent with responseModalities
        // When falling through from a failed Imagen model, use a known Gemini image model instead
        const geminiImageModel = modelName.startsWith('imagen-') ? 'gemini-2.0-flash-exp' : modelName;
        console.log(`   🎨 Trying Gemini image model: ${geminiImageModel}`);
        const model = googleAI.getGenerativeModel({
            model: geminiImageModel,
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
                imageGenerationConfig: { aspectRatio },
            },
        });
        const response = result.response;
        const candidate = response.candidates?.[0];

        const imagePart = candidate?.content?.parts?.find(
            p => p.inlineData && p.inlineData.mimeType?.startsWith('image/')
        );

        if (!imagePart?.inlineData?.data) {
            const parts = candidate?.content?.parts || [];
            const textPart = parts.find(p => p.text);
            if (textPart) {
                console.error('   ⚠️ Gemini returned text instead of image:', textPart.text.substring(0, 200));
            }
            throw new Error('No image data returned from Gemini Image API');
        }

        const url = await saveImage(imagePart.inlineData.data, imagePart.inlineData.mimeType);
        return { success: true, url };
    } catch (err) {
        console.error('❌ generateImage error:', err.message);
        return { success: false, error: err.message };
    }
}

async function saveImage(b64, mimeType = 'image/png') {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const imgId = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${imgId}.${ext}`;
    const imgPath = path.join(imagesDir, filename);

    await fs.mkdir(imagesDir, { recursive: true });
    await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));

    console.log(`   🖼️ Gemini image saved: ${filename}`);
    return `/images/${filename}`;
}
