#!/bin/bash
# Grok API Complete Setup Script (OMEGA Fixed Version)
# MIT-Level Engineering for OpenClaw

echo "🔥 GROK API SETUP - OMEGA FIXED VERSION"
echo "========================================="

# Step 1: Setup directory
GROK_DIR="/tmp/Grok-Api"
cd /tmp

# Step 2: Clone if needed
if [ ! -d "$GROK_DIR" ]; then
    echo "📥 Cloning Grok-Api repository..."
    git clone https://github.com/realasfngl/Grok-Api.git
fi

cd "$GROK_DIR"

# Step 3: Apply OMEGA fixes
echo "🔧 Applying OMEGA fixes..."
cp core/reverse/parser.py core/reverse/parser_backup.py 2>/dev/null || true
cp /Users/sabbir/RizikV10/grok_api_fixes/parser_fixed.py core/reverse/parser.py 2>/dev/null || true

# Step 4: Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv

# Step 5: Activate and install dependencies
echo "📦 Installing dependencies..."
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Step 6: Test installation
echo ""
echo "✅ Installation complete!"
echo ""
echo "🎯 Available commands:"
echo "  Test:   source /tmp/Grok-Api/venv/bin/activate && python3 /Users/sabbir/RizikV10/grok_wrapper_fixed.py --test"
echo "  Server: source /tmp/Grok-Api/venv/bin/activate && python3 /Users/sabbir/RizikV10/grok_wrapper_fixed.py --server"
echo "  Direct: source /tmp/Grok-Api/venv/bin/activate && python3 /Users/sabbir/RizikV10/grok_wrapper_fixed.py --message 'Your message'"
echo ""
echo "🌐 API Server will run on: http://localhost:6969"
echo ""

# Step 7: Quick test
echo "🧪 Running quick test..."
source venv/bin/activate
python3 -c "from core import Grok; print('✅ Import successful')" 2>&1 && echo "✅ Grok wrapper is ready!" || echo "❌ Test failed - check dependencies"
