
import { DurableObject } from "cloudflare:workers";

interface Env {
  AI: any;
  GROQ_API_KEY?: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CALLS_APP_ID: string; // The Calls App ID
}

export class VoiceAgent extends DurableObject {
  env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // 1. WebSocket Upgrade (Signaling)
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Create Calls Session (WebRTC Uplink)
    if (url.pathname.endsWith("/session") && request.method === "POST") {
      return this._createCallsSession();
    }

    return new Response("Voice Agent Active", { status: 200 });
  }

  async _createCallsSession() {
    // Call Cloudflare Calls API to create a session
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

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Handle Signaling (SDP/ICE) or Text fallback
    try {
      const data = JSON.parse(message as string);
      
      if (data.type === 'text_input') {
        const responseText = await this._orchestrateBrain(data.text);
        ws.send(JSON.stringify({ type: 'text_stream', content: responseText }));
      }
      
      // We can also proxy WebRTC signaling here if needed
    } catch (e) {
      console.error("Error:", e);
    }
  }

  async _orchestrateBrain(input: string): Promise<string> {
    if (this.env.GROQ_API_KEY) {
      return "Groq Response (Placeholder)";
    }
    try {
      const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are Rizik. Reply in Bengali or English.' },
          { role: 'user', content: input }
        ]
      });
      return response.response;
    } catch (e) {
      return "দুঃখিত, আমি বুঝতে পারিনি।";
    }
  }
}
