import asyncio
import os
import logging
from livekit import api, rtc
from dotenv import load_dotenv
import wave

load_dotenv()
load_dotenv(".env.local")

URL = "wss://rizik-zwpijcjw.livekit.cloud"
API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def main():
    token = api.AccessToken(API_KEY, API_SECRET) \
        .with_identity("python-debug-sender") \
        .with_name("Python Debug Sender") \
        .with_grants(api.VideoGrants(room_join=True, room="debug-room")) \
        .to_jwt()

    room = rtc.Room()
    
    @room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        print(f"👤 Participant connected: {participant.identity}")

    print(f"🔗 Connecting to {URL}...")
    await room.connect(URL, token)
    print(f"✅ Connected to Room 'debug-room'!")

    # Audio Source
    source = rtc.AudioSource(48000, 1)
    track = rtc.LocalAudioTrack.create_audio_track("test_mic", source)
    
    # Publish
    await room.local_participant.publish_track(track)
    print("🎤 Published 'test_mic' track")

    # Read Wav and Send
    wf = wave.open("test_audio.wav", "rb")
    print(f"🎵 Sending Audio: {wf.getnframes()} frames")
    
    sample_rate = wf.getframerate()
    buffer_duration = 0.02  # 20ms
    frames_per_buffer = int(sample_rate * buffer_duration)

    while True:
        data = wf.readframes(frames_per_buffer)
        if len(data) == 0:
            wf.rewind() # Loop forever
            continue
            
        # Create Frame
        # Data is 16-bit PCM.
        frame = rtc.AudioFrame(
            data=data,
            sample_rate=sample_rate,
            num_channels=1,
            samples_per_channel=len(data)//2 # 2 bytes per sample
        )
        await source.capture_frame(frame)
        await asyncio.sleep(buffer_duration)

if __name__ == "__main__":
    logging.basicConfig(level=logging.ERROR) # Quiet logging
    asyncio.run(main())
