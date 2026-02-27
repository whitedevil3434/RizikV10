#!/usr/bin/env python3
"""
Grok API Wrapper Setup Script for OpenClaw
Installs and tests the unofficial Grok API
"""

import subprocess
import sys
import os

def run_command(cmd, desc):
    """Run shell command with error handling"""
    print(f"🔧 {desc}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Failed: {result.stderr}")
        return False
    print(f"✅ {desc} - Success")
    return True

def main():
    # Step 1: Clone repository
    if not os.path.exists("/tmp/Grok-Api"):
        run_command(
            "cd /tmp && git clone https://github.com/realasfngl/Grok-Api.git",
            "Cloning Grok-Api repository"
        )
    
    # Step 2: Create virtual environment
    run_command(
        "cd /tmp/Grok-Api && python3 -m venv venv",
        "Creating virtual environment"
    )
    
    # Step 3: Install dependencies
    run_command(
        "cd /tmp/Grok-Api && source venv/bin/activate && pip install -q -r requirements.txt",
        "Installing Python dependencies"
    )
    
    # Step 4: Test API server
    print("\n🚀 Starting Grok API server on port 6969...")
    print("📝 Test with: curl -X POST http://localhost:6969/ask -d '{\"message\":\"Hello\",\"model\":\"grok-3-fast\"}'")
    print("\n⚠️  Remember: This wrapper may be broken due to Cloudflare/xAI changes")
    print("📊 Check GitHub issues: https://github.com/realasfngl/Grok-Api/issues")
    
    # Run server
    os.system("cd /tmp/Grok-Api && source venv/bin/activate && python3 api_server.py")

if __name__ == "__main__":
    main()
