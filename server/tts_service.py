#!/usr/bin/env python3
"""
Multi-engine TTS FastAPI Service
Engines: Kokoro ONNX (fast, CPU) | Orpheus-CPP (richer voices, CPU-slow)

Runs on port 8880 — called by the Director Express server at /api/tts/*

Setup:
  bash server/setup_tts.sh
Start:
  pm2 start server/tts_service.py --interpreter python3 --name kokoro-tts
"""

import os
import uuid
import logging
import struct
import base64
import traceback
from pathlib import Path
from typing import Optional, Literal

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(Path(__file__).parent.parent / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Director TTS Service", version="2.1.0")

# ── Paths ─────────────────────────────────────────────────────────────────────
SERVICE_DIR   = Path(__file__).parent
PROJECT_ROOT  = SERVICE_DIR.parent
AUDIO_TTS_DIR = PROJECT_ROOT / "public" / "audio" / "tts"

# Kokoro model files (downloaded by setup_tts.sh)
KOKORO_MODEL  = SERVICE_DIR / "kokoro-v1.0.onnx"
KOKORO_VOICES = SERVICE_DIR / "voices-v1.0.bin"

AUDIO_TTS_DIR.mkdir(parents=True, exist_ok=True)

# ── Voice lists ───────────────────────────────────────────────────────────────
KOKORO_VOICE_IDS = [
    "af_heart", "af_bella", "af_sarah", "af_nicole",
    "am_adam",  "am_michael",
    "bf_emma",  "bf_isabella",
    "bm_george","bm_lewis",
]

ORPHEUS_VOICE_IDS = ["tara", "leah", "jess", "leo", "dan", "mia", "zac", "zoe"]

GEMINI_VOICE_IDS = [
    "Aoede", "Charon", "Kore", "Puck", "Rheia",
    "Fenrir", "Zephyr", "Enceladus", "Leda", "Vindemiatrix",
    "Callirrhoe", "Achernar", "Zubenelgenubi", "Despina", "Gacrux",
    "Umbriel", "Achird", "Algenib", "Alnilam", "Autonoe",
    "Erinome", "Pulcherrima", "Rasalgethi", "Sadachbia", "Sadaltager",
    "Schedar", "Sulafat", "Algieba"
]

# Best voices for documentary narration (calm, authoritative, informative)
DOCUMENTARY_VOICES = ["Charon", "Fenrir", "Enceladus", "Schedar"]
DOCUMENTARY_DEFAULT = "Charon"  # "Informative" — best match for documentary style


def pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 24000, channels: int = 1, bits: int = 16) -> bytes:
    """Wrap raw Gemini PCM output in a valid WAV container."""
    byte_rate   = sample_rate * channels * bits // 8
    block_align = channels * bits // 8
    data_size   = len(pcm_bytes)
    header = struct.pack('<4sI4s', b'RIFF', 36 + data_size, b'WAVE')
    fmt    = struct.pack('<4sIHHIIHH', b'fmt ', 16, 1, channels,
                         sample_rate, byte_rate, block_align, bits)
    data   = struct.pack('<4sI', b'data', data_size)
    return header + fmt + data + pcm_bytes

# ── Lazy model instances ──────────────────────────────────────────────────────
_kokoro  = None
_orpheus = None
_gemini_client = None

def get_gemini_client():
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    
    api_key = os.environ.get("GOOGLE_AI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_AI_API_KEY not found in environment or .env file")
    
    try:
        from google import genai
        _gemini_client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialized.")
        return _gemini_client
    except ImportError:
        raise RuntimeError("google-genai not installed. Run: pip install google-genai")

def get_kokoro():
    global _kokoro
    if _kokoro is not None:
        return _kokoro
    if not KOKORO_MODEL.exists():
        raise RuntimeError(
            f"Kokoro model not found at {KOKORO_MODEL}. Run: bash server/setup_tts.sh"
        )
    if not KOKORO_VOICES.exists():
        raise RuntimeError(
            f"Voices file not found at {KOKORO_VOICES}. Run: bash server/setup_tts.sh"
        )
    from kokoro_onnx import Kokoro
    logger.info("Loading Kokoro ONNX model...")
    _kokoro = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    logger.info("Kokoro ready.")
    return _kokoro


