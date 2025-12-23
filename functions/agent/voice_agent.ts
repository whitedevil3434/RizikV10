import { RealtimeAgent } from '@cloudflare/realtime-agents';
import { AdaptiveVAD } from './lib/vad';
import { AzureSTT, AzureTTS } from './lib/azure_components';

export interface Env {
    AI: any;
    MEETING_ROOM: DurableObjectNamespace;
    RIZIK_STORAGE: R2Bucket;
    GEMINI_API_KEY: string;
    AZURE_SPEECH_KEY?: string;
    AZURE_REGION?: string;
}

/**
 * 🎙️ VoiceAgentV2 (Realtime SDK Edition)
 * Hosted on Cloudflare Workers + Durable Objects.
 */
export class VoiceAgentV2 extends RealtimeAgent<Env> {

    // Components
    private vad = new AdaptiveVAD();
    private stt: AzureSTT;
    private tts: AzureTTS;

    // State
    private audioChunkBuffer: number[] = [];
    private history: { role: string, content: string }[] = [];
    private readonly MAX_HISTORY = 10;
    private chunkCount = 0; // for logging

    constructor(state: DurableObjectState, env: Env) {
        // @ts-ignore
        super(state, env);

        // Initialize Custom Components
        this.stt = new AzureSTT(env);
        this.tts = new AzureTTS(env);
    }

