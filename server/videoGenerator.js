import express from 'express';
import { getRawSettings } from './settings.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// ── Gemini Analysis ─────────────────────────────────────────────────────────
router.post('/analyze', async (req, res) => {
    const { input, mode } = req.body;
    const settings = getRawSettings();
    const apiKey = settings.keys.google;

    if (!apiKey) return res.status(400).json({ error: 'Google AI API Key not set' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash as the primary fast generation model
        const modelName = settings.models?.language?.fast || "gemini-2.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = mode === 'topic'
            ? `You are a video producer. Based on the topic "${input}", write a short, engaging script for a 1-minute video. 
               Split the script into 4-6 logical scenes. 
               For each scene, provide:
               1. "script": The narration text.
               2. "background_query": A short 2-3 word English search query for a background video (e.g. "modern office", "desert sunrise").
               Output ONLY valid JSON in this format: {"scenes": [{"script": "...", "background_query": "..."}]}`
            : `You are a video producer. Here is a script: "${input}". 
               Split this script into 4-6 logical scenes. 
               For each scene, provide:
               1. "script": The narration text (preserve the user's words).
               2. "background_query": A short 2-3 word English search query for a background video (e.g. "digital technology", "city traffic").
               Output ONLY valid JSON in this format: {"scenes": [{"script": "...", "background_query": "..."}]}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse Gemini response');

        const data = JSON.parse(jsonMatch[0]);
        res.json({ success: true, scenes: data.scenes });
    } catch (err) {
        console.error('Gemini Analysis Error:', err);
        // Better error message format to surface exact cause
        res.status(500).json({ error: err.message || 'Gemini API failed to respond' });
    }
});

// ── Pexels Search ───────────────────────────────────────────────────────────
router.get('/pexels-search', async (req, res) => {
    const { query } = req.query;
    const settings = getRawSettings();
    const apiKey = settings.keys.pexels;

    if (!apiKey) return res.status(400).json({ error: 'Pexels API Key not set' });

    try {
        const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1`, {
            headers: { 'Authorization': apiKey }
        });
        const data = await response.json();
        
        const videos = data.videos.map(v => ({
            link: v.video_files.find(f => f.quality === 'hd')?.link || v.video_files[0].link,
            image: v.image
        }));

        res.json({ success: true, videos });
    } catch (err) {
        console.error('Pexels Search Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── HeyGen Generate ─────────────────────────────────────────────────────────
router.post('/heygen-generate', async (req, res) => {
    const { script, backgroundVideoUrl, bgMode, bgColor, avatarId, avatarType, voiceId, layout } = req.body;
    const settings = getRawSettings();
    const apiKey = settings.keys.heygen;

    if (!apiKey) return res.status(400).json({ error: 'HeyGen API Key not set' });

    try {
        const character = avatarType === 'talking_photo' 
            ? {
                type: "talking_photo",
                talking_photo_id: avatarId
              }
            : {
                type: "avatar",
                avatar_id: avatarId,
                avatar_style: "normal"
              };

        let background = {
            type: "video",
            video_asset_url: backgroundVideoUrl,
            play_style: "fit"
        };

        if (bgMode === 'color') {
            background = {
                type: "color",
                value: bgColor || "#00FF00"
            };
        } else if (bgMode === 'upload' && backgroundVideoUrl) {
            const isVideo = backgroundVideoUrl.toLowerCase().endsWith('.mp4') || backgroundVideoUrl.toLowerCase().endsWith('.webm');
            if (isVideo) {
                background = {
                    type: "video",
                    video_asset_url: backgroundVideoUrl,
                    play_style: "fit"
                };
            } else {
                background = {
                    type: "image",
                    url: backgroundVideoUrl,
                    play_style: "fit"
                };
            }
        }

        const body = {
            video_inputs: [
                {
                    character,
                    voice: {
                        type: "text",
                        input_text: script,
                        voice_id: voiceId
                    },
                    background
                }
            ],
            dimension: { width: 1920, height: 1080 }
        };

        const response = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        res.json({ success: true, video_id: data.data.video_id });
    } catch (err) {
        console.error('HeyGen Generate Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── HeyGen Status ───────────────────────────────────────────────────────────
router.get('/heygen-status/:videoId', async (req, res) => {
    const { videoId } = req.params;
    const settings = getRawSettings();
    const apiKey = settings.keys.heygen;

    try {
        const response = await fetch(`https://api.heygen.com/v2/video/${videoId}`, {
            headers: { 'X-Api-Key': apiKey }
        });
        const data = await response.json();
        
        if (data.data.status === 'completed') {
            res.json({ status: 'completed', video_url: data.data.video_url });
        } else if (data.data.status === 'failed') {
            res.json({ status: 'failed', error: data.data.error?.message || 'Unknown error' });
        } else {
            res.json({ status: 'processing' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
