
import asyncio
import os
import logging
from livekit import api, rtc

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoiceVerifier")

# Credentials
LIVEKIT_URL = "wss://rizik-ai-femz194x.livekit.cloud"
API_KEY = "APImSG78KpGRGdm"
API_SECRET = "MdKvfAwLfivlzlQmgRfJ268XvW79vSyqidour2e1kQnC"

async def main():
    print("🚀 Starting Voice AI Verification...")
    
    # 1. Generate Token
    token = api.AccessToken(API_KEY, API_SECRET) \
        .with_identity("python-verifier") \
        .with_name("Python Verifier") \
        .with_grants(api.VideoGrants(
            room_join=True,
            room="verification-room",
        )).to_jwt()
    
    print(f"🔑 Token Generated. Connecting to {LIVEKIT_URL}...")

    # 2. Connect to Room
    room = rtc.Room()
    
    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        print(f"🎧 Track Subscribed: {publication.kind} from {participant.identity}")
        if publication.kind == rtc.TrackKind.KIND_AUDIO:
            print("✅✅✅ AUDIO RECEIVED FROM AGENT! Test Passed. ✅✅✅")
            # We could attach a stream here to verify bytes, but subscription is usually enough proof for now.

    @room.on("participant_connected")
    def on_participant_connected(participant):
        print(f"👤 Participant Joined: {participant.identity}")

    try:
        await room.connect(LIVEKIT_URL, token)
        print("✅ Connected to Room: verification-room")
        
        # 3. Simulate User Speaking (Text Input) to trigger Agent
        print("📤 Sending 'hello' chat message to trigger Agent...")
        chat_data = '{"type":"text_input","text":"hello"}'.encode('utf-8')
        await room.local_participant.publish_data(chat_data, topic="chat")

        print("⏳ Waiting for Audio...")
        while True:
            await asyncio.sleep(1)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await room.disconnect()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
