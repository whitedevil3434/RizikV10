"""
🔊 Edge TTS Plugin for Rizik Free Tier
Microsoft Edge TTS - FREE, High Quality Bengali voices
Cost: $0 (unlimited usage)

Bengali Voices Available:
- bn-BD-NabanitaNeural (Female) - Recommended
- bn-BD-PradeepNeural (Male)
"""

import asyncio
import logging
import tempfile
import os
from typing import Optional, AsyncGenerator
import edge_tts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rizik-edge-tts")

# Default Bengali voice
DEFAULT_VOICE = "bn-BD-NabanitaNeural"

# Voice mapping for different personas
VOICE_MAP = {
    "female": "bn-BD-NabanitaNeural",
    "male": "bn-BD-PradeepNeural",
    "default": "bn-BD-NabanitaNeural",
}


class EdgeTTSPlugin:
    """
    Edge TTS Plugin for converting text to speech.
    Perfect for Free tier users - no API costs!
    """
    
    def __init__(self, voice: str = DEFAULT_VOICE, rate: str = "+0%", pitch: str = "+0Hz"):
        """
        Initialize Edge TTS Plugin.
        
        Args:
            voice: Voice name (default: Bengali female)
            rate: Speaking rate (e.g., "+10%", "-5%")
            pitch: Voice pitch (e.g., "+5Hz", "-2Hz")
        """
        self.voice = voice
        self.rate = rate
        self.pitch = pitch
        
    async def synthesize(self, text: str) -> bytes:
        """
        Convert text to speech audio bytes.
        
        Args:
            text: Text to convert to speech
            
        Returns:
            Audio bytes (MP3 format)
        """
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=self.voice,
                rate=self.rate,
                pitch=self.pitch,
            )
            
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            
            logger.info(f"🔊 TTS generated: {len(audio_data)} bytes for '{text[:30]}...'")
            return audio_data
            
        except Exception as e:
            logger.error(f"❌ TTS error: {e}")
            raise
    
    async def synthesize_to_file(self, text: str, output_path: Optional[str] = None) -> str:
        """
        Convert text to speech and save to file.
        
        Args:
            text: Text to convert to speech
            output_path: Output file path (optional, will create temp file)
            
        Returns:
            Path to the audio file
        """
        if output_path is None:
            fd, output_path = tempfile.mkstemp(suffix=".mp3")
            os.close(fd)
        
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=self.voice,
                rate=self.rate,
                pitch=self.pitch,
            )
            
            await communicate.save(output_path)
            logger.info(f"🔊 TTS saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ TTS file error: {e}")
            raise

    async def stream_audio(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Stream audio chunks for real-time playback.
        
        Args:
            text: Text to convert to speech
            
        Yields:
            Audio chunks (bytes)
        """
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=self.voice,
                rate=self.rate,
                pitch=self.pitch,
            )
            
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
                    
        except Exception as e:
            logger.error(f"❌ TTS stream error: {e}")
            raise


async def list_bengali_voices():
    """List all available Bengali voices."""
    voices = await edge_tts.list_voices()
    bengali_voices = [v for v in voices if v["Locale"].startswith("bn-")]
    
    print("\n🇧🇩 Available Bengali Voices:")
    print("-" * 50)
    for v in bengali_voices:
        print(f"  {v['ShortName']}: {v['Gender']}")
    print("-" * 50)
    
    return bengali_voices


# ═══════════════════════════════════════════════════════════════════
# LiveKit Integration Helper
# ═══════════════════════════════════════════════════════════════════

class LiveKitTTSHandler:
    """
    Handles TTS requests from LiveKit data channel.
    Listens for 'tts_request' messages and plays audio back.
    """
    
    def __init__(self, room, voice: str = DEFAULT_VOICE):
        self.room = room
        self.tts = EdgeTTSPlugin(voice=voice)
        self._running = False
        
    async def start(self):
        """Start listening for TTS requests."""
        self._running = True
        logger.info("🎧 TTS Handler started")
        
    async def handle_tts_request(self, text: str):
        """
        Handle a TTS request - generate and publish audio.
        
        Args:
            text: Text to convert to speech
        """
        try:
            # Generate audio
            audio_data = await self.tts.synthesize(text)
            
            # Publish audio to room
            # Note: In production, you'd publish this as an audio track
            # For now, we send the audio data via data channel
            await self.room.local_participant.publish_data(
                audio_data,
                topic="tts_audio",
                reliable=True,
            )
            
            logger.info(f"📤 TTS audio published: {len(audio_data)} bytes")
            
        except Exception as e:
            logger.error(f"❌ TTS handler error: {e}")
            
    def stop(self):
        """Stop the TTS handler."""
        self._running = False
        logger.info("🛑 TTS Handler stopped")


# ═══════════════════════════════════════════════════════════════════
# Test
# ═══════════════════════════════════════════════════════════════════

async def test_tts():
    """Test Edge TTS with Bengali text."""
    tts = EdgeTTSPlugin()
    
    test_texts = [
        "স্বাগতম রিজিকে! আপনাকে কিভাবে সাহায্য করতে পারি?",
        "আপনার অর্ডার নিশ্চিত হয়েছে। ধন্যবাদ!",
        "একটু অপেক্ষা করুন, আমি চেক করছি।",
    ]
    
    print("\n🧪 Testing Edge TTS...")
    print("-" * 50)
    
    for text in test_texts:
        audio = await tts.synthesize(text)
        print(f"✅ '{text[:30]}...' → {len(audio)} bytes")
    
    # List available voices
    await list_bengali_voices()


if __name__ == "__main__":
    asyncio.run(test_tts())