    /**
     * Send Log to Client & Console
     */
    private log(client: WebSocket, message: string) {
        console.log(message);
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'debug_log', message: message }));
        }
    }

    /**
     * SDK Override: Main Message Handler
     */
    async webSocketMessage(client: WebSocket, message: string | ArrayBuffer) {
        try {
            if (typeof message === 'string') {
                await this.handleTextMessage(client, message);
            } else if (message instanceof ArrayBuffer) {
                await this.handleAudioStream(client, message);
            }
        } catch (err) {
            console.error("💥 Pipeline Error:", err);
            client.send(JSON.stringify({ error: "Agent Internal Error" }));
        }
    }

    /**
     * Handle Text Input (or Self-Recursion from STT)
     */
    private async handleTextMessage(client: WebSocket, text: string) {
        this.log(client, `📩 [Text]: "${text.substring(0, 50)}..."`);

        let inputPrompt = text;
        try {
            const json = JSON.parse(text);
            if (json.type === 'text_input') inputPrompt = json.text;
        } catch (e) { }

        // Start Streaming Response
        await this.streamLLMResponse(client, inputPrompt);
    }

    /**
     * Handle Raw Audio Stream (VAD -> Buffer -> STT)
     */
    private readonly MAX_BUFFER_SIZE = 320000; // 10 seconds of audio (16kHz * 2 bytes * 10s)

    /**
     * Handle Raw Audio Stream (VAD -> Buffer -> STT)
     */
    private async handleAudioStream(client: WebSocket, chunkBuffer: ArrayBuffer) {
        const newData = new Uint8Array(chunkBuffer);

        // VAD Process (RMS)
        const int16Data = new Int16Array(newData.buffer, newData.byteOffset, newData.byteLength / 2);

        // 🎚️ SOFTWARE PRE-AMP (Digital Gain) - ADJUSTED
        // Reduced from 50.0 to 3.0 to prevent noise from triggering VAD indefinitely.
        const GAIN = 3.0;
        let sumSquares = 0;

        for (let i = 0; i < int16Data.length; i++) {
            let val = int16Data[i] * GAIN;
            // Hard Clamp to Int16 range
            if (val > 32767) val = 32767;
            if (val < -32768) val = -32768;
            int16Data[i] = val;

            sumSquares += val * val;
        }

        const chunkRMS = Math.sqrt(sumSquares / int16Data.length);

        // Debug Log (Sampled)
        this.chunkCount++;
        if (this.chunkCount % 50 === 0) {
            this.log(client, `🎤 Chunk #${this.chunkCount} | Size: ${newData.length} | RMS: ${chunkRMS.toFixed(2)} | VAD: ${this.vad.isSpeech ? 'YES' : 'NO'}`);
        }

        const isSpeech = this.vad.process(chunkRMS);

        // Safety: If buffer exceeds MAX_BUFFER_SIZE, Force Flush
        const isBufferFull = this.audioChunkBuffer.length > this.MAX_BUFFER_SIZE;

        if (isSpeech && !isBufferFull) {
            // Speech
            for (let i = 0; i < newData.length; i++) { this.audioChunkBuffer.push(newData[i]); }
        } else {
            // Silence OR Buffer Full -> Flush
            if (isBufferFull) {
                this.log(client, "⚠️ Buffer Full (10s). Forcing Flush.");
            } else if (this.audioChunkBuffer.length > 0) {
                this.log(client, `🤫 End of Utterance. Buffer: ${this.audioChunkBuffer.length}. Processing...`);
            }

            if (this.audioChunkBuffer.length > 0) {
                // Ensure sufficient duration (e.g. > 0.5s of audio)
                // 16kHz * 2 bytes * 0.5s = 16000 bytes.
                if (this.audioChunkBuffer.length < 8000) {
                    this.log(client, "⚠️ Discarding short utterance.");
                    this.audioChunkBuffer = [];
                    return;
                }

                const rawAudio = new Uint8Array(this.audioChunkBuffer);
                this.audioChunkBuffer = [];

                // COMPONENT CALL: STT
                this.log(client, `🧩 Invoking AzureSTT...`);
                try {
                    const transcript = await this.stt.process(rawAudio);
                    this.log(client, `🗣️ Raw STT: "${transcript}"`);

                    if (transcript && transcript.trim().length > 0) {
                        // Filter Hallucinations
                        if (['you', 'Thank you.', 'MBC', 'Okay.', 'Subtitles by'].some(t => transcript.includes(t))) {
                            this.log(client, `⚠️ Ignored Hallucination: "${transcript}"`);
                            return;
                        }

                        this.log(client, `✅ Valid STT: "${transcript}"`);
                        client.send(JSON.stringify({ type: "transcript_user", transcript: transcript }));
                        await this.handleTextMessage(client, transcript);
                    } else {
                        this.log(client, `⚠️ STT Empty.`);
                    }
                } catch (e) {
                    this.log(client, `❌ STT Error: ${e}`);
                }
            }
        }
    }

    /**
     * Stream LLM Response -> Parallel TTS Generation
     */
    private async streamLLMResponse(client: WebSocket, prompt: string) {
        this.log(client, "🤖 Thinking...");

        // 1. Update History
        this.history.push({ role: 'user', content: prompt });
        if (this.history.length > this.MAX_HISTORY) this.history.shift(); // Keep window small

        const messages = [
            { role: 'system', content: "You are Rizik. Be concise. Answer in Bengali or English." },
            ...this.history
        ];

        console.log(`🧠 Context: ${this.history.length} msgs`);

        try {
            const stream = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: messages, stream: true });
            let buffer = ""; // Stream Line Buffer
            let sentenceBuffer = ""; // TTS Sentence Buffer
            let fullResponse = ""; // Accumulate for History
            let ttsQueue = Promise.resolve(); // Queue to ensure audio plays in sentence order
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Debug Log for Stream (Commented out to reduce noise)
                // this.log(client, `📦 Stream Chunk: ${chunk}`); 

                const lines = (buffer + chunk).split('\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim().startsWith("data:")) {
                        const jsonStr = line.replace("data: ", "").trim();
                        if (jsonStr === "[DONE]") continue;

                        try {
                            const json = JSON.parse(jsonStr);
                            if (json.response) {
                                const token = json.response;
                                fullResponse += token;

                                // Accumulate logic
                                sentenceBuffer += token;

                                // Smart Sentence Splitting
                                // 1. Split on Punctuation (. ! ? ।)
                                // 2. Split on Comma (,) if buffer is decent size (> 20 chars) - Reduces Latency
                                // 3. Split on length (> 80 chars) AND Space
                                const isFinalPunctuation = token.match(/[.!?।]/);
                                const isComma = token.match(/[,،]/) && sentenceBuffer.length > 20;
                                const isLongAndSpace = sentenceBuffer.length > 80 && token.match(/\s/);
                                const isEmergencyFlush = sentenceBuffer.length > 300;

                                if (isFinalPunctuation || isComma || isLongAndSpace || isEmergencyFlush) {
                                    const sentence = sentenceBuffer.trim();
                                    if (sentence.length > 0) {
                                        this.log(client, `🗣️ TTS Queuing: "${sentence}"`);
                                        ttsQueue = ttsQueue.then(() => this.speakSentence(client, sentence));
                                        sentenceBuffer = "";
                                    }
                                }
                            }
                        } catch (e) {
                            // ignore parse errors for partial lines
                        }
                    }
                }
            }

            // Speak remaining buffer
            if (sentenceBuffer.trim().length > 0) {
                this.log(client, `🗣️ TTS Queuing (Final): "${sentenceBuffer.trim()}"`);
                ttsQueue = ttsQueue.then(() => this.speakSentence(client, sentenceBuffer.trim()));
            }

            // Save Assistant Response to History
            this.history.push({ role: 'assistant', content: fullResponse });

        } catch (e) {
            console.error("Stream Failed:", e);
            this.log(client, `❌ LLM Error: ${e}`);
        }
    }

    /**
     * Generate TTS and Send Audio Chunk
     */
    private async speakSentence(client: WebSocket, text: string) {
        try {
            this.log(client, `🗣️ TTS: "${text}"`);
            const audio = await this.tts.process(text);
            if (audio && client.readyState === WebSocket.OPEN) {
                client.send(audio);
                this.log(client, `📤 TTS Sent: ${audio.byteLength} bytes`);
            } else {
                console.error(`❌ TTS Skipped`);
            }
        } catch (e) {
            console.error("TTS Gen Failed:", e);
        }
    }
}
