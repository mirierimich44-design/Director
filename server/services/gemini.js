import { googleAI, getIMAGE_MODEL } from './llm.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../../public/images');

/**
 * Generate an image using Gemini native image models (Nano Banana).
 * These models use the standard generateContent endpoint with
 * responseModalities: ['IMAGE'] to produce inline image data.
 */
export async function generateImage(prompt, options = {}) {
    try {
        const modelName = options.model || getIMAGE_MODEL() || 'gemini-2.0-flash-exp';

        console.log(`   🎨 Gemini Image Gen: ${modelName}`);
        console.log(`   📋 Prompt: ${prompt.substring(0, 100)}...`);

        const model = googleAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const candidate = response.candidates?.[0];

        // Gemini image models return inline image data in parts
        const imagePart = candidate?.content?.parts?.find(
            p => p.inlineData && p.inlineData.mimeType?.startsWith('image/')
        );

        if (!imagePart?.inlineData?.data) {
            // Log what we got back for debugging
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
