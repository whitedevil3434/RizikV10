
import { DurableObject } from "cloudflare:workers";

interface Env {
  AI: any;
  GROQ_API_KEY?: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CALLS_APP_ID: string;
}

export class VoiceAgent extends DurableObject {
  env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // 1. WebSocket Upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Create Calls Session
    if (url.pathname.endsWith("/session") && request.method === "POST") {
      return this._createCallsSession();
    }

    return new Response("Rizik Voice Brain Active", { status: 200 });
  }

  async _createCallsSession() {
    const endpoint = `https://rtc.live.cloudflare.com/v1/apps/${this.env.CALLS_APP_ID}/sessions/new`;

    // Standard Token Auth (Correct Protocol for RTC.LIVE)
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.env.CLOUDFLARE_API_TOKEN}`
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({})
      });
      const data = await response.json();
      return Response.json(data);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);
      
      if (data.type === 'text_input') {
        // Trigger Streaming Brain
        await this._streamBrainResponse(data.text, ws);
      }
    } catch (e) {
      console.error("Error:", e);
    }
  }

  async _streamBrainResponse(input: string, ws: WebSocket) {
    try {
      const messages = [
        { 
          role: 'system', 
          content: `You are Rizik, the super-intelligent AI assistant for the Rizik Super App in Bangladesh.
          - Speak in a mix of Bengali and English (Banglish) where natural.
          - Be helpful, witty, and concise.`
        },
        { role: 'user', content: input }
      ];

      const stream = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages,
        stream: true
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();

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
                ws.send(JSON.stringify({
                  type: 'text_stream',
                  content: jsonObj.response
                }));
              }
            } catch (e) {}
          }
        }
      }

    } catch (e) {
      console.error("Brain Error:", e);
      ws.send(JSON.stringify({ type: 'text_stream', content: " দুঃখিত, সার্ভারে সমস্যা হচ্ছে।" }));
    }
  }
}