def get_orpheus():
    global _orpheus
    if _orpheus is not None:
        return _orpheus
    try:
        from orpheus_cpp import OrpheusCpp
        logger.info("Loading Orpheus-CPP model (first load downloads ~6 GB)...")
        # We wrap the instantiation as this is where llama_context is created
        try:
            _orpheus = OrpheusCpp()
            logger.info("Orpheus-CPP ready.")
        except Exception as instantiation_error:
            error_msg = str(instantiation_error)
            logger.error(f"Failed to initialize Orpheus model: {error_msg}")
            if "llama_context" in error_msg.lower() or "memory" in error_msg.lower():
                raise RuntimeError(
                    f"Orpheus initialization failed (llama_context): {error_msg}. "
                    "This is usually caused by insufficient RAM (needs ~6GB). "
                    "Try adding a swap file on your VPS or upgrading your RAM."
                )
            raise instantiation_error
    except ImportError:
        raise RuntimeError(
            "orpheus-cpp not installed. Run: pip3 install orpheus-cpp llama-cpp-python"
        )
    return _orpheus


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    text: str
    voice: str = "af_heart"
    speed: float = 1.0
    engine: Literal["kokoro", "orpheus", "gemini"] = "kokoro"
    output_filename: Optional[str] = None
    style: str = "documentary"   # "documentary" | "neutral" | "custom"


class GenerateResponse(BaseModel):
    success: bool
    filename: str
    duration: float
    voice: str
    engine: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "kokoro_model_ready": KOKORO_MODEL.exists() and KOKORO_VOICES.exists(),
        "kokoro_loaded": _kokoro is not None,
        "orpheus_loaded": _orpheus is not None,
        "gemini_ready": os.environ.get("GOOGLE_AI_API_KEY") is not None,
    }


@app.get("/voices")
def list_voices():
    return {
        "kokoro": KOKORO_VOICE_IDS,
        "orpheus": ORPHEUS_VOICE_IDS,
        "gemini": GEMINI_VOICE_IDS,
    }


