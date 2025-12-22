import asyncio
import websockets
import json
import ssl

async def test_agent():
    uri = "ws://127.0.0.1:8789/api/agent/voice"
    print(f"🔌 Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected!")
            
            # 1. Send Text
            msg = json.dumps({"type": "text_input", "text": "Hello from Python Test Script"})
            print(f"out > {msg}")
            await websocket.send(msg)
            
            # 2. Send Dummy Audio (1 second of silence)
            # PCM 16-bit, 16kHz, 1 channel = 32000 bytes
            dummy_audio = bytes([0] * 3200) 
            print(f"out > [Binary Audio: {len(dummy_audio)} bytes]")
            await websocket.send(dummy_audio)

            # 3. Listen for response
            print("👂 Listening for response (5s timeout)...")
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"in < {response}")
            except asyncio.TimeoutError:
                print("❌ No response received within 5 seconds.")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent())
