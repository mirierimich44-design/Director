import { spawn } from 'child_process';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory for processed audio
const processedDir = join(__dirname, '../../public/audio/processed');

// Ensure processed directory exists
async function ensureProcessedDir() {
    try {
        await fs.mkdir(processedDir, { recursive: true });
    } catch (e) { }
}

/**
 * Execute FFmpeg command and return promise
 */
function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        console.log('🎵 Running FFmpeg:', 'ffmpeg', args.join(' '));

        const ffmpeg = spawn('ffmpeg', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderr = '';

        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, stderr });
            } else {
                reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
            }
        });

        ffmpeg.on('error', (err) => {
            reject(new Error(`FFmpeg error: ${err.message}`));
        });
    });
}

/**
 * Get audio duration using FFprobe
 */
async function getAudioDuration(inputPath) {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            inputPath
        ]);

        let output = '';
        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
                resolve(parseFloat(output.trim()));
            } else {
                resolve(0);
            }
        });

        ffprobe.on('error', () => resolve(0));
    });
}

/**
 * Remove silence from audio file
 * Uses silenceremove filter to detect and remove silent parts
 */
async function removeSilence(inputPath, outputPath, options = {}) {
    const {
        silenceThreshold = -40,  // dB threshold for silence detection
        silenceDuration = 0.5,   // Minimum silence duration to remove (seconds)
        keepPadding = 0.1        // Keep small padding around speech (seconds)
    } = options;

    // FFmpeg silenceremove filter
    // stop_periods=-1 means remove all silence
    // stop_duration is the minimum silence duration to trigger removal
    // stop_threshold is the noise floor (in dB)
    const silenceFilter = `silenceremove=stop_periods=-1:stop_duration=${silenceDuration}:stop_threshold=${silenceThreshold}dB`;

    const args = [
        '-y',
        '-i', inputPath,
        '-af', silenceFilter,
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        outputPath
    ];

    await runFFmpeg(args);
    return outputPath;
}

/**
 * Enhance audio with crisp highs and boosted bass
 * Uses EQ, compression, and limiting
 */
async function enhanceAudio(inputPath, outputPath, options = {}) {
    const {
        bassBoost = 6,           // Bass boost in dB (low frequencies)
        trebleBoost = 3,         // Treble boost in dB (high frequencies)
        midCut = -2,             // Slight mid cut for clarity
        compression = true,      // Apply compression
        normalize = true,        // Normalize output level
        deEss = true,            // Reduce sibilance
        noiseReduction = false   // Light noise reduction (can affect quality)
    } = options;

    // Build filter chain
    const filters = [];

    // 1. High-pass filter to remove rumble (below 80Hz)
    filters.push('highpass=f=80');

    // 2. Bass boost (low shelf at 100Hz)
    filters.push(`lowshelf=f=100:g=${bassBoost}`);

    // 3. Mid cut for clarity (parametric EQ at 400Hz)
    if (midCut !== 0) {
        filters.push(`equalizer=f=400:t=q:w=1:g=${midCut}`);
    }

    // 4. Presence boost for clarity (around 3kHz)
    filters.push('equalizer=f=3000:t=q:w=1.5:g=2');

    // 5. Treble/air boost (high shelf at 8kHz)
    filters.push(`highshelf=f=8000:g=${trebleBoost}`);

    // 6. De-esser (reduce harsh sibilance around 6-8kHz)
    if (deEss) {
        filters.push('equalizer=f=6500:t=q:w=2:g=-3');
    }

    // 7. Compression for consistent levels
    if (compression) {
        // attack=5ms, release=50ms, threshold=-20dB, ratio=4:1, knee=2.5dB
        filters.push('acompressor=threshold=-20dB:ratio=4:attack=5:release=50:knee=2.5dB');
    }

    // 8. Light noise reduction (optional)
    if (noiseReduction) {
        filters.push('afftdn=nf=-25');
    }

    // 9. Normalize to -1dB
    if (normalize) {
        filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    }

    // 10. Final limiter to prevent clipping
    filters.push('alimiter=limit=0.95:attack=5:release=50');

    const filterChain = filters.join(',');

    const args = [
        '-y',
        '-i', inputPath,
        '-af', filterChain,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outputPath
    ];

    await runFFmpeg(args);
    return outputPath;
}

