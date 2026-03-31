import { googleAI, getIMAGE_MODEL } from './llm.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../../public/images');

/**
 * Generate an image using Gemini native image models (Nano Banana)
 * or fallback to Imagen via the same SDK if applicable.
 */
export async function generateImage(prompt, options = {}) {
    try {
        const modelName = options.model || getIMAGE_MODEL() || 'gemini-3.1-flash-image-preview';
        
        console.log(`   🎨 Gemini Image Gen: ${modelName}`);
        console.log(`   📋 Prompt: ${prompt.substring(0, 100)}...`);

        // Use the Google AI SDK
        const model = googleAI.getGenerativeModel({ model: modelName });

        // Gemini Image models usually take a prompt and optional parameters
        // The SDK method for image generation in 2026 often follows a similar pattern to generateContent
        // but with image-specific configuration.
        
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                // Image specific params (aspect ratio, etc)
                // In 2026 SDK, these are part of the generationConfig or a specialized method
                aspectRatio: options.aspectRatio || '16:9',
                sampleCount: 1,
            }
        });

        // The response contains the image bytes in a specific field
        // This is a speculative implementation based on the user's "Nano Banana" request
        const response = await result.response;
        const candidate = response.candidates?.[0];
        
        // Check for base64 data in the response parts (speculative SDK structure for 2026)
        const imagePart = candidate?.content?.parts?.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));
        const b64 = imagePart?.inlineData?.data;

        if (!b64) {
            // Fallback: check if it's in the predictions field (legacy/Rest style)
            const data = response.data || response;
            if (data.predictions?.[0]?.bytesBase64Encoded) {
                return { success: true, url: await saveImage(data.predictions[0].bytesBase64Encoded) };
            }
            throw new Error('No image data returned from Gemini Image API');
        }

        const url = await saveImage(b64);
        return { success: true, url };
    } catch (err) {
        console.error('❌ generateImage error:', err.message);
        return { success: false, error: err.message };
    }
}

async function saveImage(b64) {
    const imgId = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${imgId}.jpg`;
    const imgPath = path.join(imagesDir, filename);
    
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));
    
    console.log(`   🖼️ Gemini image saved: ${filename}`);
    return `/images/${filename}`;
}
