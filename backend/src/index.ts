import { ChatRoom } from "./do/ChatRoom";
import { VoiceAgent } from "./do/VoiceAgent";
import { DurableObject } from "cloudflare:workers";
import { clinkApp } from "./clink/routes";

export { ChatRoom, VoiceAgent };

// Legacy Stubs (To fix deployment migration errors)
export class MeetingRoom extends DurableObject { }
export class VoiceAgentV2 extends DurableObject { }

// 🔑 LiveKit JWT Token Generator (using Web Crypto API)
async function generateLiveKitToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  participantName: string
): Promise<string> {
  // JWT Header
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  // JWT Claims (LiveKit Access Token format)
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: apiKey,
    sub: participantName,
    name: participantName,
    iat: now,
    nbf: now,
    exp: now + 86400, // 24 hours
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    }
  };

  // Base64URL encode
  const base64url = (data: string) => {
    return btoa(data)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedClaims}`;

  // Sign with HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${signingInput}.${encodedSignature}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log(`🚦 Traffic Police: ${request.method} ${url.pathname}`);

    // C-Link is an isolated commitment/evidence surface. It intentionally does
    // not depend on Rizik marketplace, wallet, khata, or delivery modules.
    if (url.pathname.startsWith("/api/clink/")) {
      return clinkApp.fetch(request, env);
    }

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

    // 🔑 LiveKit Token Generation
    if (url.pathname === "/api/livekit/token" && request.method === "POST") {
      try {
        const body = await request.json() as { room?: string; participant?: string };
        const roomName = body.room || "rizik-room";
        const participantName = body.participant || "user-" + Date.now();

        // Generate JWT token for LiveKit
        const token = await generateLiveKitToken(
          env.LIVEKIT_API_KEY,
          env.LIVEKIT_API_SECRET,
          roomName,
          participantName
        );

        return new Response(JSON.stringify({ token }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 🧠 Memory API - GET user memory
    if (url.pathname.startsWith("/api/memory/") && request.method === "GET") {
      const userId = url.pathname.split("/")[3];
      console.log(`📚 Fetching memory for: ${userId}`);

      // Forward to VoiceAgent DO for persistent storage
      const id = env.VOICE_AGENT.idFromName("memory_store");
      const stub = env.VOICE_AGENT.get(id);

      const memoryRequest = new Request(
        `${url.origin}/memory/get/${userId}`,
        { method: "GET" }
      );
      return stub.fetch(memoryRequest);
    }

    // 🧠 Memory API - POST save user memory
    if (url.pathname.startsWith("/api/memory/") && request.method === "POST") {
      const userId = url.pathname.split("/")[3];
      console.log(`💾 Saving memory for: ${userId}`);

      // Forward to VoiceAgent DO for persistent storage
      const id = env.VOICE_AGENT.idFromName("memory_store");
      const stub = env.VOICE_AGENT.get(id);

      const body = await request.text();
      const memoryRequest = new Request(
        `${url.origin}/memory/save/${userId}`,
        {
          method: "POST",
          body: body,
          headers: { "Content-Type": "application/json" }
        }
      );
      return stub.fetch(memoryRequest);
    }

    // CORS Preflight for memory endpoints
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    return new Response("Rizik Backend Active", { status: 200 });
  }
};
