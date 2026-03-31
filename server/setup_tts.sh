#!/usr/bin/env bash
# Setup TTS engines for the Director Studio
# Run from the project root: bash server/setup_tts.sh [--with-orpheus]
set -e

WITH_ORPHEUS=false
for arg in "$@"; do
    [[ "$arg" == "--with-orpheus" ]] && WITH_ORPHEUS=true
done

echo "📦 Installing Kokoro dependencies..."
pip3 install fastapi uvicorn "kokoro-onnx>=0.4.0" soundfile "numpy>=1.24.0"

echo ""
echo "📥 Downloading Kokoro model files (into server/)..."
cd server

RELEASE="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"

if [ ! -f "kokoro-v1.0.onnx" ]; then
    echo "  Downloading kokoro-v1.0.onnx (~90 MB)..."
    wget -q --show-progress "$RELEASE/kokoro-v1.0.onnx"
else
    echo "  kokoro-v1.0.onnx already present — skipping."
fi

if [ ! -f "voices-v1.0.bin" ]; then
    echo "  Downloading voices-v1.0.bin (~10 MB)..."
    wget -q --show-progress "$RELEASE/voices-v1.0.bin"
else
    echo "  voices-v1.0.bin already present — skipping."
fi

cd ..

if [ "$WITH_ORPHEUS" = true ]; then
    echo ""
    echo "📦 Installing Orpheus-CPP (CPU backend, ~6 GB model download on first run)..."
    pip3 install orpheus-cpp llama-cpp-python
    echo "  ✅ Orpheus-CPP installed. Model (~6 GB) will download automatically on first use."
    echo "  ⚠️  On a no-GPU VPS, Orpheus generation takes 2–5 min per clip."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start with pm2:"
echo "  pm2 start server/tts_service.py --interpreter python3 --name kokoro-tts"
echo ""
echo "Health check:"
echo "  curl http://localhost:8880/health"
echo ""
if [ "$WITH_ORPHEUS" = false ]; then
    echo "To also enable Orpheus voices, re-run with:"
    echo "  bash server/setup_tts.sh --with-orpheus"
fi
