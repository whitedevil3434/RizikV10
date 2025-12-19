
import { DurableObject } from "cloudflare:workers";

export class ChatRoom extends DurableObject {
  async fetch(request: Request) {
    // 1. Handle WebSocket Upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.ctx.acceptWebSocket(server);
      console.log("WebSocket accepted");

      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Handle HTTP Requests (History, State)
    const url = new URL(request.url);
    if (url.pathname.endsWith("/history")) {
      const messages = await this.ctx.storage.sql.exec("SELECT * FROM messages ORDER BY created_at DESC LIMIT 50");
      return Response.json(messages.toArray());
    }

    return new Response("ChatRoom DO Active", { status: 200 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Broadcast to all connected clients
    const msg = JSON.parse(message as string);

    // 1. Store in SQLite
    this.ctx.storage.sql.exec(
      "INSERT INTO messages (id, sender, content, type, created_at) VALUES (?, ?, ?, ?, ?)",
      crypto.randomUUID(), msg.sender, msg.content, msg.type || 'text', Date.now()
    );

    // 2. Broadcast
    for (const client of this.ctx.getWebSockets()) {
      if (client !== ws) {
        client.send(message);
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log("WebSocket closed");
  }
}
