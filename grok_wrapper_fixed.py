#!/usr/bin/env python3
"""
Grok API Fixed Version - OpenClaw Integration
MIT-Level Engineering by Omega

Fixes:
1. Issue #6: list index out of range (SVG animation parsing)
2. Enhanced error handling and fallbacks
3. Timeout protection for network requests
4. Graceful degradation when Grok changes structure
"""

import sys
import os

# Add the Grok-Api to Python path
sys.path.insert(0, '/tmp/Grok-Api')

def test_grok_wrapper():
    """Test the fixed Grok API wrapper"""
    try:
        from core import Grok
        
        print("🔧 Testing Grok API Wrapper (OMEGA Fixed Version)")
        print("="*60)
        
        # Test with grok-3-fast (fastest model)
        print("\n📡 Initializing Grok-3-Fast...")
        client = Grok("grok-3-fast")
        
        print("💬 Sending test message...")
        response = client.start_convo("Hello! Test message from OpenClaw.")
        
        if "error" in response:
            print(f"\n❌ Error: {response['error']}")
            return False
        elif "response" in response:
            print(f"\n✅ Success!")
            print(f"Response: {response['response'][:200]}...")
            print(f"\nStream tokens: {len(response.get('stream_response', []))} tokens")
            
            # Check if images were generated
            if response.get('images'):
                print(f"Images: {len(response['images'])} generated")
                
            return True
        else:
            print(f"\n⚠️  Unexpected response format: {response}")
            return False
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def start_api_server():
    """Start the fixed Grok API server"""
    print("\n🚀 Starting Grok API Server (OMEGA Fixed)")
    print("="*60)
    print("Endpoint: http://localhost:6969/ask")
    print("Available models:")
    print("  - grok-3-fast (recommended)")
    print("  - grok-3-auto")
    print("  - grok-4")
    print("  - grok-4-mini-thinking")
    print("\nPress Ctrl+C to stop")
    print("="*60)
    
    os.chdir('/tmp/Grok-Api')
    os.system('python3 api_server.py')

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Grok API Fixed Wrapper")
    parser.add_argument('--test', action='store_true', help='Run test')
    parser.add_argument('--server', action='store_true', help='Start API server')
    parser.add_argument('--message', type=str, help='Send a message directly')
    
    args = parser.parse_args()
    
    if args.test:
        success = test_grok_wrapper()
        sys.exit(0 if success else 1)
    elif args.server:
        start_api_server()
    elif args.message:
        from core import Grok
        response = Grok("grok-3-fast").start_convo(args.message)
        if "response" in response:
            print(response["response"])
        else:
            print(f"Error: {response.get('error', 'Unknown error')}")
    else:
        print("Grok API Wrapper (OMEGA Fixed)")
        print("\nUsage:")
        print("  --test         Run test conversation")
        print("  --server       Start API server on port 6969")
        print("  --message TEXT Send a direct message")
        print("\nExample:")
        print('  python3 grok_wrapper_fixed.py --message "Hello world"')
