
import { Ai } from '@cloudflare/ai';

export async function process_voice_command(
    ai: any, // Cloudflare AI Binding
    input: ArrayBuffer | string // Audio Blob OR Text String
) {
    console.log("[VoiceAgent] Processing Input...");

    let userText = "";

    if (typeof input === 'string') {
        // Direct Text Input (Tap-to-Edit)
        userText = input;
        console.log(`[VoiceAgent] Received Text Input: "${userText}"`);
    } else {
        // Audio Input -> Whisper
        console.log("[VoiceAgent] Processing Audio Input...");
        const sttResponse = await ai.run('@cf/openai/whisper', {
            audio: [...new Uint8Array(input)]
        });
        userText = sttResponse.text;
        console.log(`[VoiceAgent] Transcribed: "${userText}"`);
    }

    if (!userText || userText.trim().length === 0) {
        throw new Error("Could not understand input.");
    }

    // 2. LLM Processing (Llama 3)
    // Model: @cf/meta/llama-3-8b-instruct
    const systemPrompt = `You are Rizik Co-Pilot, a helpful assistant for the Rizik Super App. 
    Keep your answers concise (under 2 sentences). 
    You help with: Rides, Food, Parcel, and Squad Management.`;

    const llmResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText }
        ]
    });

    const aiResponseText = llmResponse.response;
    console.log(`[VoiceAgent] AI Response: "${aiResponseText}"`);

    // 3. Text to Speech (Server-Side)
    // We use a public TTS endpoint (Google Translate hack) as a fallback.
    // LIMITATION: It fails if text is too long (>100-200 chars).
    // FIX: Truncate text for TTS only (keep full text for UI).

    // Take first 100 chars or first sentence to avoid 400/500 errors
    const ttsText = aiResponseText.length > 100
        ? aiResponseText.substring(0, 100) + "..."
        : aiResponseText;

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText)}&tl=en&client=tw-ob`;

    console.log(`[VoiceAgent] Generating TTS from: ${ttsUrl}`);

    let audioBuffer: ArrayBuffer;
    try {
        const ttsResponse = await fetch(ttsUrl, {
            headers: {
                "Referer": "http://translate.google.com/",
                "User-Agent": "stagefright/1.2 (Linux;Android 5.0)"
            }
        });

        if (!ttsResponse.ok) {
            console.error(`[VoiceAgent] TTS Failed: ${ttsResponse.statusText}`);
            // Fallback: Return empty audio (silent failure) but keep text
            audioBuffer = new ArrayBuffer(0);
        } else {
            audioBuffer = await ttsResponse.arrayBuffer();
        }
    } catch (e) {
        console.error(`[VoiceAgent] TTS Exception: ${e}`);
        audioBuffer = new ArrayBuffer(0);
    }

    return {
        transcript: userText,
        response: aiResponseText,
        audio: audioBuffer
    };
}
