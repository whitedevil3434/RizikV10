#!/usr/bin/env python3
"""
Test script to verify Qoder AI integration methods
This helps you find which method works for your Qoder setup
"""

import subprocess
import json
import sys

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def test_qoder_cli():
    """Test Method 1: Qoder CLI"""
    print_header("TEST 1: Qoder CLI")
    
    try:
        # Check if qoder command exists
        result = subprocess.run(['which', 'qoder'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Qoder CLI not found in PATH")
            print("   The 'qoder' command is not available")
            return False
        
        print(f"✅ Qoder CLI found at: {result.stdout.strip()}")
        
        # Try to get version or help
        result = subprocess.run(['qoder', '--version'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Qoder version: {result.stdout.strip()}")
        else:
            print("ℹ️  Qoder --version failed, trying --help")
            result = subprocess.run(['qoder', '--help'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print("✅ Qoder help available")
        
        # Try actual question (simple test)
        print("\n🧪 Testing actual question...")
        result = subprocess.run(
            ['qoder', 'ask', '--json', 'Say hi in one word'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Qoder CLI responded successfully!")
            try:
                response = json.loads(result.stdout)
                print(f"   Response fields: {list(response.keys())}")
                if 'answer' in response:
                    print(f"   Answer: {response['answer'][:100]}")
                elif 'response' in response:
                    print(f"   Response: {response['response'][:100]}")
            except json.JSONDecodeError:
                print(f"   Raw output: {result.stdout[:200]}")
            return True
        else:
            print(f"❌ Qoder CLI failed: {result.stderr}")
            return False
            
    except FileNotFoundError as e:
        print(f"❌ FileNotFoundError: {e}")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Timeout - Qoder CLI took too long")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_qoder_http():
    """Test Method 2: Qoder HTTP API"""
    print_header("TEST 2: Qoder HTTP API")
    
    api_urls = [
        'http://localhost:9999/api/ask',
        'http://localhost:8080/api/chat',
        'http://127.0.0.1:3000/ask',
        'http://localhost:3000/api/ask',
    ]
    
    try:
        import requests
        
        for url in api_urls:
            print(f"\nTrying: {url}")
            try:
                response = requests.get(url.replace('/ask', '/health').replace('/chat', '/health'), timeout=3)
                if response.status_code == 200:
                    print(f"✅ Health endpoint responding at: {url}")
                    print(f"   Response: {response.text[:200]}")
                    
                    # Try actual POST
                    post_response = requests.post(
                        url,
                        json={'prompt': 'Hi', 'model': 'test'},
                        timeout=10
                    )
                    if post_response.status_code == 200:
                        print(f"✅ POST working! Response: {post_response.text[:200]}")
                        return True
                    else:
                        print(f"⚠️  POST failed with status {post_response.status_code}")
                        
            except requests.exceptions.ConnectionError:
                print(f"   ❌ Not reachable")
            except Exception as e:
                print(f"   ⚠️  Error: {e}")
        
        print("\n❌ No Qoder HTTP API endpoints found")
        return False
        
    except ImportError:
        print("❌ requests library not installed")
        print("   Install with: pip3 install requests")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_ollama_fallback():
    """Test Method 4: Ollama fallback"""
    print_header("TEST 3: Ollama Fallback (Qwen2.5)")
    
    try:
        import requests
        
        # Check if Ollama is running
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            print(f"✅ Ollama is running with {len(models)} model(s)")
            
            for model in models:
                print(f"   - {model['name']}")
            
            # Test actual completion
            print("\n🧪 Testing completion...")
            response = requests.post(
                'http://localhost:11434/v1/chat/completions',
                json={
                    'model': 'qwen2.5:0.5b',
                    'messages': [{'role': 'user', 'content': 'Say hi'}]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0]['message']['content']
                    print(f"✅ Ollama working! Response: {content}")
                    return True
            
            print("⚠️  Completion failed")
            return False
        else:
            print(f"❌ Ollama returned status {response.status_code}")
            return False
            
    except ImportError:
        print("❌ requests library not installed")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama not running on localhost:11434")
        print("   Start it with: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print_header("🔍 Qoder Integration Tester")
    
    results = {
        'CLI': test_qoder_cli(),
        'HTTP': test_qoder_http(),
        'Ollama': test_ollama_fallback()
    }
    
    print_header("SUMMARY")
    print(f"Qoder CLI:     {'✅ Working' if results['CLI'] else '❌ Not available'}")
    print(f"Qoder HTTP:    {'✅ Working' if results['HTTP'] else '❌ Not available'}")
    print(f"Ollama Fallback: {'✅ Working' if results['Ollama'] else '❌ Not available'}")
    
    working_methods = sum(results.values())
    total_methods = len(results)
    
    print(f"\nWorking methods: {working_methods}/{total_methods}")
    
    if working_methods == 0:
        print("\n⚠️  No methods working! Bridge will use file-based fallback.")
        print("\n💡 Recommendations:")
        print("   1. Make sure Qoder IDE is running")
        print("   2. Check if Qoder has CLI tools installed")
        print("   3. Verify Ollama is running: ollama serve")
        print("   4. Use file-based communication as manual workaround")
    elif working_methods == 1:
        print("\n✅ At least one method working! Bridge should function.")
    else:
        print("\n🎉 Multiple methods working! Bridge will use best available.")
    
    print("\n📝 Next step:")
    print("   Run: ./start_super_picoclaw.sh")
    print("   Then chat with @Lara_R_bot on Telegram")
    
    return 0 if working_methods > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