import traceback

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    speed = max(0.5, min(2.0, req.speed))
    filename = req.output_filename or f"tts_{uuid.uuid4().hex[:12]}.wav"
    if not filename.endswith(".wav"):
        filename += ".wav"
    output_path = AUDIO_TTS_DIR / filename

    # ── Gemini ────────────────────────────────────────────────────────────────
    if req.engine == "gemini":
        # Default to Charon for documentary style — most "informative" voice
        voice = req.voice if req.voice in GEMINI_VOICE_IDS else DOCUMENTARY_DEFAULT
        try:
            from google.genai import types
            client = get_gemini_client()

            # ── Style prefix ─────────────────────────────────────────────────
            # Gemini TTS uses the text content itself as the style guide.
            # Prepending a narration instruction keeps voice consistent across
            # all scenes in a documentary.
            if req.style == "documentary":
                style_prefix = (
                    "Read the following as a professional documentary narrator. "
                    "Calm, measured, authoritative delivery. Clear diction. "
                    "No dramatic emphasis, no excitement — informative and composed: "
                )
            else:
                style_prefix = ""

            # Speed tags (supported in 2.5+ models)
            pace_tag = ""
            if speed > 1.2:
                pace_tag = "[speaking quickly] "
            elif speed < 0.8:
                pace_tag = "[speaking slowly] "

            final_text = f"{pace_tag}{style_prefix}{req.text}"

            # ── Model priority list ──────────────────────────────────────────
            # Correct model names as of April 2026
            # Source: ai.google.dev/gemini-api/docs/models/
            models_to_try = [
                "gemini-3.1-flash-tts-preview",  # latest — fastest, lowest latency
                "gemini-2.5-pro-preview-tts",    # best quality, long-form narration
                "gemini-2.5-flash-preview-tts",  # fast fallback
            ]

            response = None
            last_err = None

            for model_id in models_to_try:
                try:
                    logger.info(f"Attempting Gemini TTS: model={model_id} voice={voice}")
                    response = client.models.generate_content(
                        model=model_id,
                        contents=final_text,
                        config=types.GenerateContentConfig(
                            response_modalities=["AUDIO"],
                            speech_config=types.SpeechConfig(
                                voice_config=types.VoiceConfig(
                                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                        voice_name=voice
                                    )
                                )
                            )
                        )
                    )
                    logger.info(f"Gemini TTS success: model={model_id}")
                    break
                except Exception as e:
                    last_err = e
                    logger.warning(f"Model {model_id} failed: {e}")
                    continue

            if not response:
                raise last_err or RuntimeError("All Gemini TTS models failed")

            # ── Extract and decode audio ─────────────────────────────────────
            # Gemini returns raw PCM: 24 kHz, 16-bit, mono — no WAV header.
            # inline_data.data may be bytes (SDK-decoded) or base64 string.
            raw_data = None
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    raw_data = part.inline_data.data
                    break

            if not raw_data:
                raise RuntimeError("No audio data in Gemini response")

            # Normalise to bytes
            if isinstance(raw_data, str):
                pcm_bytes = base64.b64decode(raw_data)
            elif isinstance(raw_data, (bytes, bytearray)):
                pcm_bytes = bytes(raw_data)
            else:
                # Some SDK versions wrap in a memoryview or similar
                pcm_bytes = bytes(raw_data)

            # Wrap PCM in a valid WAV container (24 kHz, 16-bit, mono)
            wav_bytes = pcm_to_wav(pcm_bytes, sample_rate=24000, channels=1, bits=16)

            with open(output_path, "wb") as f:
                f.write(wav_bytes)

            # Calculate duration from sample count (avoids re-reading the file)
            num_samples = len(pcm_bytes) // 2  # 16-bit = 2 bytes per sample
            duration = round(num_samples / 24000, 2)
            logger.info(f"Gemini TTS: {len(pcm_bytes)} PCM bytes → {duration}s WAV")

        except Exception as e:
            logger.error(f"Gemini TTS error: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Gemini TTS failed: {e}")

    # ── Kokoro ────────────────────────────────────────────────────────────────
    elif req.engine == "kokoro":
        voice = req.voice if req.voice in KOKORO_VOICE_IDS else "af_heart"
        try:
            kokoro = get_kokoro()
            samples, sample_rate = kokoro.create(req.text, voice=voice, speed=speed)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            logger.error(f"Kokoro error: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Kokoro failed: {e}")

        sf.write(str(output_path), samples, sample_rate)
        duration = round(len(samples) / sample_rate, 2)

    # ── Orpheus ───────────────────────────────────────────────────────────────
    elif req.engine == "orpheus":
        voice = req.voice if req.voice in ORPHEUS_VOICE_IDS else "tara"
        try:
            orpheus = get_orpheus()
            # This is where the heavy CPU work happens
            chunks = list(orpheus.generate_speech(req.text, voice=voice))
        except RuntimeError as e:
            # Caught from our custom get_orpheus handler
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            logger.error(f"Orpheus error: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Orpheus failed: {e}")

        # chunks are raw int16 PCM at 24000 Hz
        sample_rate = 24000
        if chunks:
            raw = b"".join(chunks)
            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            samples = np.zeros(sample_rate, dtype=np.float32)

        try:
            sf.write(str(output_path), samples, sample_rate)
        except Exception as e:
            logger.error(f"File write error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save audio: {e}")
            
        duration = round(len(samples) / sample_rate, 2)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown engine: {req.engine}")

    logger.info(f"Generated: {filename} | {duration}s | engine={req.engine} | voice={voice}")
    return GenerateResponse(
        success=True,
        filename=filename,
        duration=duration,
        voice=voice,
        engine=req.engine,
    )


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("TTS_PORT", 8880))
    logger.info(f"Starting Director TTS service on http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
