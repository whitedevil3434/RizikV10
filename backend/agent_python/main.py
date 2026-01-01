"""
🎙️ Rizik Gemini 2.5 Flash Native Audio Agent
True Audio-to-Audio: No separate STT/TTS needed!
Uses Gemini Live API via LiveKit RealtimeModel
"""

import asyncio
import json
import logging
import os
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins.google import beta

# Load environment variables
load_dotenv(dotenv_path=".env")
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rizik-gemini-native")

# Gemini 2.5 Flash Native Audio Model (TESTED WORKING!)
MODEL = "gemini-2.5-flash-native-audio-latest"

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

async def entrypoint(ctx: JobContext):
    logger.info("🚀 Starting Rizik Gemini 2.5 Flash Native Audio Agent")
    
    # Connect
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Get API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        logger.error("❌ GOOGLE_API_KEY not set in .env")
        return
    
    logger.info(f"✅ API Key loaded, using model: {MODEL}")
    
    # 💎 Gemini Native Audio - True Audio-to-Audio!
    # No STT, No TTS - Gemini handles everything
    model = beta.realtime.RealtimeModel(
        model=MODEL,
        api_key=api_key,
        voice="Puck",  # Available: Puck, Charon, Kore, Fenrir, Aoede
        instructions=BENGALI_SYSTEM_PROMPT,
    )
    
    # AgentSession with just the RealtimeModel (no stt, no tts!)
    session = AgentSession(llm=model)
    
    # Define Agent
    rizik_agent = Agent(instructions=BENGALI_SYSTEM_PROMPT)

    @session.on("user_speech_committed") 
    def on_user_speech_committed(msg):
        # Gemini provides transcripts even in audio mode
        logger.info(f"🗣️ User: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "stt_result", "text": msg.content}),
            topic="chat"
        ))

    @session.on("agent_speech_committed")
    def on_agent_speech_committed(msg):
        logger.info(f"🤖 Gemini: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "ai_response", "text": msg.content}),
            topic="chat"
        ))

    # Start Agent
    logger.info("🎙️ Starting audio-to-audio session...")
    await session.start(rizik_agent, room=ctx.room)
    
    logger.info("✅ Gemini Native Audio Agent active - listening!")

    # Keep alive
    await asyncio.Event().wait()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
