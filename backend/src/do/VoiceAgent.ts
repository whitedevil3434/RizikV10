
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

    // 2. Create Calls Session
    if (url.pathname.endsWith("/session") && request.method === "POST") {
      console.log("📞 Creating Calls Session...");
      return this._createCallsSession();
    }

    // 3. Negotiate Track (Signaling)
    if (url.pathname.endsWith("/tracks/new") && request.method === "POST") {
      console.log("🎤 Negotiating Track...");
      return this._negotiateTrack(request);
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

  async _createCallsSession() {
    const endpoint = `https://rtc.live.cloudflare.com/v1/apps/${this.env.CALLS_APP_ID}/sessions/new`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      return Response.json(data);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  async _negotiateTrack(request: Request) {
    // 1. Flutter Data Extraction
    const reqBody: any = await request.json();
    const { sessionId, sessionDescription, trackName } = reqBody;

    if (!sessionId || !sessionDescription) {
      return Response.json({ error: "Missing sessionId or sessionDescription" }, { status: 400 });
    }

    // Credentials
    const appId = this.env.CALLS_APP_ID.trim();
    const token = this.env.CLOUDFLARE_API_TOKEN.trim();

    // 2. URL
    const cfUrl = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/${sessionId}/tracks/new`;

    // 3. Prepare Payload (CORRECT SCHEMA)
    // Cloudflare Calls requires 'tracks' array with 'trackName' and 'mid'.
    const payloadString = JSON.stringify({
      sessionDescription: sessionDescription,
      tracks: [{
        trackName: trackName || 'audio', // Use provided name or default
        mid: "0", // Default to first media section
        location: 'local' // Required: 'local' for client-initiated tracks
      }]
    });

    console.log(`📡 [Worker] Sending Payload (Schema Fix): ${payloadString}`);
    console.log(`🔗 URL: ${cfUrl}`);

    try {
      // 🔥 PRODUCTION MODE: Call Cloudflare
      const response = await fetch(cfUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: payloadString,
      });

      const respText = await response.text();

      if (!response.ok) {
        console.error(`❌ [Worker] Cloudflare Rejected: ${respText}`);
        // Attempt to parse detail
        try {
          const details = JSON.parse(respText);
          return new Response(JSON.stringify({
            error: "Cloudflare Error",
            details: details
          }), { status: 400 });
        } catch (e) {
          return new Response(JSON.stringify({
            error: "Cloudflare Error",
            details: respText
          }), { status: 400 });
        }
      }

      // Success - Return Real Answer
      // ✅ WebRTC Successful. Now Trigger the Log Checker for AI.
      // Using 'fire-and-forget' via waitUntil
      // @ts-ignore
      this.ctx.waitUntil(this.processAudioLoop(sessionId));

      return new Response(respText, {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error(`❌ [Worker] Exception: ${err.message}`);
      return new Response(JSON.stringify({
        error: "Fetch Failed",
        details: err.message
      }), { status: 500 });
    }
  }

  async processAudioLoop(sessionId: string) {
    console.log(`🧠 Rizik Brain Activated for Session: ${sessionId}`);
    console.log("🎤 Real-time Audio Pipeline Ready. Waiting for VAD triggers...");

    // DISABLED SIMULATION: Only real voice triggers AI now.
    /*
    try {
      // ... (Simulated Whisper/LLM code removed to avoid confusion) ...
    } catch (error) {
      console.error("❌ Brain Failure:", error);
    }
    */
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
  readonly GAIN = 3.0;
  readonly VAD_THRESHOLD = 0.1; // HIGH Threshold (Noise Gate)
  readonly SILENCE_DURATION_MS = 1500;
  readonly MAX_RECORDING_MS = 15000;

  // VAD State
  isSpeaking: boolean = false;
  isAgentSpeaking: boolean = false; // Lockout Flag
  silenceStart: number | null = null;
  lastPacketTime: number = 0;

  // Audio Buffering State
  audioBuffer: number[] = [];

  async _handleAudioChunk(chunk: ArrayBuffer, ws: WebSocket) {
    // 1. Convert to Int16 for Analysis & Apply Gain
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

    // 2. Append bytes
    const bytes = new Uint8Array(amplifiedData.buffer);
    for (let i = 0; i < bytes.length; i++) {
      this.audioBuffer.push(bytes[i]);
    }

    const rms = Math.sqrt(sumSquares / amplifiedData.length);

    // 3. Dynamic VAD (Smart Barge-In)
    // If Agent Speaking: Threshold = 0.4 (Must yell to interrupt).
    // If Silent: Threshold = 0.05 (Normal sensitivity).
    const effectiveThreshold = this.isAgentSpeaking ? 0.4 : 0.05;
    const isLoud = rms > effectiveThreshold;

    // VERBOSE LOGGING + CLIENT DEBUG
    // console.log(`📊 Chunk RMS: ${rms.toFixed(5)} | Loud: ${isLoud}`);

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
          console.log("🛑 BARGE-IN DETECTED! Sending Interrupt Signal...");
          ws.send(JSON.stringify({ type: 'interrupt' }));
          this.isAgentSpeaking = false;
          // Ideally we should stop the backend TTS queue here too
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

      // Using @cf/openai/whisper (reliable)
      // Must pass as array of bytes (0-255) representing the WAV file
      const response = await this.env.AI.run("@cf/openai/whisper", {
        audio: [...wavFile],
        language: 'bn',
        // "prompt" maps to "initial_prompt" in some bindings, or "prompt" in others. 
        // Sending a Bangla sentence forcefully primes it.
        prompt: "আমি বাংলায় কথা বলছি। আমার নাম রিজিক। দয়া করে আমার কথা শুনুন।"
      });

      // BENCHMARK END
      const tEnd = performance.now();
      const latency = (tEnd - tStart).toFixed(2);

      // RAW LOG
      console.log(`🧠 Whisper RAW: ${JSON.stringify(response)}`);
      const text = (response.text || (response as any).result?.text || "").trim();
      console.log(`🗣️ Transcribed: "${text} " (Latency: ${latency}ms)`);

      const hallucinations = [
        'you', 'thank you', 'thanks', 'subtitle', 'subtitles',
        'audio', 'copyright', 'mojon', 'mbc', 'okay', 'bye',
        'tou', 'mikia', 'mate', 'paouna', 'shhh'
      ];

      const isHallucination =
        text.length < 3 ||
        hallucinations.some(h => text.toLowerCase().includes(h) && text.length < 20);

      if (text.length > 0 && !isHallucination) {
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
  async _streamBrainResponse(input: string, ws: WebSocket) {
    this.isAgentSpeaking = true; // 🔒 LOCK EARS

    // Send "Start" signal if needed, but 'text_stream' implies start
    try {
      const messages = [
        {
          role: 'system',
          content: `
You are Rizik, a helpful Bengali voice assistant.
RULES:
1. Speak ONLY in Bengali (minimal English for technical terms).
2. Be extremely concise (Max 2-3 sentences).
3. If the user stops speaking, answer naturally.
4. Do NOT say 'How can I help' every time.`
        },
        { role: 'user', content: input }
      ];

      const stream = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages,
        stream: true // Enable Streaming
      });

      // Consume the stream
      const reader = stream.getReader();
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
              if (jsonObj.response) {
                const token = jsonObj.response;
                fullResponse += token;
                // Optional: Send stream for UI typing effect
                ws.send(JSON.stringify({
                  type: 'text_stream',
                  content: token
                }));
              }
            } catch (e) { }
          }
        }
      }

      // 🔥 FINAL BROADCAST (Trigger TTS)
      ws.send(JSON.stringify({
        type: 'ai_response',
        text: fullResponse
      }));

    } catch (e) {
      console.error("Brain Error:", e);
      ws.send(JSON.stringify({ type: 'text_stream', content: " দুঃখিত, সার্ভারে সমস্যা হচ্ছে।" }));
    } finally {
      // 🔓 UNLOCK EARS (Allow user to interrupt/speak)
      // Delay slightly to account for TTS buffering/latency if needed, 
      // but for now immediate unlock is safer than permanent lock.
      // Ideally client sends 'turn.end' signal, but for now we unlock when generation done.
      // Better: Unlock after X seconds or wait for client event?
      // Let's rely on Generation End for now.
      setTimeout(() => {
        this.isAgentSpeaking = false;
        console.log("👂 Ears Unlocked (Turn End)");
      }, 1000); // 1s buffer for TTS start
    }
  }
}
