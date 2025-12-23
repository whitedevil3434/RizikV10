import asyncio
import websockets
import json
import ssl

async def test_agent():
    uri = "wss://rizik-backend.its-sabbir69.workers.dev/api/voice/session"
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

            # 3. Listen for response loop
            print("👂 Listening for response stream...")
            while True:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    if data.get("type") == "text_stream":
                        print(f"Token: {data.get('content')}")
                except asyncio.TimeoutError:
                    print("✅ Stream finished (Timeout).")
                    break
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent())
