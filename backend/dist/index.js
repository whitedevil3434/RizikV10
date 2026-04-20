import { ChatRoom } from "./do/ChatRoom";
import { VoiceAgent } from "./do/VoiceAgent";
import { DurableObject } from "cloudflare:workers";
import { extractDNA } from "./ghost/dnaEngine";
import { transformText } from "./ghost/transformEngine";
import { populateConsortium, ingestBatch } from "./ghost/consortiumPopulator";
import { extractVoiceDNA } from "./ghost/voiceAnalyzer";
export { ChatRoom, VoiceAgent };
// Legacy Stubs (To fix deployment migration errors)
export class MeetingRoom extends DurableObject {
}
export class VoiceAgentV2 extends DurableObject {
}
export class SquadRoom extends DurableObject {
}
const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
};
function parseCommaSeparated(raw) {
    return String(raw || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}
async function isUnlimitedUser(userId, userEmail, env) {
    const staticUnlimited = new Set([
        "sabbirhossainkhan43@gmail.com",
        "its.sabbir69@gmail.com",
        ...parseCommaSeparated(env.ADMIN_UNLIMITED_EMAILS),
    ]);
    if (userEmail && staticUnlimited.has(userEmail.toLowerCase())) {
        return true;
    }
    // Role-based bypass from user_profiles for robustness (works even if email changes).
    try {
        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey)
            return false;
        const res = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, {
            method: "GET",
            headers: {
                "apikey": serviceKey,
                "Authorization": `Bearer ${serviceKey}`,
            },
        });
        if (!res.ok)
            return false;
        const rows = await res.json();
        const role = (rows?.[0]?.role || "").toUpperCase();
        const unlimitedRoles = new Set(["SUPER_ADMIN", "ADMIN", "OWNER", "FOUNDER", "ROOT"]);
        return unlimitedRoles.has(role);
    }
    catch (err) {
        console.warn("Unlimited role-check failed:", err);
        return false;
    }
}
function isCreditBypassEnabled(env) {
    const raw = env.PAUSE_CREDIT_LOGIC ?? env.TEST_MODE_DISABLE_CREDITS ?? "";
    return String(raw).trim().toLowerCase() === "true";
}
// 🔑 LiveKit JWT Token Generator (using Web Crypto API)
async function generateLiveKitToken(apiKey, apiSecret, roomName, participantName) {
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
    const base64url = (data) => {
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
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));
    return `${signingInput}.${encodedSignature}`;
}
async function generateLiveKitAdminToken(apiKey, apiSecret, roomName) {
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
    const base64url = (data) => btoa(data)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedClaims = base64url(JSON.stringify(claims));
    const signingInput = `${encodedHeader}.${encodedClaims}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(apiSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));
    return `${signingInput}.${encodedSignature}`;
}
function normalizeLiveKitHost(raw) {
    if (raw.startsWith("wss://")) {
        return `https://${raw.slice(6)}`;
    }
    if (raw.startsWith("ws://")) {
        return `http://${raw.slice(5)}`;
    }
    return raw;
}
// 🛡️ Supabase JWT Verification using Web Crypto API
async function verifySupabaseJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const [header, payload, signature] = parts;
        const encoder = new TextEncoder();
        const data = encoder.encode(`${header}.${payload}`);
        // Import the secret key
        const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        // Verify signature
        const sigBytes = new Uint8Array(atob(signature.replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map(c => c.charCodeAt(0)));
        const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
        if (!isValid)
            return null;
        // Decode payload
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < now)
            return null;
        return decodedPayload.sub; // user_id
    }
    catch (err) {
        console.error("JWT Verify Error:", err);
        return null;
    }
}
// 💰 Atomic Credit Management via Supabase API
async function checkAndDecrementCredits(userId, env) {
    try {
        // Testing switch: bypass monetization gate completely.
        if (isCreditBypassEnabled(env)) {
            return { success: true, remaining: 999999 };
        }
        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey)
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        // 1. Read current usage
        const readRes = await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}&select=free_uses_remaining,paid_credits`, {
            method: "GET",
            headers: {
                "apikey": serviceKey,
                "Authorization": `Bearer ${serviceKey}`
            }
        });
        if (!readRes.ok)
            return { success: false };
        const readData = await readRes.json();
        if (!readData || readData.length === 0)
            return { success: false };
        const currentFree = readData[0].free_uses_remaining || 0;
        const currentPaid = readData[0].paid_credits || 0;
        if (currentFree <= 0 && currentPaid <= 0) {
            return { success: false, remaining: 0 };
        }
        const newFree = currentFree > 0 ? currentFree - 1 : 0;
        const newPaid = currentFree <= 0 ? currentPaid - 1 : currentPaid;
        const remaining = newFree + newPaid;
        // 2. Write new usage
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}`, {
            method: "PATCH",
            headers: {
                "apikey": serviceKey,
                "Authorization": `Bearer ${serviceKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                free_uses_remaining: newFree,
                paid_credits: newPaid
            })
        });
        if (!updateRes.ok)
            return { success: false };
        return { success: true, remaining };
    }
    catch (err) {
        console.error("Credit Counter Error:", err);
        return { success: false };
    }
}
async function getAvailableCredits(userId, env) {
    try {
        if (isCreditBypassEnabled(env))
            return 999999;
        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey)
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        const readRes = await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}&select=free_uses_remaining,paid_credits&limit=1`, {
            method: "GET",
            headers: {
                "apikey": serviceKey,
                "Authorization": `Bearer ${serviceKey}`
            }
        });
        if (!readRes.ok)
            return null;
        const rows = await readRes.json();
        if (!rows || rows.length === 0)
            return 0;
        const free = rows[0].free_uses_remaining || 0;
        const paid = rows[0].paid_credits || 0;
        return free + paid;
    }
    catch (err) {
        console.error("Credit Availability Error:", err);
        return null;
    }
}
async function dispatchLiveKitAgent(env, roomName, participantName) {
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
    const roomAdminToken = await generateLiveKitAdminToken(apiKey, apiSecret, roomName);
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
    }
    catch (error) {
        return {
            dispatched: false,
            dispatchError: error?.message || "dispatch request failed",
        };
    }
}
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        console.log(`GODLY_DEBUG: ${request.method} ${url.pathname}`);
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
                // 1. Verify JWT (with Admin Bypass)
                const adminKey = request.headers.get("X-Rizik-Admin-Key");
                let userId = null;
                let userEmail = null;
                let isAdmin = false;
                if (adminKey && adminKey === env.SUPABASE_SERVICE_ROLE_KEY) {
                    userId = "admin_test_user";
                    isAdmin = true;
                    console.log("🧬 Godly Resonance: Admin Bypass Authorized (Header Key).");
                }
                else {
                    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
                    const authApiKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        env.SUPABASE_ANON_KEY ||
                        env.SUPABASE_SERVICE_ROLE_KEY;
                    if (!authApiKey && !env.SUPABASE_JWT_SECRET) {
                        return new Response(JSON.stringify({ error: "Backend auth misconfigured (missing Supabase API key / JWT secret)" }), { status: 500, headers: corsHeaders });
                    }
                    // Primary: local JWT verification (avoids auth API rate-limit false negatives).
                    if (env.SUPABASE_JWT_SECRET) {
                        userId = await verifySupabaseJWT(token, env.SUPABASE_JWT_SECRET);
                    }
                    // Secondary: enrich with /auth/v1/user when available (email lookup, stronger validation).
                    if (authApiKey) {
                        try {
                            const resUser = await fetch(supabaseUrl + "/auth/v1/user", {
                                headers: { Authorization: "Bearer " + token, "apikey": authApiKey }
                            });
                            if (resUser.ok) {
                                const userData = await resUser.json();
                                userId = userData?.id || userId;
                                userEmail = userData?.email || null;
                            }
                            else if (!userId) {
                                const reason = await resUser.text();
                                return new Response(JSON.stringify({
                                    error: "Invalid or expired session",
                                    detail: reason.slice(0, 300),
                                }), { status: 401, headers: corsHeaders });
                            }
                            else {
                                console.warn("Auth API unavailable/rate-limited; proceeding via local JWT verification.");
                            }
                        }
                        catch (authErr) {
                            if (!userId) {
                                return new Response(JSON.stringify({ error: "Invalid or expired session", detail: "Auth lookup failed" }), { status: 401, headers: corsHeaders });
                            }
                            console.warn("Auth API lookup failed; local JWT verification passed:", authErr);
                        }
                    }
                    if (userId && await isUnlimitedUser(userId, userEmail, env)) {
                        isAdmin = true;
                        console.log(`🧬 Godly Resonance: Admin Bypass Authorized (Role/Email: ${userEmail || userId}).`);
                    }
                }
                if (!userId) {
                    return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: corsHeaders });
                }
                // 3. Execute DNA/Transform logic
                // DNA extraction is ALWAYS FREE — no credit cost
                if (url.pathname === "/api/ghost/dna") {
                    const { text } = await request.json();
                    const dna = await extractDNA(text, env);
                    return new Response(JSON.stringify({
                        success: true,
                        dna: dna,
                        creditsRemaining: -1 // -1 signals "not deducted"
                    }), { headers: corsHeaders });
                }
                // Humanize DOES cost credits (unless admin)
                if (url.pathname === "/api/ghost/humanize") {
                    let creditsRemaining = isAdmin ? 999999 : 0;
                    if (!isAdmin) {
                        // Pre-check only (do not decrement before successful output generation).
                        const available = await getAvailableCredits(userId, env);
                        if (available === null) {
                            return new Response(JSON.stringify({
                                error: "Credit check temporarily unavailable. Please retry in a moment."
                            }), { status: 503, headers: corsHeaders });
                        }
                        if (available <= 0) {
                            return new Response(JSON.stringify({
                                error: "Insufficient credits",
                                code: "INSUFFICIENT_CREDITS",
                                message: "You have used your 3 free credits. Please purchase more to continue."
                            }), { status: 402, headers: corsHeaders });
                        }
                        creditsRemaining = available;
                    }
                    const { aiText, dnaProfile, options } = await request.json();
                    const result = await transformText(aiText, dnaProfile, env, options);
                    const content = result.llmOutput || result.pipelineOutput;
                    // Don't charge when transform did not produce usable content.
                    if (!content || !String(content).trim()) {
                        return new Response(JSON.stringify({
                            error: "Humanizer failed to generate output. No credit deducted."
                        }), { status: 500, headers: corsHeaders });
                    }
                    if (!isAdmin) {
                        // Debit only after successful output creation.
                        const debit = await checkAndDecrementCredits(userId, env);
                        if (debit.success) {
                            creditsRemaining = debit.remaining ?? creditsRemaining;
                        }
                        else {
                            // Keep output available even if billing write fails; avoid charging on failed write path.
                            console.warn(`⚠️ Credit debit failed after success for user=${userId}. Output returned without deduction.`);
                        }
                    }
                    else {
                        console.log("🧬 Admin: Skipping credit deduction.");
                    }
                    return new Response(JSON.stringify({
                        success: true,
                        content, // Primary: LLM if available
                        pipelineOutput: result.pipelineOutput, // Always available
                        llmOutput: result.llmOutput, // null if LLM failed/rejected
                        creditsRemaining: creditsRemaining
                    }), { headers: corsHeaders });
                }
            }
            catch (err) {
                console.error("Ghost API Error:", err);
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }
        // 🏆 ADMIN: Consortium DNA Population
        if (url.pathname === "/api/admin/consortium/populate" && request.method === "POST") {
            try {
                const { subreddit, limit } = await request.json();
                const result = await populateConsortium(subreddit || "bangladesh", limit || 100, env);
                return new Response(JSON.stringify(result), { headers: corsHeaders });
            }
            catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }
        // Route: /api/ghost/dna/voice (New)
        if (url.pathname === "/api/ghost/dna/voice" && request.method === "POST") {
            try {
                const audioBlob = await request.arrayBuffer();
                const result = await extractVoiceDNA(audioBlob, env);
                return new Response(JSON.stringify(result), { headers: corsHeaders });
            }
            catch (err) {
                return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
            }
        }
        // Admin: Batch Populate Consortium (Academic/Niche)
        if (url.pathname === "/api/admin/consortium/batch-populate" && request.method === "POST") {
            try {
                const { subreddits, limitPerSub } = await request.json();
                const results = [];
                for (const sub of subreddits) {
                    const res = await populateConsortium(sub, limitPerSub || 50, env);
                    results.push(res);
                }
                return new Response(JSON.stringify({ success: true, results }), { headers: corsHeaders });
            }
            catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }
        // Admin: Ingest Batch (New)
        if (url.pathname === "/api/admin/ingest-batch" && request.method === "POST") {
            try {
                const { batch } = await request.json();
                const result = await ingestBatch(batch, env);
                return new Response(JSON.stringify(result), { headers: corsHeaders });
            }
            catch (err) {
                return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: corsHeaders });
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
        if ((url.pathname === "/api/livekit/token" || url.pathname === "/api/token") &&
            request.method === "POST") {
            try {
                const body = await request.json();
                const roomName = body.room || "rizik-room";
                const participantName = body.participant || "user-" + Date.now();
                // Generate JWT token for LiveKit
                const token = await generateLiveKitToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, roomName, participantName);
                const dispatch = await dispatchLiveKitAgent(env, roomName, participantName);
                return new Response(JSON.stringify({
                    token,
                    dispatched: dispatch.dispatched,
                    dispatchError: dispatch.dispatchError,
                }), {
                    headers: corsHeaders,
                });
            }
            catch (e) {
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
            const memoryRequest = new Request(`${url.origin}/memory/get/${userId}`, { method: "GET" });
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
            const memoryRequest = new Request(`${url.origin}/memory/save/${userId}`, {
                method: "POST",
                body: body,
                headers: { "Content-Type": "application/json" }
            });
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
