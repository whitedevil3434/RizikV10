import os
import asyncio
from livekit import api
from dotenv import load_dotenv

load_dotenv()

async def main():
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")

    print(f"Testing connection to: {url}")
    print(f"API Key: {key[:5]}...")

    lkapi = api.LiveKitAPI(url, key, secret)
    
    try:
        rooms = await lkapi.room.list_rooms(api.ListRoomsRequest())
        print("\n✅ Connection Successful!")
        print(f"Active Rooms: {len(rooms.rooms)}")
        for room in rooms.rooms:
            print(f"- {room.name} ({room.sid}) - Participants: {room.num_participants}")
            
    except Exception as e:
        print(f"\n❌ Connection Failed: {e}")
    
    await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(main())
