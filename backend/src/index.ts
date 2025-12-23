import { ChatRoom } from "./do/ChatRoom";
import { VoiceAgent } from "./do/VoiceAgent";
import { DurableObject } from "cloudflare:workers";

export { ChatRoom, VoiceAgent };

// Legacy Stubs (To fix deployment migration errors)
export class MeetingRoom extends DurableObject { }
export class VoiceAgentV2 extends DurableObject { }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log(`🚦 Traffic Police: ${request.method} ${url.pathname}`);

    // 🚦 TRAFFIC POLICE: Forward ALL /api/voice/* requests to VoiceAgent
    // Don't filter, don't block, just forward!
    if (url.pathname.startsWith("/api/voice/")) {
      console.log("🧠 Forwarding to VoiceAgent...");
      const id = env.VOICE_AGENT.idFromName("global_brain");
      const stub = env.VOICE_AGENT.get(id);
      return stub.fetch(request);
    }

    // Route: /api/chat/room/:id/ws
    if (url.pathname.startsWith("/api/chat/room/")) {
      const parts = url.pathname.split("/");
      const roomId = parts[4];
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);
      return stub.fetch(request);
    }

    return new Response("Rizik Backend Active", { status: 200 });
  }
};
