
import { ChatRoom } from "./do/ChatRoom";
import { VoiceAgent } from "./do/VoiceAgent";
import { MeetingRoom } from "./do/MeetingRoom";

export { ChatRoom, VoiceAgent, MeetingRoom };

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
    
    // Route: /api/voice/session
    // Handled by VoiceAgent Durable Object (Singleton or per-user?)
    // For now, let's use a singleton named "global_brain" or per user session
    if (url.pathname.startsWith("/api/voice/session")) {
        const id = env.VOICE_AGENT.idFromName("global_brain"); // Or unique ID
        const stub = env.VOICE_AGENT.get(id);
        return stub.fetch(request);
    }

    return new Response("Rizik Backend Worker Active", { status: 200 });
  }
};
