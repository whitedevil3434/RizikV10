import { ChatRoom } from "./do/ChatRoom";
import { VoiceAgent } from "./do/VoiceAgent";
import { DurableObject } from "cloudflare:workers";
import { extractDNA } from "./ghost/dnaEngine";
import { transformText } from "./ghost/transformEngine";

export { ChatRoom, VoiceAgent };

// Legacy Stubs (To fix deployment migration errors)
export class MeetingRoom extends DurableObject { }
export class VoiceAgentV2 extends DurableObject { }
export class SquadRoom extends DurableObject { }

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

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

async function generateLiveKitAdminToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: apiKey,
    sub: `dispatch-${Date.now()}`,
    iat: now,
    nbf: now,
    exp: now + 3600,
    video: {
      roomAdmin: true,
      room: roomName,
    },
  };
  const base64url = (data: string) =>
    btoa(data)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedClaims}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput),
  );
  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature)),
  );
  return `${signingInput}.${encodedSignature}`;
}

function normalizeLiveKitHost(raw: string): string {
  if (raw.startsWith("wss://")) {
    return `https://${raw.slice(6)}`;
  }
  if (raw.startsWith("ws://")) {
    return `http://${raw.slice(5)}`;
  }
  return raw;
}

// 🛡️ Supabase JWT Verification using Web Crypto API
async function verifySupabaseJWT(token: string, secret: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);

    // Import the secret key
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const sigBytes = new Uint8Array(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
    if (!isValid) return null;

    // Decode payload
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) return null;

    return decodedPayload.sub; // user_id
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return null;
  }
}

// 💰 Credit Management via Supabase API
async function checkAndDecrementCredits(userId: string, env: any): Promise<{ success: boolean, remaining?: number }> {
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Fetch current usage
    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`
      }
    });

    if (!fetchRes.ok) return { success: false };
    const usageList = await fetchRes.json() as any[];
    if (!usageList || usageList.length === 0) return { success: false };

    const usage = usageList[0];
    let updatePayload: any = {};
    let remaining = 0;

    if (usage.free_uses_remaining > 0) {
      updatePayload.free_uses_remaining = usage.free_uses_remaining - 1;
      remaining = updatePayload.free_uses_remaining + usage.paid_credits;
    } else if (usage.paid_credits > 0) {
      updatePayload.paid_credits = usage.paid_credits - 1;
      remaining = usage.free_uses_remaining + updatePayload.paid_credits;
    } else {
      return { success: false };
    }

    // 2. Update usage
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        ...updatePayload,
        total_transformations: (usage.total_transformations || 0) + 1,
        updated_at: new Date().toISOString()
      })
    });

    return { success: updateRes.ok, remaining };
  } catch (err) {
    console.error("Credit Counter Error:", err);
    return { success: false };
  }
}

async function dispatchLiveKitAgent(
  env: any,
  roomName: string,
  participantName: string,
): Promise<{ dispatched: boolean; dispatchError?: string }> {
  const livekitUrl = env.LIVEKIT_URL;
  const apiKey = env.LIVEKIT_API_KEY;
  const apiSecret = env.LIVEKIT_API_SECRET;
  const agentName = env.LIVEKIT_AGENT_NAME || "rizik-local-final";

  if (!livekitUrl || !apiKey || !apiSecret) {
    return {
      dispatched: false,
      dispatchError: "missing LIVEKIT_URL/LIVEKIT_API_KEY/LIVEKIT_API_SECRET",
    };
  }

  const roomAdminToken = await generateLiveKitAdminToken(
    apiKey,
    apiSecret,
    roomName,
  );

  const host = normalizeLiveKitHost(livekitUrl);
  const endpoint = `${host}/twirp/livekit.AgentDispatchService/CreateDispatch`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${roomAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: roomName,
        agentName,
        metadata: JSON.stringify({ invitedBy: participantName }),
      }),
    });

    if (!response.ok) {
      const reason = (await response.text()).slice(0, 400);
      return {
        dispatched: false,
        dispatchError: `dispatch failed ${response.status}: ${reason}`,
      };
    }
    return { dispatched: true };
  } catch (error: any) {
    return {
      dispatched: false,
      dispatchError: error?.message || "dispatch request failed",
    };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log(`🚦 Traffic Police: ${request.method} ${url.pathname}`);

    // CORS Preflight for all endpoints
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    // 👻 GHOST WRITER API (Hack-proof Server Side Integration)
    if (url.pathname.startsWith("/api/ghost/") && request.method === "POST") {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: corsHeaders });
        }
        const token = authHeader.split(" ")[1];
        
        // 1. Verify JWT
        const userId = await verifySupabaseJWT(token, env.SUPABASE_JWT_SECRET);
        if (!userId) {
          return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: corsHeaders });
        }

        // 2. Check & Decrement Credits
        const creditCheck = await checkAndDecrementCredits(userId, env);
        if (!creditCheck.success) {
          return new Response(JSON.stringify({ 
            error: "Insufficient credits", 
            code: "INSUFFICIENT_CREDITS",
            message: "You have used your 3 free credits. Please purchase more to continue." 
          }), { status: 402, headers: corsHeaders });
        }

        // 3. Execute DNA/Transform logic
        if (url.pathname === "/api/ghost/extract") {
          const { text } = await request.json() as { text: string };
          const dna = extractDNA(text);
          return new Response(JSON.stringify({ 
            success: true, 
            profile: dna,
            creditsRemaining: creditCheck.remaining 
          }), { headers: corsHeaders });
        }

        if (url.pathname === "/api/ghost/transform") {
          const { aiText, dnaProfile } = await request.json() as { aiText: string, dnaProfile: any };
          const humanized = transformText(aiText, dnaProfile);
          return new Response(JSON.stringify({ 
            success: true, 
            text: humanized,
            creditsRemaining: creditCheck.remaining 
          }), { headers: corsHeaders });
        }
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
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
    if (
      (url.pathname === "/api/livekit/token" || url.pathname === "/api/token") &&
      request.method === "POST"
    ) {
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
        const dispatch = await dispatchLiveKitAgent(env, roomName, participantName);

        return new Response(JSON.stringify({
          token,
          dispatched: dispatch.dispatched,
          dispatchError: dispatch.dispatchError,
        }), {
          headers: corsHeaders,
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "token error" }), {
          status: 500,
          headers: corsHeaders,
        });
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
