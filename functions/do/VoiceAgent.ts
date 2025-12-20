
import { DurableObject } from "cloudflare:workers";

interface Env {
  AI: any;
  GROQ_API_KEY?: string; // Optional for Brain Swap
}

export class VoiceAgent extends DurableObject {
  env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request: Request) {
    // 1. Handle WebSocket Upgrade for Realtime Voice
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.ctx.acceptWebSocket(server);
      console.log("🎙️ Voice Agent: WebSocket Connected");

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Rizik Voice Agent Active", { status: 200 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // This is where the magic happens.
    // Input: Text/Audio tokens from client.
    // Output: Text tokens from LLM.
    
    try {
      const data = JSON.parse(message as string);
      
      if (data.type === 'text_input') {
        // Trigger the Brain
        const responseText = await this._orchestrateBrain(data.text);
        
        // Stream back to client
        ws.send(JSON.stringify({
          type: 'text_stream',
          content: responseText
        }));
      }
    } catch (e) {
      console.error("Voice Processing Error:", e);
    }
  }

  /**
   * 🧠 The Brain Orchestrator
   * Swaps between Workers AI (Llama) and Groq based on config/latency needs.
   */
  async _orchestrateBrain(input: string): Promise<string> {
    // Feature Flag: Use Groq if key exists (Lower Latency)
    if (this.env.GROQ_API_KEY) {
      return this._callGroq(input);
    }

    // Default: Cloudflare Workers AI (Zero Egress Cost)
    try {
      const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are Rizik, a helpful assistant. Reply in Bengali or English.' },
          { role: 'user', content: input }
        ]
      });
      return response.response;
    } catch (e) {
      console.error("Workers AI Failed:", e);
      return "দুঃখিত, আমি এখন চিন্তা করতে পারছি না।"; // Fallback
    }
  }

  async _callGroq(input: string): Promise<string> {
    // Placeholder for Groq implementation
    // Would fetch https://api.groq.com/openai/v1/chat/completions
    return "Groq response placeholder";
  }
}
