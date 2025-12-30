
import { DurableObject } from "cloudflare:workers";

interface Env {
  AI: any;
  GROQ_API_KEY?: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CALLS_APP_ID: string;
  AI_MODEL_NAME: string;          // Primary LLM model (from wrangler.toml)
  AI_MODEL_FALLBACK: string;      // Fallback model (from wrangler.toml)
}

export class VoiceAgent extends DurableObject {
  env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");

    console.log(`🔍 VoiceAgent.fetch: ${request.method} ${url.pathname}`);
    console.log(`🔍 Upgrade header: "${upgradeHeader}"`);

    // 1. WebSocket Upgrade - Check FIRST (case-insensitive)
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      console.log("✅ WebSocket Upgrade detected - creating connection...");
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      console.log("✅ WebSocket accepted, returning 101");
      return new Response(null, { status: 101, webSocket: client });
    }


    // 4. TTS Config (with Sec-MS-GEC token)
    if (url.pathname.endsWith("/config")) {
      console.log("📋 Returning TTS Config...");
      return this._getTTSConfig();
    }

    console.log("⚠️ No matching route, returning default response");
    return new Response("Rizik Voice Brain Active", { status: 200 });
  }

  async _getTTSConfig() {
    const secMsGec = await this._generateSecMsGec();
    const config = {
      wss_url: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
      trusted_client_token: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
      sec_ms_gec: secMsGec,
      voice_config: {
        default_voice: "bn-BD-PradeepNeural",
        fallback_voice: "en-US-ChristopherNeural",
        rate: "+0%",
        pitch: "+0Hz"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        "Sec-MS-GEC": secMsGec,
        "Sec-MS-GEC-Version": "1-130.0.2849.68"
      }
    };
    return new Response(JSON.stringify(config), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  async _generateSecMsGec(): Promise<string> {
    const WIN_EPOCH = 11644473600;
    const S_TO_NS = 1e9;
    let ticks = Math.floor(Date.now() / 1000);
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks = ticks * (S_TO_NS / 100);
    const salt = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    const strToHash = `${Math.floor(ticks)}${salt}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(strToHash));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  }


  /**
   * 🔌 Called when WebSocket connection opens
   */
  async webSocketOpen(ws: WebSocket) {
    console.log("🔌 WebSocket Opened!");
    // Send immediate ping to verify connection works
    ws.send(JSON.stringify({
      type: 'ping',
      message: 'Rizik Brain Connected!'
    }));
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Handle Binary Audio (Voice)
    if (message instanceof ArrayBuffer) {
      console.log(`🎤 Received Audio Chunk: ${message.byteLength} bytes`);
      this._handleAudioChunk(message, ws);
      return;
    }

    // Handle JSON Text
    try {
      const data = JSON.parse(message as string);
      console.log(`📨 Parsed Message Type: ${data.type}`);

      if (data.type === 'ready') {
        // Client is fully ready - send test greeting
        console.log("🎯 Client Ready - Triggering Test AI...");
        await this._sendTestGreeting(ws);
      } else if (data.type === 'text_input') {
        // User typed or STT result
        await this._streamBrainResponse(data.text, ws);
      }
    } catch (e) {
      console.error("❌ WebSocket Message Error:", e);
    }
  }

  // VAD Constants
  // VAD Constants
  readonly GAIN = 1.0; // No server-side gain (client has autoGain:true)
  readonly VAD_THRESHOLD = 0.04; // Tuned: User speech is ~0.05-0.08 RMS
  readonly SILENCE_DURATION_MS = 1500;
  readonly MAX_RECORDING_MS = 15000;

  // VAD State
  isSpeaking: boolean = false;
  isAgentSpeaking: boolean = false; // Lockout Flag
  silenceStart: number | null = null;
  lastPacketTime: number = 0;

  // Audio Buffering State
  audioBuffer: number[] = [];

  // 🧠 Conversation History (Persistent Context)
  conversationHistory: { role: string, content: string }[] = [];

  async _handleAudioChunk(chunk: ArrayBuffer, ws: WebSocket) {
    // NO BYTE-SWAP - Use audio directly (little-endian is correct)
    const originalData = new Int16Array(chunk);
    const amplifiedData = new Int16Array(originalData.length);

    let sumSquares = 0;
    for (let i = 0; i < originalData.length; i++) {
      // Apply Gain & Clamp
      let val = originalData[i] * this.GAIN;
      if (val > 32767) val = 32767;
      else if (val < -32768) val = -32768;

      amplifiedData[i] = val;

      // RMS Calc
      const normalizedVal = val / 32768.0;
      sumSquares += normalizedVal * normalizedVal;
    }

    const rms = Math.sqrt(sumSquares / amplifiedData.length);

    // 3. Dynamic VAD (Smart Barge-In)
    // If Agent Speaking: Threshold = 0.4 (Must yell to interrupt).
    // If Silent: Use VAD_THRESHOLD (tuned for sensitivity).
    const effectiveThreshold = this.isAgentSpeaking ? 0.4 : this.VAD_THRESHOLD;
    const isLoud = rms > effectiveThreshold;

    // 🔥 CRITICAL FIX: Only buffer audio when SPEAKING (not silence)
    // This prevents sending noise/silence to Whisper
    if (isLoud || this.isSpeaking) {
      const bytes = new Uint8Array(amplifiedData.buffer);
      for (let i = 0; i < bytes.length; i++) {
        this.audioBuffer.push(bytes[i]);
      }
    }

    // VERBOSE LOGGING + CLIENT DEBUG
    if (Math.random() < 0.2) {
      ws.send(JSON.stringify({
        type: 'debug_info',
        rms: rms.toFixed(4),
        isLoud: isLoud,
        isSpeaking: this.isSpeaking
      }));
    }

    // 4. VAD Logic
    const now = Date.now();
    this.lastPacketTime = now;

    if (isLoud) {
      if (!this.isSpeaking) {
        console.log(`🗣️ Speech Started (VAD) - RMS:${rms.toFixed(3)} > ${effectiveThreshold}`);
        this.isSpeaking = true;
        this.silenceStart = null;

        // 🔥 INTERRUPT SIGNAL
        if (this.isAgentSpeaking) {
          console.log("🛑 BARGE-IN DETECTED! Aborting LLM...");
          ws.send(JSON.stringify({ type: 'interrupt' }));
          this.abortController?.abort(); // Stop LLM
          this.isAgentSpeaking = false;
          this.audioBuffer = []; // Clear pending audio
        }
      }
    } else {
      // Silence Logic (unchanged)
      if (this.isSpeaking) {
        if (!this.silenceStart) {
          this.silenceStart = Date.now();
        } else if (Date.now() - this.silenceStart > this.SILENCE_DURATION_MS) {
          this.isSpeaking = false;
          this.silenceStart = null;
          console.log("🤫 VAD END");
          await this._processAudioBuffer(ws);
        }
      }
    }
    // 4. Force Cut (Max Duration)
    // 16kHz 16bit mono = 32 bytes/ms
    if (this.audioBuffer.length > (32 * this.MAX_RECORDING_MS)) {
      console.log("⚠️ Max Duration Reached -> Processing Buffer");
      await this._processAudioBuffer(ws);
      this.isSpeaking = false;
      this.silenceStart = null;
    }
  }

  async _processAudioBuffer(ws: WebSocket) {
    if (this.audioBuffer.length === 0) return;

    try {
      const audioData = new Uint8Array(this.audioBuffer);
      this.audioBuffer = []; // Clear immediately

      // BENCHMARK START
      const tStart = performance.now();

      console.log(`🧠 Invoking Whisper (${audioData.length} bytes)...`);

      // 1. Create WAV Header to inform Whisper of format (16kHz Mono PCM)
      const wavHeader = this._createWavHeader(audioData.length, 16000, 1, 16);
      const wavFile = new Uint8Array(wavHeader.length + audioData.length);
      wavFile.set(wavHeader);
      wavFile.set(audioData, wavHeader.length);

      // 🚀 GROQ Whisper Large V3 (More Accurate for Bengali - NOT Turbo)
      const formData = new FormData();
      const wavBlob = new Blob([wavFile], { type: 'audio/wav' });
      formData.append('file', wavBlob, 'audio.wav');
      formData.append('model', 'whisper-large-v3'); // NOT turbo - better accuracy
      formData.append('language', 'bn');
      formData.append('response_format', 'verbose_json'); // Get confidence scores
      formData.append('prompt', 'এটি একটি বাংলা কথোপকথন। হ্যালো রিজিক, আমি ভালো আছি, তুমি কেমন আছো, ধন্যবাদ');

      // 🔍 AUDIO DIAGNOSTICS
      const audioDurationSec = audioData.length / 2 / 16000;
      const audioStats = {
        totalBytes: wavFile.length,
        audioDuration: audioDurationSec.toFixed(2) + 's',
        firstBytes: Array.from(wavFile.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ')
      };
      console.log(`📊 Audio Diagnostics: ${JSON.stringify(audioStats)}`);

      // Skip if audio is too short (< 0.5 seconds)
      if (audioDurationSec < 0.5) {
        console.log(`⚠️ Audio too short (${audioDurationSec}s), skipping STT`);
        return;
      }

      const sttResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!sttResponse.ok) {
        const errorText = await sttResponse.text();
        console.error(`❌ Groq STT Error (${sttResponse.status}): ${errorText}`);
        return;
      }

      const response = await sttResponse.json() as { text?: string };

      // BENCHMARK END
      const tEnd = performance.now();
      const latency = (tEnd - tStart).toFixed(2);

      const text = (response.text || "").trim();

      // RAW LOG
      console.log(`🧠 Groq Whisper RAW: ${JSON.stringify(response)}`);
      console.log(`🗣️ Transcribed: "${text}" (Latency: ${latency}ms)`);

      // 🔍 ENTERPRISE-GRADE STT VALIDATION
      const hasReplacementChars = text.includes('�') || text.includes('?');
      const hasBrokenBengali = /[ি|ু|ে|ৃ|ো|ৌ](?![অ-হড়ঢ়য়ৰৱ])/.test(text); // Orphan vowel marks
      const bengaliCharCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
      const totalCharCount = text.replace(/\s/g, '').length;
      const bengaliRatio = totalCharCount > 0 ? bengaliCharCount / totalCharCount : 0;

      // Garbage detection
      const isGarbage = hasReplacementChars || hasBrokenBengali || bengaliRatio < 0.5;

      const hallucinations = [
        'you', 'thank you', 'thanks', 'subtitle', 'subtitles',
        'audio', 'copyright', 'mojon', 'mbc', 'okay', 'bye',
        'tou', 'mikia', 'mate', 'paouna', 'shhh'
      ];

      const isHallucination =
        text.length < 3 ||
        hallucinations.some(h => text.toLowerCase().includes(h) && text.length < 20);

      if (isGarbage) {
        console.log(`🗑️ STT Garbage Detected (BengaliRatio: ${bengaliRatio.toFixed(2)}): "${text}"`);
        // 🔍 DEBUG: Send raw STT to client for analysis
        ws.send(JSON.stringify({
          type: 'debug_log',
          message: `RAW STT: "${text}" | BN Ratio: ${bengaliRatio.toFixed(2)} | Broken: ${hasBrokenBengali}`
        }));
        // Send fallback response in Bengali
        ws.send(JSON.stringify({
          type: 'stt_result',
          text: '(শুনতে পাইনি)'
        }));
        ws.send(JSON.stringify({
          type: 'ai_response',
          text: 'দুঃখিত, আমি ঠিকমতো শুনতে পাইনি। আবার বলুন?'
        }));
      } else if (text.length > 0 && !isHallucination) {
        // 🔥 SEND TRANSCRIPT TO CLIENT (Visual Confirmation)
        ws.send(JSON.stringify({
          type: 'stt_result',
          text: text
        }));

        // Feed to LLM
        await this._streamBrainResponse(text, ws);
      } else {
        console.log(`⚠️ Ignored Hallucination/Noise: "${text}"`);
      }

    } catch (e: any) {
      console.error("❌ Whisper Error:", e);
      ws.send(JSON.stringify({ type: 'debug_log', message: `STT Error: ${e.message}` }));
    }
  }

  _createWavHeader(dataLength: number, sampleRate: number, channels: number, bitsPerSample: number): Uint8Array {
    const blockAlign = (channels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataLength, true); // Size
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  }

  /**
   * 🧪 Test Greeting (Confirms full pipeline works)
   */
  async _sendTestGreeting(ws: WebSocket) {
    try {
      const messages = [
        { role: "system", content: "You are Rizik, a helpful AI assistant who speaks Bangla." },
        { role: "user", content: "আমার নাম সাব্বির। তুমি কেমন আছো?" }
      ];

      const llmResponse = await this.env.AI.run(this.env.AI_MODEL_NAME || this.env.AI_MODEL_FALLBACK, {
        messages: messages
      });

      const responseText = llmResponse.response;
      console.log(`🗣️ Rizik Says: ${responseText}`);

      ws.send(JSON.stringify({
        type: 'ai_response',
        text: responseText
      }));
    } catch (error) {
      console.error("❌ Test Greeting Error:", error);
    }
  }

  /**
   * 🧠 Streaming Intelligence (Workers AI)
   */
  // Abort Controller for Barge-In
  abortController: AbortController | null = null;

  /**
   * 🧠 Streaming Intelligence (Groq Llama 4 Scout)
   */
  async _streamBrainResponse(input: string, ws: WebSocket) {
    this.isAgentSpeaking = true; // 🔒 LOCK EARS
    this.abortController = new AbortController();

    try {
      // 🏢 ENTERPRISE-GRADE Bengali System Prompt
      const systemMessage = {
        role: 'system',
        content: `তুমি রিজিক (Rizik), একজন বাংলা ভয়েস অ্যাসিস্ট্যান্ট।

কঠোর নিয়ম:
১. সবসময় শুধু বাংলায় উত্তর দাও। ইংরেজি একদম না।
২. উত্তর ছোট রাখো - সর্বোচ্চ ১-২ বাক্য।
৩. স্বাভাবিক কথোপকথনের মতো বলো।
৪. যদি না বোঝো, বাংলায় জিজ্ঞেস করো।

উদাহরণ উত্তর:
- "হ্যালো! আমি ভালো আছি, তুমি কেমন?"
- "আমি তোমাকে সাহায্য করতে পারি।"
- "দুঃখিত, আমি ঠিক বুঝতে পারিনি।"`
      };

      // Limit history to last 10 turns (20 messages)
      const recentHistory = this.conversationHistory.slice(-20);

      const messages = [
        systemMessage,
        ...recentHistory,
        { role: 'user', content: input }
      ];

      // Save user input to history
      this.conversationHistory.push({ role: 'user', content: input });

      // 🚀 GROQ LLM (Llama 3.3 70B - Production Stable)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          stream: true,
          max_tokens: 150, // Keep short for voice
        }),
        signal: this.abortController.signal,
      });

      // Consume the stream (FULL RESPONSE TTS - Bengali requires complete sentences)
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') break;
            try {
              const jsonObj = JSON.parse(jsonStr);
              const token = jsonObj.choices?.[0]?.delta?.content || "";
              if (token) {
                fullResponse += token;
                // Send text_stream for UI typing effect only
                ws.send(JSON.stringify({
                  type: 'text_stream',
                  content: token
                }));
              }
            } catch (e) { }
          }
        }
      }



      // 🔥 FINAL BROADCAST (For UI completion)
      ws.send(JSON.stringify({
        type: 'ai_response',
        text: fullResponse
      }));

      // Save AI response to history
      this.conversationHistory.push({ role: 'assistant', content: fullResponse });

    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log("🛑 LLM Generation Aborted (Barge-In)");
      } else {
        console.error("Brain Error:", e);
        ws.send(JSON.stringify({ type: 'text_stream', content: " দুঃখিত, সার্ভারে সমস্যা হচ্ছে।" }));
      }
    } finally {
      this.abortController = null;
      setTimeout(() => {
        this.isAgentSpeaking = false;
        console.log("👂 Ears Unlocked (Turn End)");
      }, 500); // 0.5s buffer
    }
  }
}
