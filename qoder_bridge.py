#!/usr/bin/env python3
"""
Qoder AI Bridge - Allows PicoClaw to use Qoder AI as an LLM provider
This creates a local API endpoint that PicoClaw can call.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import subprocess
import tempfile

# Configuration
PORT = 8765
DEBUG = False

class QoderBridgeHandler(BaseHTTPRequestHandler):
    """HTTP handler for Qoder AI bridge requests"""
    
    def do_POST(self):
        """Handle POST requests (LLM completions)"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            if DEBUG:
                print(f"📥 Received request: {json.dumps(data, indent=2)}")
            
            # Parse request
            messages = data.get('messages', [])
            model = data.get('model', 'qoder-auto')
            stream = data.get('stream', False)
            
            # Extract conversation
            prompt = self._format_messages(messages)
            
            if DEBUG:
                print(f"💬 Prompt: {prompt[:200]}...")
            
            # Call Qoder AI (via script or direct integration)
            response_text = self._call_qoder_ai(prompt, model)
            
            if DEBUG:
                print(f"💭 Response: {response_text[:200]}...")
            
            # Format response in OpenAI-compatible format
            response = {
                "id": f"chatcmpl-qoder-{os.urandom(8).hex()}",
                "object": "chat.completion",
                "created": int(os.path.getmtime(__file__)),
                "model": "qoder-ai",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": response_text
                        },
                        "finish_reason": "stop"
                    }
                ],
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(response_text.split()),
                    "total_tokens": len(prompt.split()) + len(response_text.split())
                }
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self._send_error(str(e))
    
    def do_GET(self):
        """Handle GET requests (health check, models list)"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self._send_health()
        elif parsed_path.path == '/v1/models':
            self._send_models()
        else:
            self.send_error(404)
    
    def _format_messages(self, messages):
        """Convert OpenAI message format to simple prompt"""
        formatted = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'system':
                formatted.append(f"System: {content}")
            elif role == 'user':
                formatted.append(f"User: {content}")
            elif role == 'assistant':
                formatted.append(f"Assistant: {content}")
        return "\n".join(formatted)
    
    def _call_qoder_ai(self, prompt, model):
        """
        Call Qoder AI to process the prompt
        Integration with actual Qoder IDE AI assistant
        """
        
        # Method 1: Try Qoder CLI first (if available in PATH)
        try:
            import subprocess
            result = subprocess.run(
                ['qoder', 'ask', '--json', prompt],
                capture_output=True,
                text=True,
                timeout=120  # Give Qoder time to think
            )
            
            if result.returncode == 0:
                # Parse JSON response from Qoder
                try:
                    response_data = json.loads(result.stdout)
                    if 'answer' in response_data:
                        return response_data['answer']
                    elif 'response' in response_data:
                        return response_data['response']
                    else:
                        return result.stdout
                except json.JSONDecodeError:
                    # Not JSON, return raw output
                    return result.stdout.strip()
            else:
                print(f"⚠️  Qoder CLI failed: {result.stderr}")
        except FileNotFoundError:
            print("ℹ️  Qoder CLI not found in PATH")
        except subprocess.TimeoutExpired:
            print("⚠️  Qoder CLI timed out")
        except Exception as e:
            print(f"⚠️  Qoder CLI error: {e}")
        
        # Method 2: Try Qoder HTTP API (if running)
        try:
            import requests
            qoder_api_urls = [
                'http://localhost:9999/api/ask',  # Common Qoder API port
                'http://localhost:8080/api/chat',  # Alternative
                'http://127.0.0.1:3000/ask',      # Another common port
            ]
            
            for api_url in qoder_api_urls:
                try:
                    response = requests.post(
                        api_url,
                        json={
                            'prompt': prompt,
                            'model': model,
                            'stream': False
                        },
                        timeout=60
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        # Try common response field names
                        for field in ['answer', 'response', 'content', 'text', 'message']:
                            if field in data:
                                return data[field]
                        # Fallback to full response
                        return str(data)
                except requests.exceptions.ConnectionError:
                    continue  # Try next URL
                except Exception as e:
                    print(f"⚠️  Qoder API ({api_url}) error: {e}")
                    continue
                    
        except ImportError:
            print("ℹ️  requests library not available")
        except Exception as e:
            print(f"⚠️  Qoder API error: {e}")
        
        # Method 3: File-based communication (fallback)
        # This allows manual or script-based Qoder integration
        try:
            temp_file = f"/tmp/qoder_request_{os.getpid()}.txt"
            response_file = f"/tmp/qoder_response_{os.getpid()}.txt"
            
            # Write request to file
            with open(temp_file, 'w') as f:
                json.dump({
                    'prompt': prompt,
                    'model': model,
                    'timestamp': os.path.getmtime(__file__)
                }, f)
            
            print(f"📝 Request written to: {temp_file}")
            print(f"   Waiting for response at: {response_file}")
            
            # Wait for response file (with timeout)
            import time
            start_time = time.time()
            timeout = 120  # 2 minutes
            
            while not os.path.exists(response_file):
                if time.time() - start_time > timeout:
                    print(f"⚠️  Response timeout after {timeout}s")
                    break
                time.sleep(1)
            
            # Read response if it exists
            if os.path.exists(response_file):
                with open(response_file, 'r') as f:
                    response_text = f.read().strip()
                
                # Cleanup
                try:
                    os.remove(temp_file)
                    os.remove(response_file)
                except:
                    pass
                
                return response_text
            else:
                print("⚠️  No response file found")
                
        except Exception as e:
            print(f"⚠️  File-based communication error: {e}")
        
        # Method 4: Ultimate fallback to Ollama/Qwen2.5
        print("💡 Falling back to Qwen2.5 via Ollama...")
        try:
            import requests
            response = requests.post(
                'http://localhost:11434/v1/chat/completions',
                json={
                    'model': 'qwen2.5:0.5b',
                    'messages': [{'role': 'user', 'content': prompt}]
                },
                timeout=30
            )
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            return "[Fallback] Qwen2.5 response unavailable"
        except Exception as fallback_error:
            return f"[Error] All methods failed. Last error: {str(fallback_error)}"
    
    def _send_health(self):
        """Send health check response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {
            "status": "healthy",
            "service": "qoder-bridge",
            "port": PORT,
            "models": ["qoder-auto", "qwen2.5-fallback"]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def _send_models(self):
        """Send available models list"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {
            "data": [
                {
                    "id": "qoder-auto",
                    "name": "Qoder AI Assistant",
                    "context_window": 128000,
                    "max_tokens": 8192
                },
                {
                    "id": "qwen2.5-fallback",
                    "name": "Qwen2.5 0.5B (Fallback)",
                    "context_window": 32768,
                    "max_tokens": 8192
                }
            ]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def _send_error(self, message):
        """Send error response"""
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {"error": message}
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log format"""
        if DEBUG:
            print(f"📝 {args[0]}")


def run_server():
    """Start the Qoder Bridge server"""
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, QoderBridgeHandler)
    
    print(f"🌉 Qoder Bridge starting on port {PORT}...")
    print(f"   Local URL: http://127.0.0.1:{PORT}")
    print(f"   Health: http://127.0.0.1:{PORT}/health")
    print(f"   Models: http://127.0.0.1:{PORT}/v1/models")
    print(f"   Completions: POST http://127.0.0.1:{PORT}/v1/chat/completions")
    print(f"\nPress Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Qoder Bridge stopped")
        httpd.shutdown()


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--debug':
        DEBUG = True
        print("🔍 Debug mode enabled")
    
    run_server()
