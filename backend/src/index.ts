
import { ChatRoom } from "./do/ChatRoom";

export { ChatRoom };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route: /api/chat/room/:id/ws
    if (url.pathname.startsWith("/api/chat/room/")) {
      const parts = url.pathname.split("/");
      const roomId = parts[4]; // /api/chat/room/ID/ws
      
      // Get Durable Object ID (create if not exists)
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);
      
      return stub.fetch(request);
    }

    return new Response("Rizik Backend Worker", { status: 200 });
  }
};