/**
 * Full processing pipeline: silence removal + enhancement
 */
export async function processVoiceover(inputPath, options = {}) {
    await ensureProcessedDir();

    const {
        removeSilences = true,
        enhance = true,
        silenceOptions = {},
        enhanceOptions = {}
    } = options;

    const inputName = basename(inputPath, extname(inputPath));
    const outputId = uuidv4();
    let currentPath = inputPath;
    let tempFiles = [];

    try {
        // Get original duration
        const originalDuration = await getAudioDuration(inputPath);

        // Step 1: Remove silence
        if (removeSilences) {
            const silenceRemovedPath = join(processedDir, `${outputId}_nosilence.mp3`);
            await removeSilence(currentPath, silenceRemovedPath, silenceOptions);
            tempFiles.push(silenceRemovedPath);
            currentPath = silenceRemovedPath;
        }

        // Step 2: Enhance audio
        if (enhance) {
            const enhancedPath = join(processedDir, `${outputId}_enhanced.mp3`);
            await enhanceAudio(currentPath, enhancedPath, enhanceOptions);

            // Clean up intermediate file if it exists
            if (tempFiles.length > 0 && tempFiles[tempFiles.length - 1] !== enhancedPath) {
                try {
                    await fs.unlink(tempFiles[tempFiles.length - 1]);
                } catch (e) { }
            }

            currentPath = enhancedPath;
        }

        // Get processed duration
        const processedDuration = await getAudioDuration(currentPath);

        // Rename to final output
        const finalPath = join(processedDir, `${inputName}_processed_${outputId}.mp3`);
        await fs.rename(currentPath, finalPath);

        return {
            success: true,
            inputPath,
            outputPath: finalPath,
            outputUrl: `/audio/processed/${basename(finalPath)}`,
            originalDuration,
            processedDuration,
            silenceRemoved: originalDuration - processedDuration,
            silenceRemovedPercent: ((originalDuration - processedDuration) / originalDuration * 100).toFixed(1)
        };

    } catch (error) {
        // Clean up any temp files on error
        for (const tempFile of tempFiles) {
            try {
                await fs.unlink(tempFile);
            } catch (e) { }
        }
        throw error;
    }
}

/**
 * Process multiple voiceover files
 */
export async function processBatch(inputPaths, options = {}) {
    const results = [];
    const errors = [];

    for (let i = 0; i < inputPaths.length; i++) {
        const inputPath = inputPaths[i];
        console.log(`🎵 Processing file ${i + 1}/${inputPaths.length}: ${basename(inputPath)}`);

        try {
            const result = await processVoiceover(inputPath, options);
            results.push(result);
        } catch (error) {
            console.error(`❌ Error processing ${inputPath}:`, error.message);
            errors.push({
                inputPath,
                error: error.message
            });
        }
    }

    return {
        success: errors.length === 0,
        processed: results.length,
        failed: errors.length,
        results,
        errors
    };
}

/**
 * Change audio playback speed without pitch distortion
 * Uses FFmpeg's atempo filter (accepts 0.5 to 100.0, 1.0 = normal)
 * @param {string} inputPath - Path to input audio file
 * @param {string} outputPath - Path to output audio file  
 * @param {number} speed - Speed multiplier (e.g. 1.1 = 10% faster, 1.5 = 50% faster)
 */
async function changeSpeed(inputPath, outputPath, speed = 1.0) {
    if (speed === 1.0) {
        // No change needed, just copy
        await fs.copyFile(inputPath, outputPath);
        return outputPath;
    }

    // Clamp speed to valid range
    const clampedSpeed = Math.max(0.5, Math.min(100.0, speed));

    // atempo filter only accepts values between 0.5 and 100.0
    // For values outside 0.5-2.0 range, chain multiple atempo filters
    const filters = [];
    let remaining = clampedSpeed;

    while (remaining > 2.0) {
        filters.push('atempo=2.0');
        remaining /= 2.0;
    }
    while (remaining < 0.5) {
        filters.push('atempo=0.5');
        remaining /= 0.5;
    }
    filters.push(`atempo=${remaining}`);

    const filterChain = filters.join(',');

    const args = [
        '-y',
        '-i', inputPath,
        '-af', filterChain,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outputPath
    ];

    await runFFmpeg(args);
    return outputPath;
}

