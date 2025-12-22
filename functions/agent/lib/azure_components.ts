import { Env } from "../../agent/voice_agent";
import { createWavHeader, fetchAzureTTS } from "./azure";

/**
 * Custom Component Interface mirroring RealtimeKit SDK
 */
export interface AgentComponent {
    name: string;
    process(input: any, context: any): Promise<any>;
}

/**
 * Azure STT Component (Custom Implementation)
 * Note: Uses Cloudflare Whisper for speed via Workers AI, mimicking Azure interface
 */
export class AzureSTT implements AgentComponent {
    name = "AzureSTT";
    private env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    async process(audioChunk: Uint8Array): Promise<string | null> {
        try {
            // 1. Prepare WAV (16kHz)
            const wavHeader = createWavHeader(audioChunk.length, 16000, 1, 16);
            const wavFile = new Uint8Array(wavHeader.length + audioChunk.length);
            wavFile.set(wavHeader);
            wavFile.set(audioChunk, wavHeader.length);

            // Convert to Base64 (Required for Whisper Turbo)
            const base64Audio = uint8ArrayToBase64(wavFile);

            // Using Whisper Turbo via Workers AI
            const response = await this.env.AI.run('@cf/openai/whisper-large-v3-turbo', {
                audio: base64Audio,
                language: 'bn'
            });

            const transcript = response.text || "";
            // Move filtering to the Agent level to allow logging "what was heard"
            return transcript;

        } catch (e) {
            console.error("AzureSTT Failed:", e);
            throw e;
        }
    }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Azure TTS Component (Custom Implementation)
 */
export class AzureTTS implements AgentComponent {
    name = "AzureTTS";
    private env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    async process(text: string): Promise<ArrayBuffer | null> {
        if (!this.env.AZURE_SPEECH_KEY) return null;
        try {
            return await fetchAzureTTS(text, this.env.AZURE_SPEECH_KEY, this.env.AZURE_REGION || "centralindia");
        } catch (e) {
            console.error("AzureTTS Gen Failed:", e);
            return null;
        }
    }
}
