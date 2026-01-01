"""
🎙️ Rizik Hybrid Voice Agent
Tier-based routing: Premium = Native Audio, Free = Text + Edge TTS
Cost-optimized for 5,000+ users
"""

import asyncio
import json
import logging
import os
from typing import Optional
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins.google import beta

# Load environment variables
load_dotenv(dotenv_path=".env")
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rizik-hybrid")

# Models
NATIVE_AUDIO_MODEL = "gemini-2.5-flash-native-audio-latest"

BENGALI_SYSTEM_PROMPT = """তুমি রিজিক, একটি বন্ধুত্বপূর্ণ বাংলা Voice AI।

স্টাইল:
- তুমি একটি Conversational Voice Assistant। কথা বলার মতো উত্তর দাও।
- সর্বোচ্চ ১-২ বাক্যে উত্তর দাও। ছোট রাখো।
- শুধু যখন ইউজার বলে "বিস্তারিত বলো" তখনই বড় উত্তর দাও।

ভাষা:
- INPUT: বাংলা, English, Banglish (Mixed) সব বোঝো।
- OUTPUT: সর্বদা শুদ্ধ বাংলায় উত্তর দাও।

Context:
- রিজিক অ্যাপ: ফুড ডেলিভারি, রাইড শেয়ারিং, পার্সেল।
- "Amar khide" = আমার খিদে = খাবার লাগবে।
- "Gari lagbe" = গাড়ি লাগবে = রাইড চাই।
"""

# Free tier prompt - text only output
FREE_TIER_PROMPT = """তুমি রিজিক, একটি বন্ধুত্বপূর্ণ বাংলা AI।

স্টাইল:
- সর্বোচ্চ ১-২ বাক্যে উত্তর দাও।
- ছোট, সংক্ষিপ্ত উত্তর।

ভাষা:
- INPUT: বাংলা, English, Banglish সব বোঝো।
- OUTPUT: শুদ্ধ বাংলায় TEXT উত্তর দাও। Audio generate করো না।

Context:
- রিজিক অ্যাপ: ফুড, রাইড, পার্সেল সার্ভিস।
"""


def get_user_tier_from_room(room_name: str) -> str:
    """
    Extract user tier from room metadata or name.
    Room naming convention: {user_id}_{tier}_{timestamp}
    Example: user123_premium_1704067200
    """
    # Room name pattern: user_tier_timestamp
    parts = room_name.split("_")
    if len(parts) >= 2:
        tier = parts[1].lower()
        if tier in ["premium", "pro", "paid"]:
            return "premium"
    
    # Default to free tier
    return "free"


async def get_user_profile(room_name: str) -> dict:
    """
    Fetch user profile from Rizik backend.
    In production, this would call your API.
    """
    tier = get_user_tier_from_room(room_name)
    
    return {
        "user_id": room_name.split("_")[0] if "_" in room_name else room_name,
        "tier": tier,
        "is_premium": tier == "premium",
        "human_ai_minutes": 100 if tier == "premium" else 10,
        "standard_ai_minutes": 500 if tier == "premium" else 100,
    }


async def entrypoint(ctx: JobContext):
    """
    Hybrid entrypoint: Routes to Premium or Free flow based on user tier.
    """
    logger.info("🚀 Starting Rizik Hybrid Voice Agent")
    
    # Connect
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Get API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        logger.error("❌ GOOGLE_API_KEY not set in .env")
        return
    
    # Get user profile and tier
    user_profile = await get_user_profile(ctx.room.name)
    is_premium = user_profile["is_premium"]
    
    logger.info(f"👤 User: {user_profile['user_id']}, Tier: {user_profile['tier']}")
    logger.info(f"💎 Premium: {is_premium}")
    
    if is_premium:
        # ═══════════════════════════════════════════════════════════════════
        # 💎 PREMIUM FLOW: Full Native Audio (Audio In → Audio Out)
        # Cost: Higher, but user is paying
        # ═══════════════════════════════════════════════════════════════════
        logger.info("💎 Premium Mode: Native Audio-to-Audio")
        
        model = beta.realtime.RealtimeModel(
            model=NATIVE_AUDIO_MODEL,
            api_key=api_key,
            voice="Puck",  # High quality voice
            instructions=BENGALI_SYSTEM_PROMPT,
        )
        
        session = AgentSession(llm=model)
        rizik_agent = Agent(instructions=BENGALI_SYSTEM_PROMPT)
        
    else:
        # ═══════════════════════════════════════════════════════════════════
        # 🆓 FREE FLOW: Audio In → Text Out → Edge TTS
        # Cost: Very low (only input audio tokens + free Edge TTS)
        # ═══════════════════════════════════════════════════════════════════
        logger.info("🆓 Free Mode: Audio In → Text Out → Edge TTS")
        
        # Gemini understands audio input but outputs TEXT only
        model = beta.realtime.RealtimeModel(
            model=NATIVE_AUDIO_MODEL,
            api_key=api_key,
            instructions=FREE_TIER_PROMPT,
            # Note: The model still accepts audio input for understanding
            # but we'll handle TTS separately via Edge TTS
        )
        
        session = AgentSession(llm=model)
        rizik_agent = Agent(instructions=FREE_TIER_PROMPT)
    
    # ═══════════════════════════════════════════════════════════════════
    # Event Handlers (Common for both tiers)
    # ═══════════════════════════════════════════════════════════════════
    
    @session.on("user_speech_committed") 
    def on_user_speech_committed(msg):
        """User finished speaking - Gemini transcribes for us"""
        logger.info(f"🗣️ User: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "stt_result", "text": msg.content}),
            topic="chat"
        ))

    @session.on("agent_speech_committed")
    def on_agent_speech_committed(msg):
        """Agent response - text transcript"""
        logger.info(f"🤖 AI: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({
                "type": "ai_response", 
                "text": msg.content,
                "tier": user_profile["tier"],
            }),
            topic="chat"
        ))
        
        # 🆓 Free tier: Trigger Edge TTS for audio playback
        if not is_premium:
            asyncio.create_task(trigger_edge_tts(ctx, msg.content))

    # Start Agent
    logger.info("🎙️ Starting voice session...")
    await session.start(rizik_agent, room=ctx.room)
    
    tier_emoji = "💎" if is_premium else "🆓"
    logger.info(f"{tier_emoji} Agent active - listening!")

    # Keep alive
    await asyncio.Event().wait()


async def trigger_edge_tts(ctx: JobContext, text: str):
    """
    Trigger Edge TTS for free tier users.
    This sends a message to a separate TTS service or handles it inline.
    """
    try:
        # Option 1: Publish TTS request for a separate TTS worker
        await ctx.room.local_participant.publish_data(
            json.dumps({
                "type": "tts_request",
                "text": text,
                "voice": "bn-BD-NabanitaNeural",  # Bengali female voice
            }),
            topic="tts"
        )
        logger.info(f"📢 TTS request sent: {text[:50]}...")
    except Exception as e:
        logger.error(f"❌ TTS error: {e}")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
