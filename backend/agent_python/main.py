"""
🎙️ Rizik Voice Agent (Provider Switch)
Supports:
- Google Gemini native realtime audio
- SiliconFlow Qwen Omni via OpenAI-compatible realtime API
"""

import asyncio
import json
import logging
import os
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins.google import beta
from livekit.plugins import openai as openai_plugin
from livekit.plugins.openai import realtime as openai_realtime
from livekit.plugins import silero

# Load environment variables
load_dotenv(dotenv_path=".env")
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rizik-voice-agent")

DEFAULT_PROVIDER = "google"
GOOGLE_MODEL = "gemini-2.5-flash-native-audio-latest"
SILICONFLOW_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Instruct"
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"
SILICONFLOW_VOICE = "alloy"
SILICONFLOW_STT_MODEL = "FunAudioLLM/SenseVoiceSmall"
SILICONFLOW_TTS_MODEL = "FunAudioLLM/CosyVoice2-0.5B"
SILICONFLOW_TTS_VOICE = "FunAudioLLM/CosyVoice2-0.5B:alex"

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


def _build_model():
    provider = (os.getenv("VOICE_AI_PROVIDER") or DEFAULT_PROVIDER).strip().lower()

    if provider in {"siliconflow", "qwen", "qwen-omni"}:
        api_key = os.getenv("SILICONFLOW_API_KEY")
        if not api_key:
            raise RuntimeError(
                "SILICONFLOW_API_KEY missing while VOICE_AI_PROVIDER=siliconflow."
            )

        model_name = os.getenv("SILICONFLOW_MODEL", SILICONFLOW_MODEL)
        base_url = os.getenv("SILICONFLOW_BASE_URL", SILICONFLOW_BASE_URL)
        mode = (os.getenv("SILICONFLOW_VOICE_MODE") or "pipeline").strip().lower()

        logger.info("🧠 Provider: SiliconFlow (Qwen Omni)")
        logger.info("🧠 Model: %s", model_name)
        logger.info("🧠 Base URL: %s", base_url)

        # SiliconFlow does not expose an OpenAI-Realtime compatible /v1/realtime endpoint
        # (tested: 404). So we use a practical voice pipeline:
        # STT (/audio/transcriptions) + LLM (/chat/completions) + TTS (/audio/speech).
        if mode in {"pipeline", "stt-llm-tts"}:
            stt_model = os.getenv("SILICONFLOW_STT_MODEL", SILICONFLOW_STT_MODEL)
            tts_model = os.getenv("SILICONFLOW_TTS_MODEL", SILICONFLOW_TTS_MODEL)
            tts_voice = os.getenv("SILICONFLOW_TTS_VOICE", SILICONFLOW_TTS_VOICE)

            stt = openai_plugin.STT(
                model=stt_model,
                api_key=api_key,
                base_url=base_url,
                language="bn",
                detect_language=True,
            )
            llm = openai_plugin.LLM(
                model=model_name,
                api_key=api_key,
                base_url=base_url,
                temperature=0,
            )
            tts = openai_plugin.TTS(
                model=tts_model,
                voice=tts_voice,
                api_key=api_key,
                base_url=base_url,
            )

            return "siliconflow", {"stt": stt, "llm": llm, "tts": tts}

        # Experimental: OpenAI-Realtime style (likely not supported by SiliconFlow, keep for future)
        voice = os.getenv("SILICONFLOW_VOICE", SILICONFLOW_VOICE)
        model = openai_realtime.RealtimeModel(
            model=model_name,
            api_key=api_key,
            base_url=base_url,
            voice=voice,
            modalities=["text", "audio"],
        )
        return "siliconflow", model

    # Default: Google Gemini native audio
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY/GEMINI_API_KEY not set in .env")

    model_name = os.getenv("GOOGLE_REALTIME_MODEL", GOOGLE_MODEL)
    voice = os.getenv("GOOGLE_REALTIME_VOICE", "Puck")

    logger.info("🧠 Provider: Google Gemini")
    logger.info("🧠 Model: %s", model_name)

    model = beta.realtime.RealtimeModel(
        model=model_name,
        api_key=api_key,
        voice=voice,
        instructions=BENGALI_SYSTEM_PROMPT,
    )
    return "google", model

async def entrypoint(ctx: JobContext):
    logger.info("🚀 Starting Rizik Voice Agent job")
    logger.info("🏠 Room: %s", getattr(ctx.room, "name", "<unknown>"))
    
    # Connect
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    try:
        provider, model = _build_model()
    except Exception as exc:
        logger.error("❌ Model init failed: %s", exc)
        return

    if isinstance(model, dict) and {"stt", "llm", "tts"}.issubset(set(model.keys())):
        # SiliconFlow STT is non-streaming. Add VAD so Agents can segment user speech
        # and call STT on complete utterances.
        vad = silero.VAD.load(sample_rate=16000, force_cpu=True)
        session = AgentSession(vad=vad, stt=model["stt"], llm=model["llm"], tts=model["tts"])
    else:
        session = AgentSession(llm=model)
    rizik_agent = Agent(instructions=BENGALI_SYSTEM_PROMPT)

    @session.on("user_speech_committed")
    def on_user_speech_committed(msg):
        logger.info(f"🗣️ User: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "stt_result", "text": msg.content}),
            topic="chat"
        ))

    @session.on("agent_speech_committed")
    def on_agent_speech_committed(msg):
        logger.info(f"🤖 AI: {msg.content}")
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({
                "type": "ai_response",
                "text": msg.content,
                "provider": provider,
            }),
            topic="chat"
        ))

    logger.info("🎙️ Starting audio session...")
    try:
        await session.start(rizik_agent, room=ctx.room)
    except Exception as exc:
        logger.error("❌ Session start failed (%s): %s", provider, exc)
        return

    logger.info("✅ Voice Agent active - listening! provider=%s", provider)

    # Keep alive
    await asyncio.Event().wait()

if __name__ == "__main__":
    # Default to an ephemeral port to avoid clashes on dev machines.
    # LiveKit Agents exposes a local HTTP server for health checks; the port doesn't
    # affect room connectivity/dispatch.
    http_port = int(os.getenv("LK_WORKER_HTTP_PORT", "0"))
    # IMPORTANT: Our backend dispatch uses LIVEKIT_AGENT_NAME. If the worker registers with
    # an empty agent_name, explicit dispatch won't target this worker.
    agent_name = (os.getenv("LIVEKIT_AGENT_NAME") or "").strip()
    if agent_name:
        cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, port=http_port, agent_name=agent_name))
    else:
        cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, port=http_port))
