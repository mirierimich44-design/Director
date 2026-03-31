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
from pathlib import Path
from typing import Optional, Literal

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Director TTS Service", version="2.0.0")

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

# ── Lazy model instances ──────────────────────────────────────────────────────
_kokoro  = None
_orpheus = None


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
        _orpheus = OrpheusCpp()
        logger.info("Orpheus-CPP ready.")
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
    engine: Literal["kokoro", "orpheus"] = "kokoro"
    output_filename: Optional[str] = None


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
    }


@app.get("/voices")
def list_voices():
    return {
        "kokoro": KOKORO_VOICE_IDS,
        "orpheus": ORPHEUS_VOICE_IDS,
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    speed = max(0.5, min(2.0, req.speed))
    filename = req.output_filename or f"tts_{uuid.uuid4().hex[:12]}.wav"
    if not filename.endswith(".wav"):
        filename += ".wav"
    output_path = AUDIO_TTS_DIR / filename

    # ── Kokoro ────────────────────────────────────────────────────────────────
    if req.engine == "kokoro":
        voice = req.voice if req.voice in KOKORO_VOICE_IDS else "af_heart"
        try:
            kokoro = get_kokoro()
            samples, sample_rate = kokoro.create(req.text, voice=voice, speed=speed)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            logger.error(f"Kokoro error: {e}")
            raise HTTPException(status_code=500, detail=f"Kokoro failed: {e}")

        sf.write(str(output_path), samples, sample_rate)
        duration = round(len(samples) / sample_rate, 2)

    # ── Orpheus ───────────────────────────────────────────────────────────────
    elif req.engine == "orpheus":
        voice = req.voice if req.voice in ORPHEUS_VOICE_IDS else "tara"
        try:
            orpheus = get_orpheus()
            chunks = list(orpheus.generate_speech(req.text, voice=voice))
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            logger.error(f"Orpheus error: {e}")
            raise HTTPException(status_code=500, detail=f"Orpheus failed: {e}")

        # chunks are raw int16 PCM at 24000 Hz
        sample_rate = 24000
        if chunks:
            raw = b"".join(chunks)
            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            samples = np.zeros(sample_rate, dtype=np.float32)

        sf.write(str(output_path), samples, sample_rate)
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
