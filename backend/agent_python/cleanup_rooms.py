import os
import asyncio
from dotenv import load_dotenv
from livekit import api

load_dotenv()

async def delete_rooms():
    livekit_url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    lkapi = api.LiveKitAPI(livekit_url, api_key, api_secret)
    
    print("🔍 Listing rooms...")
    results = await lkapi.room.list_rooms(api.ListRoomsRequest())
    
    if not results.rooms:
        print("✅ No active rooms found.")
    else:
        for room in results.rooms:
            print(f"🗑️ Deleting room: {room.name} (SID: {room.sid})")
            await lkapi.room.delete_room(api.DeleteRoomRequest(room=room.name))
            print("   Deleted.")
            
    await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(delete_rooms())