/**
 * Concatenate multiple audio files into one
 */
export async function concatenateAudio(inputPaths, outputPath, options = {}) {
    await ensureProcessedDir();

    const { crossfade = 0 } = options;

    if (inputPaths.length === 0) {
        throw new Error('No input files provided');
    }

    if (inputPaths.length === 1) {
        // Just copy the single file
        await fs.copyFile(inputPaths[0], outputPath);
        return outputPath;
    }

    // Create a concat file for FFmpeg
    const concatFilePath = join(processedDir, `concat_${uuidv4()}.txt`);
    const concatContent = inputPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    await fs.writeFile(concatFilePath, concatContent);

    try {
        const args = [
            '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', concatFilePath,
            '-acodec', 'libmp3lame',
            '-b:a', '192k',
            outputPath
        ];

        await runFFmpeg(args);
        return outputPath;

    } finally {
        // Clean up concat file
        try {
            await fs.unlink(concatFilePath);
        } catch (e) { }
    }
}

/**
 * Get audio file info
 */
export async function getAudioInfo(inputPath) {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            inputPath
        ]);

        let output = '';
        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
                try {
                    const info = JSON.parse(output);
                    const audioStream = info.streams?.find(s => s.codec_type === 'audio');
                    resolve({
                        success: true,
                        duration: parseFloat(info.format?.duration || 0),
                        bitrate: parseInt(info.format?.bit_rate || 0),
                        sampleRate: parseInt(audioStream?.sample_rate || 0),
                        channels: audioStream?.channels || 0,
                        codec: audioStream?.codec_name || 'unknown',
                        format: info.format?.format_name || 'unknown'
                    });
                } catch (e) {
                    reject(new Error('Failed to parse audio info'));
                }
            } else {
                reject(new Error('FFprobe failed'));
            }
        });

        ffprobe.on('error', (err) => {
            reject(new Error(`FFprobe error: ${err.message}`));
        });
    });
}

/**
 * Assemble a chapter: concatenate scene videos and mux in a voiceover track.
 *
 * @param {string[]} videoPaths   - Ordered list of absolute paths to scene .mp4 files
 * @param {string|null} audioPath - Absolute path to the voiceover .mp3/.wav (or null for no audio)
 * @param {string} outputPath     - Absolute path for the final assembled .mp4
 * @param {object} options
 * @param {number} [options.audioVolume=1.0] - Mix level for the voiceover (0–1)
 */
export async function assembleChapterVideo(videoPaths, audioPath, outputPath, options = {}) {
    const { audioVolume = 1.0 } = options;

    if (!videoPaths?.length) throw new Error('assembleChapterVideo: no video paths provided');

    await fs.mkdir(dirname(outputPath), { recursive: true });

    // Build a concat list for the video streams
    const concatListPath = join(dirname(outputPath), `concat_${uuidv4()}.txt`);
    const concatContent  = videoPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    await fs.writeFile(concatListPath, concatContent);

    try {
        if (!audioPath) {
            // Video-only assembly — just concatenate
            await runFFmpeg([
                '-y',
                '-f', 'concat', '-safe', '0', '-i', concatListPath,
                '-c', 'copy',
                outputPath,
            ]);
        } else {
            // Concatenate video + mux voiceover
            // -shortest: stop when the shorter stream ends (so audio doesn't pad past video)
            const vol = Math.max(0, Math.min(1, audioVolume));
            await runFFmpeg([
                '-y',
                '-f', 'concat', '-safe', '0', '-i', concatListPath,
                '-i', audioPath,
                '-filter_complex', `[1:a]volume=${vol}[vo]`,
                '-map', '0:v:0',
                '-map', '[vo]',
                '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k',
                '-shortest',
                outputPath,
            ]);
        }
        return outputPath;
    } finally {
        try { await fs.unlink(concatListPath); } catch (_) {}
    }
}

export { changeSpeed };

export default {
    processVoiceover,
    processBatch,
    concatenateAudio,
    assembleChapterVideo,
    getAudioInfo,
    removeSilence,
    enhanceAudio,
    changeSpeed
};
