/**
 * Voice DNA Analyzer
 * Transcribes audio using Whisper and triggers the DNA extraction pipeline.
 */
import { extractDNA } from "./dnaEngine";
export async function extractVoiceDNA(audioBlob, env) {
    try {
        console.log("🎤 Voice Analyzer: Starting Whisper transcription...");
        // 1. Audio Transcription using Cloudflare AI (OpenAI Whisper)
        const transcription = await env.AI.run("@cf/openai/whisper", {
            audio: [...new Uint8Array(audioBlob)]
        });
        if (!transcription || !transcription.text) {
            throw new Error("Voice transcription failed or returned empty text.");
        }
        console.log(`🎤 Voice Analyzer: Transcription complete (${transcription.text.length} chars). Mapping DNA...`);
        // 2. Pass the transcribed text to the standard DNA extraction engine
        const dnaProfile = await extractDNA(transcription.text, env);
        return {
            success: true,
            transcription: transcription.text,
            dna: dnaProfile
        };
    }
    catch (err) {
        console.error("🎤 Voice Analyzer Error:", err);
        return { success: false, error: err.message };
    }
}
