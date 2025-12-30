import os
import asyncio
import logging
from livekit import api
from dotenv import load_dotenv

load_dotenv()

async def inspect():
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")

    print(f"🔍 Inspecting LiveKit Project: {url}")
    lkapi = api.LiveKitAPI(url, key, secret)

    try:
        # 1. List Rooms
        rooms = await lkapi.room.list_rooms(api.ListRoomsRequest())
        print(f"\n🏠 Active Rooms: {len(rooms.rooms)}")

        for room in rooms.rooms:
            print(f"\n------------------------------------------------")
            print(f"Room: {room.name} | SID: {room.sid}")
            print(f"Status: {room.creation_time} | Participants: {room.num_participants}")
            
            # 2. List Participants
            participants = await lkapi.room.list_participants(api.ListParticipantsRequest(room=room.name))
            
            agent_found = False
            user_found = False
            
            for p in participants.participants:
                print(f"  👤 Participant: {p.identity} ({p.name}) | State: {p.state}")
                if p.kind == api.ParticipantInfo.Kind.AGENT:
                    print("     🤖 TYPE: AGENT")
                    agent_found = True
                else:
                    print("     👤 TYPE: USER/CLIENT")
                    user_found = True

                # 3. List Tracks
                for track in p.tracks:
                    print(f"     Qw Track: {track.sid} | Type: {track.type} | Muted: {track.muted}")
            
            print(f"------------------------------------------------")
            if not agent_found:
                print("❌ WARNING: No AGENT found in this room! Python script is not connected.")
            else:
                print("✅ Agent is CONNECTED.")
                
    except Exception as e:
        print(f"❌ Error: {e}")
    
    await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(inspect())
