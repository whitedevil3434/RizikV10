#!/bin/bash
# Start Qoder Bridge + PicoClaw Gateway

set -e

echo "🚀 Starting Super PicoClaw with Qoder Bridge..."
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama is not running! Please start it first:"
    echo "   ollama serve"
    exit 1
fi

echo "✅ Ollama is running"

# Kill any existing bridge processes
pkill -f qoder_bridge.py 2>/dev/null || true
sleep 1

# Start Qoder Bridge in background
echo "🌉 Starting Qoder Bridge on port 8765..."
cd /Users/sabbir/RizikV10
python3 qoder_bridge.py > /tmp/qoder_bridge.log 2>&1 &
BRIDGE_PID=$!

# Wait for bridge to start
sleep 3

# Check if bridge is running
if ps -p $BRIDGE_PID > /dev/null; then
    echo "✅ Qoder Bridge started (PID: $BRIDGE_PID)"
else
    echo "❌ Qoder Bridge failed to start!"
    cat /tmp/qoder_bridge.log
    exit 1
fi

# Test bridge health
if curl -s http://localhost:8765/health > /dev/null 2>&1; then
    echo "✅ Qoder Bridge is healthy"
else
    echo "⚠️  Qoder Bridge may need a moment to initialize..."
fi

echo ""
echo "🦐 Starting PicoClaw Gateway..."

# Kill any existing PicoClaw processes
pkill -f picoclaw 2>/dev/null || true
sleep 1

# Start PicoClaw Gateway
cd /Users/sabbir/RizikV10/picoclaw
./picoclaw gateway > /tmp/picoclaw_super.log 2>&1 &
PICOCLAW_PID=$!

# Wait for PicoClaw to start
sleep 5

# Check if PicoClaw is running
if ps -p $PICOCLAW_PID > /dev/null; then
    echo "✅ PicoClaw Gateway started (PID: $PICOCLAW_PID)"
else
    echo "❌ PicoClaw Gateway failed to start!"
    cat /tmp/picoclaw_super.log
    kill $BRIDGE_PID
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 Super PicoClaw is RUNNING!"
echo "=========================================="
echo ""
echo "Services:"
echo "  🌉 Qoder Bridge:  http://localhost:8765"
echo "  🤖 PicoClaw:      http://localhost:18790"
echo "  💬 Telegram Bot:  @Lara_R_bot"
echo ""
echo "Models available:"
echo "  1. qoder-ai (Qoder Bridge)"
echo "  2. qwen2.5 (Ollama local)"
echo ""
echo "Logs:"
echo "  Qoder Bridge:  tail -f /tmp/qoder_bridge.log"
echo "  PicoClaw:      tail -f /tmp/picoclaw_super.log"
echo ""
echo "To stop:"
echo "  kill $BRIDGE_PID $PICOCLAW_PID"
echo "  or run: ./stop_super_picoclaw.sh"
echo ""
