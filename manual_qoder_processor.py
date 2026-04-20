#!/usr/bin/env python3
"""
Manual Qoder Processor - Watch for requests and process them in Qoder IDE
This script helps you manually process Qoder AI requests when no API is available.

How it works:
1. Bridge writes requests to /tmp/qoder_request_*.txt
2. This script notifies you (or auto-opens in Qoder)
3. You copy-paste to Qoder IDE, get response
4. Write response to /tmp/qoder_response_*.txt
5. Bridge picks it up and sends to PicoClaw
"""

import os
import time
import json
import glob
import sys
from datetime import datetime

WATCH_DIR = "/tmp"
CHECK_INTERVAL = 1  # Check every second

def print_header():
    print("\n" + "="*70)
    print("  🤖 Manual Qoder AI Processor")
    print("="*70)
    print("\nThis script watches for Qoder AI requests and helps you process them.")
    print("\nHow it works:")
    print("  1. Request files appear at: /tmp/qoder_request_*.txt")
    print("  2. You process them in Qoder IDE")
    print("  3. Write response to: /tmp/qoder_response_*.txt")
    print("\nWaiting for requests... (Press Ctrl+C to stop)\n")

def process_request(request_file):
    """Process a single request file"""
    try:
        # Read request
        with open(request_file, 'r') as f:
            request_data = json.load(f)
        
        prompt = request_data.get('prompt', '')
        model = request_data.get('model', 'qoder-auto')
        timestamp = request_data.get('timestamp', '')
        
        print(f"\n{'='*70}")
        print(f"📥 NEW REQUEST at {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*70}")
        print(f"Model: {model}")
        print(f"Prompt ({len(prompt)} chars):")
        print(f"{'-'*70}")
        print(prompt[:500] + "..." if len(prompt) > 500 else prompt)
        print(f"{'-'*70}")
        
        # Generate response filename
        request_filename = os.path.basename(request_file)
        pid = request_filename.replace('qoder_request_', '').replace('.txt', '')
        response_file = f"/tmp/qoder_response_{pid}.txt"
        
        print(f"\n💡 To respond:")
        print(f"   1. Copy the prompt above")
        print(f"   2. Paste into Qoder IDE")
        print(f"   3. Get Qoder's response")
        print(f"   4. Save response to: {response_file}")
        print(f"\n⏰ Timeout: 120 seconds from request creation")
        print(f"{'='*70}\n")
        
        # Option: Auto-open editor
        print("Options:")
        print("  [A] Auto-open text editor for response")
        print("  [M] Manual mode (I'll create the file myself)")
        print("  [S] Skip this request")
        print()
        
        choice = input("Your choice (A/M/S): ").strip().lower()
        
        if choice == 'a':
            # Open editor
            print(f"\n✍️  Opening editor... Write response and save to: {response_file}")
            time.sleep(2)
            
            # Try common editors
            editors = ['nano', 'vim', 'code', 'gedit', 'textedit']
            for editor in editors:
                try:
                    os.system(f"{editor} {response_file} 2>/dev/null")
                    break
                except:
                    continue
            
        elif choice == 'm':
            print(f"\n✋ Manual mode - Create {response_file} when ready")
            print("   I'll keep watching for it...")
            
        elif choice == 's':
            print("⚠️  Skipping request...")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing request: {e}")
        return False

def main():
    print_header()
    
    processed_count = 0
    skipped_count = 0
    
    try:
        while True:
            # Look for request files
            request_files = glob.glob(f"{WATCH_DIR}/qoder_request_*.txt")
            
            if request_files:
                # Sort by modification time (oldest first)
                request_files.sort(key=os.path.getmtime)
                
                for request_file in request_files:
                    if process_request(request_file):
                        processed_count += 1
                    else:
                        skipped_count += 1
                    
                    # Remove processed request
                    try:
                        os.remove(request_file)
                    except:
                        pass
            
            # Status update every 10 seconds
            if processed_count % 10 == 0 and processed_count > 0:
                print(f"\n📊 Stats: {processed_count} processed, {skipped_count} skipped")
            
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print(f"\n\n👋 Stopping Manual Qoder Processor")
        print(f"📊 Final stats:")
        print(f"   Processed: {processed_count}")
        print(f"   Skipped: {skipped_count}")
        print(f"\n💡 Tip: Keep this running in a terminal tab for manual Qoder integration!")

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
        sys.exit(0)
