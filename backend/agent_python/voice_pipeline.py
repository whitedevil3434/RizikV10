"""
🎤 Rizik Voice Pipeline - Custom STT using Groq Whisper
Ported from VoiceAgent.ts _processAudioBuffer logic
Simplified for LiveKit Agents 1.3+ API
"""

import io
import struct
import logging
from dataclasses import dataclass

import aiohttp
from livekit.agents import stt

logger = logging.getLogger("rizik-stt")


@dataclass
class AudioBuffer:
    """Simple audio buffer container."""
    data: bytes
    sample_rate: int = 16000
    num_channels: int = 1


class RizikVoicePipeline(stt.STT):
    """
    Custom Speech-to-Text using Groq Whisper Large V3.
    Optimized for Bengali language with garbage detection.
    """

    def __init__(
        self,
        api_key: str,
        language: str = "bn",
        model: str = "whisper-large-v3",
    ):
        super().__init__(
            capabilities=stt.STTCapabilities(streaming=False, interim_results=False)
        )
        self._api_key = api_key
        self._language = language
        self._model = model
        self._api_url = "https://api.groq.com/openai/v1/audio/transcriptions"
        
        # Bengali priming prompt
        self._prompt = "এটি একটি বাংলা কথোপকথন। হ্যালো রিজিক, আমি ভালো আছি, তুমি কেমন আছো, ধন্যবাদ"
        
        # Hallucination filter
        self._hallucinations = [
            'you', 'thank you', 'thanks', 'subtitle', 'subtitles',
            'audio', 'copyright', 'mojon', 'mbc', 'okay', 'bye',
            'tou', 'mikia', 'mate', 'paouna', 'shhh'
        ]

    def _create_wav_header(self, data_length: int, sample_rate: int = 16000, channels: int = 1, bits: int = 16) -> bytes:
        """Create WAV header for PCM audio data."""
        block_align = channels * bits // 8
        byte_rate = sample_rate * block_align
        
        header = struct.pack(
            '<4sI4s4sIHHIIHH4sI',
            b'RIFF',
            36 + data_length,
            b'WAVE',
            b'fmt ',
            16,  # Subchunk1Size
            1,   # AudioFormat (PCM)
            channels,
            sample_rate,
            byte_rate,
            block_align,
            bits,
            b'data',
            data_length,
        )
        return header

    def _validate_bengali(self, text: str) -> bool:
        """
        Enterprise-grade Bengali validation.
        Returns True if text is valid Bengali, False if garbage.
        """
        if not text or len(text) < 3:
            return False
        
        # Check for replacement characters
        if '�' in text or text.count('?') > 3:
            logger.warning(f"🗑️ Replacement chars detected: {text}")
            return False
        
        # Check Bengali character ratio
        bengali_chars = len([c for c in text if '\u0980' <= c <= '\u09FF'])
        total_chars = len(text.replace(' ', ''))
        
        if total_chars == 0:
            return False
        
        bengali_ratio = bengali_chars / total_chars
        if bengali_ratio < 0.5:
            logger.warning(f"🗑️ Low Bengali ratio ({bengali_ratio:.2f}): {text}")
            return False
        
        # Check for hallucinations
        text_lower = text.lower()
        for h in self._hallucinations:
            if h in text_lower and len(text) < 20:
                logger.warning(f"🗑️ Hallucination detected: {text}")
                return False
        
        return True

    async def _recognize_impl(
        self,
        buffer: "livekit.rtc.AudioFrame",
        *,
        language: str | None = None,
    ) -> stt.SpeechEvent:
        """
        Transcribe audio buffer using Groq Whisper.
        """
        # Get PCM data from frame
        pcm_data = buffer.data.tobytes() if hasattr(buffer.data, 'tobytes') else bytes(buffer.data)
        
        # Create WAV file
        wav_header = self._create_wav_header(len(pcm_data))
        wav_data = wav_header + pcm_data

        # Prepare form data
        form = aiohttp.FormData()
        form.add_field(
            'file',
            io.BytesIO(wav_data),
            filename='audio.wav',
            content_type='audio/wav'
        )
        form.add_field('model', self._model)
        form.add_field('language', language or self._language)
        form.add_field('prompt', self._prompt)
        form.add_field('response_format', 'verbose_json')

        # Call Groq API
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self._api_url,
                headers={'Authorization': f'Bearer {self._api_key}'},
                data=form,
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"❌ Groq STT Error: {error_text}")
                    return stt.SpeechEvent(
                        type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                        alternatives=[],
                    )

                result = await response.json()
                text = result.get('text', '').strip()

        logger.info(f"🎤 Raw STT: {text}")

        # Validate Bengali
        if not self._validate_bengali(text):
            # Return fallback
            return stt.SpeechEvent(
                type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                alternatives=[
                    stt.SpeechData(
                        text="(শুনতে পাইনি)",
                        language=self._language,
                    )
                ],
            )

        # Valid transcription
        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[
                stt.SpeechData(
                    text=text,
                    language=self._language,
                    confidence=0.95,
                )
            ],
        )
