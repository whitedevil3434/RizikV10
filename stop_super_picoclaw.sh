#!/bin/bash
# Stop Super PicoClaw services

echo "🛑 Stopping Super PicoClaw..."

# Stop Qoder Bridge
if pkill -f qoder_bridge.py; then
    echo "✅ Qoder Bridge stopped"
else
    echo "ℹ️  Qoder Bridge was not running"
fi

# Stop PicoClaw
if pkill -f picoclaw; then
    echo "✅ PicoClaw Gateway stopped"
else
    echo "ℹ️  PicoClaw was not running"
fi

echo ""
echo "👋 All services stopped!"
