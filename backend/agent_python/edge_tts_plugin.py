"""
🗣️ Edge TTS Plugin for LiveKit Agents v1.3+
Custom Bengali TTS using Microsoft Edge TTS service.
Uses LiveKit's built-in AudioStreamDecoder for MP3 decoding.
"""

import asyncio
import logging
import uuid
import edge_tts
from livekit import rtc
from livekit.agents import tts, APIConnectOptions
from livekit.agents.utils.codecs import AudioStreamDecoder

logger = logging.getLogger("rizik-tts")


class EdgeTTSPlugin(tts.TTS):
    """
    Text-to-Speech using Microsoft Edge TTS.
    Compatible with LiveKit Agents v1.3+
    """

    def __init__(
        self,
        voice: str = "bn-BD-PradeepNeural",
        rate: str = "+0%",
        pitch: str = "+0Hz",
    ):
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=24000,
            num_channels=1,
        )
        self._voice = voice
        self._rate = rate
        self._pitch = pitch

    def synthesize(self, text: str, *, conn_options: APIConnectOptions = None) -> "EdgeTTSChunkedStream":
        return EdgeTTSChunkedStream(
            tts=self,
            text=text,
            voice=self._voice,
            rate=self._rate,
            pitch=self._pitch,
            conn_options=conn_options or APIConnectOptions(),
        )


class EdgeTTSChunkedStream(tts.ChunkedStream):
    def __init__(self, tts: tts.TTS, text: str, voice: str, rate: str, pitch: str, conn_options: APIConnectOptions = None):
        super().__init__(tts=tts, input_text=text, conn_options=conn_options or APIConnectOptions())
        self._text = text
        self._voice = voice
        self._rate = rate
        self._pitch = pitch
        self._request_id = str(uuid.uuid4())

    async def _run(self, output_emitter) -> None:
        """
        Called by base class with AudioEmitter.
        Uses LiveKit's built-in AudioStreamDecoder for MP3 decoding.
        """
        logger.info(f"🎤 TTS _run started for text: {self._text[:30]}...")
        try:
            # 1. Initialize the emitter (CRITICAL for v1.3+)
            logger.info("🔧 Initializing output_emitter...")
            output_emitter.initialize(
                request_id=self._request_id,
                sample_rate=24000,
                num_channels=1,
                mime_type="audio/pcm",
            )
            logger.info("✅ Emitter initialized")
            
            # 2. Create decoder for MP3 -> PCM conversion
            logger.info("🔧 Creating AudioStreamDecoder...")
            decoder = AudioStreamDecoder(
                sample_rate=24000,
                num_channels=1,
                format="mp3",
            )
            logger.info("✅ Decoder created")
            
            # 3. Synthesize with Edge TTS and push to decoder
            logger.info(f"🔧 Starting Edge TTS synthesis: voice={self._voice}")
            communicate = edge_tts.Communicate(
                text=self._text,
                voice=self._voice,
                rate=self._rate,
                pitch=self._pitch,
            )

            chunk_count = 0
            async def push_audio():
                nonlocal chunk_count
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        decoder.push(chunk["data"])
                        chunk_count += 1
                decoder.end_input()
                logger.info(f"✅ Pushed {chunk_count} audio chunks to decoder")
            
            # Start pushing audio in background
            push_task = asyncio.create_task(push_audio())
            
            # 4. Read decoded frames and push to emitter
            frame_count = 0
            async for frame in decoder:
                output_emitter.push(frame.data.tobytes())
                frame_count += 1
            
            await push_task
            await decoder.aclose()
            logger.info(f"✅ TTS completed: {frame_count} frames pushed to output")
                
        except Exception as e:
            logger.error(f"❌ TTS Error: {e}")
            import traceback
            traceback.print_exc()

