from aiohttp import web
from livekit import api
import os
from dotenv import load_dotenv
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("token-server")

# Load Env
load_dotenv(dotenv_path=".env.local")
load_dotenv()

API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def handle_token(request):
    try:
        data = await request.json()
        room = data.get("room", "rizik-room")
        participant = data.get("participant", "user-local")
        
        logger.info(f"🔑 Generating token for User: {participant}, Room: {room}")
        
        token = api.AccessToken(API_KEY, API_SECRET) \
            .with_identity(participant) \
            .with_name(participant) \
            .with_grants(api.VideoGrants(room_join=True, room=room)) \
            .to_jwt()
            
        return web.json_response({"token": token})
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return web.json_response({"error": str(e)}, status=500)

async def check_health(request):
    return web.json_response({"status": "ok"})

app = web.Application()
app.add_routes([
    web.post('/api/livekit/token', handle_token),
    web.get('/', check_health)
])

if __name__ == '__main__':
    print("🚀 Local Token Server running on http://0.0.0.0:3000")
    web.run_app(app, port=3000)
