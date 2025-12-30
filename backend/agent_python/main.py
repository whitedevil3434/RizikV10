import asyncio
import logging
import os
import json
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins import openai, silero
from livekit import rtc
from edge_tts_plugin import EdgeTTSPlugin
from memory_service import get_user_memory, save_memory_async, build_memory_prompt
from knowledge_service import init_knowledge_base, build_rag_context
from bengali_nlp import clean_transcript, extract_keywords, build_whisper_glossary, normalize_unicode
from noise_filter import NoiseFilter

# Load environment variables
load_dotenv(dotenv_path=".env")
load_dotenv()

logging.basicConfig(level=logging.INFO)
logging.getLogger("livekit.plugins.silero").setLevel(logging.DEBUG)
logging.getLogger("livekit.agents").setLevel(logging.DEBUG) # Deep dive logging
logger = logging.getLogger("rizik-agent")

# Initialize knowledge base on module load
try:
    init_knowledge_base()
    logger.info("🧠 Knowledge base initialized")
except Exception as e:
    logger.warning(f"Knowledge base init skipped: {e}")

BENGALI_SYSTEM_PROMPT = """তুমি রিজিক, একটি বন্ধুত্বপূর্ণ বাংলা Voice AI।

স্টাইল:
- তুমি একটি Conversational Voice Assistant। কথা বলার মতো উত্তর দাও।
- সর্বোচ্চ ১-২ বাক্যে উত্তর দাও। ছোট রাখো।
- শুধু যখন ইউজার বলে "বিস্তারিত বলো" বা "আরও জানতে চাই" তখনই বড় উত্তর দাও।
- "হ্যালো", "হেলো", "হলো" সব মানে Hello।

STT Context:
- Speech-to-Text এ ভুল transcription হতে পারে। Context বুঝে respond করো।
- ভাঙা কথা শুনলে সবচেয়ে সম্ভাব্য অর্থ ধরে নাও।
"""

async def entrypoint(ctx: JobContext):
    # Connect
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # 🧠 Extract user ID from room name (e.g., "rizik-room-1234" -> "1234")
    room_name = ctx.room.name if ctx.room else "unknown"
    user_id = room_name.split("-")[-1] if room_name else "default_user"
    logger.info(f"👤 User ID: {user_id}")
    
    # 🧠 Fetch past memory (async, with timeout - won't block if fails)
    past_memory = await get_user_memory(user_id)
    if past_memory:
        logger.info(f"📚 Memory loaded: {past_memory[:100]}...")
    
    # 🧠 Build dynamic system prompt with memory
    system_prompt = build_memory_prompt(past_memory)

    # VAD: Bengali-Optimized (Tuned for "Sleeping Agent" fix)
    # - Threshold decreased via library defaults (usually 0.5 is fine, but we boost patience)
    # - min_speech: Reduced to 100ms (catch immediate "hi/hello")
    # - min_silence: Increased to 1.0s (Wait longer before cutting off)
    vad = silero.VAD.load(
        min_speech_duration=0.1,      # 100ms - Catch fast "Ki khobor"
        min_silence_duration=1.0,     # 1000ms - More patience for "thinking users"
        prefix_padding_duration=0.5,  # 500ms - Robust pre-buffer
    )
    
    # Noise Cancellation (Enabled)
    # Using our custom NoiseFilter wrapper
    noise_filter = NoiseFilter()
    
    # STT: Whisper V3 (Base Model for Stability)
    stt = openai.STT(
        model="whisper-large-v3", 
        language="bn",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
        prompt=(
            "কথপোকথনের ভাষা বাংলা। "
            "Keywords: অর্ডার, পেমেন্ট, বিকাশ, নগদ, হেল্প। "
            "Output in Bengali script only."
        ),
    )
    
    # 🩹 Unicode Fixer & Transcript Forwarder
    # Intercept STT events effectively
    original_push = stt.stream
    # Note: Can't easily override .stream, so we handle normalization in event loop if possible
    # For now, relying on LLM to handle slight unicode glitches, 
    # but we will normalize BEFORE logging and memory saving.

    # LLM: Llama 3.1 8B Instant (Rate limit safe)
    model = openai.LLM(
        model="llama-3.1-8b-instant",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.7, # Creativity for conversation
    )
    
    # TTS: Edge (Bengali)
    tts = EdgeTTSPlugin(voice="bn-BD-PradeepNeural")

    # 🔥 Smart Context Pruning (Apex Advisor - Token Saver)
    async def before_llm_cb(agent, chat_ctx):
        # লিমিট চেক: যদি ৭টির বেশি মেসেজ জমে যায়
        if len(chat_ctx.messages) > 7:
            logger.info("✂️ Smart Pruning: Keeping Identity + Recent Context")
            
            # ১. সিস্টেম প্রম্পট (প্রথম মেসেজ) আলাদা করুন
            system_prompt = chat_ctx.messages[0]
            
            # ২. শেষের ৬টি মেসেজ (৩ user + ৩ agent)
            recent_messages = chat_ctx.messages[-6:]
            
            # ৩. নতুন করে মেমোরি সাজান
            chat_ctx.messages = [system_prompt] + recent_messages
            
        return chat_ctx

    # Session (Note: before_llm_cb not supported in AgentSession, using chat_ctx in Agent instead)
    session = AgentSession(
        vad=vad,
        stt=stt,
        llm=model,
        tts=tts,
    )
    
    # Define Agent logic (with dynamic memory-injected prompt)
    rizik_agent = Agent(
        instructions=system_prompt,  # 🧠 Uses dynamic prompt with memory
    )

    @session.on("user_speech_started")
    def on_user_speech_started():
        logger.info("🎤 VAD: Speech Detected (Listening...)")

    @session.on("user_speech_committed")
    def on_user_speech_committed(msg):
        logger.info(f"🗣️ User: {msg.content}")
        conversation_log.append(f"User: {msg.content}")
        
        # 🔥 Broadcast to Flutter (STT)
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "stt_result", "text": msg.content}),
            topic="chat"
        ))

    @session.on("agent_speech_committed")
    def on_agent_speech_committed(msg):
        logger.info(f"🤖 Agent: {msg.content}")
        conversation_log.append(f"Rizik: {msg.content}")
        
        # 🔥 Broadcast to Flutter (AI Response)
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "ai_response", "text": msg.content}),
            topic="chat"
        ))
        
        # 🧠 Auto-save memory every 4 exchanges (2 user + 2 agent turns)
        if len(conversation_log) >= 4:
            summary = " | ".join(conversation_log[-4:])  # Last 4 messages
            save_memory_async(user_id, summary)
            logger.info(f"💾 Memory saved: {summary[:50]}...")

    # 🧠 Conversation log for memory
    conversation_log = []

    # Start Agent
    await session.start(rizik_agent, room=ctx.room)

    # Welcome Message (personalized if memory exists)
    await asyncio.sleep(1.0)
    if past_memory:
        await session.say("স্বাগতম ফিরে! কী নিয়ে কথা বলব?", allow_interruptions=True)
    else:
        await session.say("হ্যালো! আমি রিজিক।", allow_interruptions=True)

    # Keep alive
    await asyncio.Event().wait()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
