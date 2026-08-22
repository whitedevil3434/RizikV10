import { Hono } from "hono";
import { cors } from "hono/cors";
import { ClinkDomainError, Commitment, Expectation } from "./domain";
import { InMemoryClinkStore } from "./store";
import { verifyClinkBearer } from "./auth";

export const clinkStore = new InMemoryClinkStore();
type ClinkVariables = { clinkUserId: string };
export const clinkApp = new Hono<{ Variables: ClinkVariables }>();
clinkApp.use("/api/clink/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "If-Match"], allowMethods: ["GET", "POST", "OPTIONS"] }));
clinkApp.use("/api/clink/*", async (c, next) => {
  const isPublicShareRoute = c.req.path.includes("/v1/share/") || c.req.path.includes("/v1/auth/firebase");
  if (!isPublicShareRoute) {
    const userId = await verifyClinkBearer(c.req.raw, (c.env as { SUPABASE_JWT_SECRET?: string }).SUPABASE_JWT_SECRET);
    if (!userId) { c.header("WWW-Authenticate", "Bearer"); return c.json({ error: "CLINK_AUTH_REQUIRED", message: "Sign in to access this workspace" }, 401); }
    c.set("clinkUserId", userId);
  }
  const requestOwner = c.get("clinkUserId") || `public:${c.req.path}`;
  const env = c.env as { RIZIK_STORAGE?: R2Bucket };
  await clinkStore.hydrate(env.RIZIK_STORAGE);
  const idempotencyKey = c.req.header("Idempotency-Key");
  if (c.req.method !== "GET" && idempotencyKey) {
    const previous = clinkStore.getIdempotency(idempotencyKey, requestOwner);
    if (previous) return c.json(previous.body, previous.status as 200);
  }
  const ifMatch = c.req.header("If-Match");
  const commitmentMatch = c.req.path.match(/\/commitments\/([^/]+)/);
  if (ifMatch && ifMatch !== "*" && commitmentMatch) {
    const current = clinkStore.get(decodeURIComponent(commitmentMatch[1]));
    const expectedVersion = Number(ifMatch.replaceAll('"', ""));
    if (current && (!Number.isInteger(expectedVersion) || expectedVersion !== current.aggregateVersion)) return c.json({ error: "CLINK_CONFLICT", message: "This record changed since it was loaded", currentVersion: current.aggregateVersion }, 409);
  }
  await next();
  if (c.req.method !== "GET" && c.res.status < 400) {
    if (idempotencyKey) {
      const body = await c.res.clone().json().catch(() => null);
      if (body) clinkStore.setIdempotency(idempotencyKey, requestOwner, c.res.status, body);
    }
    await clinkStore.persist(env.RIZIK_STORAGE);
  }
});

function ownerId(c: any): string { return c.get("clinkUserId"); }
function owned(c: any, id: string) { return clinkStore.assertOwner(id, ownerId(c)); }

function jsonError(error: unknown) {
  if (error instanceof ClinkDomainError) return { status: error.status, body: { error: error.code, message: error.message } };
  const message = error instanceof Error ? error.message : "Unexpected C-Link error";
  return { status: 400, body: { error: "CLINK_REQUEST_ERROR", message } };
}

function safeCommitment(item: Commitment) {
  const { shareToken: _shareToken, shareExpiresAt: _shareExpiresAt, ownerUserId: _ownerUserId, ...safe } = item;
  return safe;
}

function safeExpectation(item: Expectation) {
  const { shareToken: _shareToken, shareExpiresAt: _shareExpiresAt, ownerUserId: _ownerUserId, ...safe } = item;
  return safe;
}

function base64UrlEncode(input: Uint8Array) {
  return btoa(String.fromCharCode(...input)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function buildFirebaseShadowPassword(firebaseUid: string, salt: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${firebaseUid}:${salt}`));
  return `${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 30)}#Rz!`;
}

async function syncFirebaseUser(c: any, idToken: string) {
  const env = c.env as { FIREBASE_API_KEY?: string; NEXT_PUBLIC_SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string; FIREBASE_SHADOW_PASSWORD_SALT?: string };
  if (!env.FIREBASE_API_KEY || !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new ClinkDomainError("GOOGLE_AUTH_UNAVAILABLE", "Google sign-in is not configured", 503);
  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  const lookupPayload = await lookup.json() as { users?: Array<{ localId?: string; email?: string; displayName?: string; photoUrl?: string }> };
  const firebaseUser = lookupPayload.users?.[0];
  if (!lookup.ok || !firebaseUser?.localId || !firebaseUser.email) throw new ClinkDomainError("GOOGLE_AUTH_INVALID", "Google sign-in could not be verified", 401);
  const password = await buildFirebaseShadowPassword(firebaseUser.localId, env.FIREBASE_SHADOW_PASSWORD_SALT || env.SUPABASE_SERVICE_ROLE_KEY);
  const adminHeaders = { "Content-Type": "application/json", apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };
  const adminUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;
  let userId: string | undefined;
  const create = await fetch(adminUrl, { method: "POST", headers: adminHeaders, body: JSON.stringify({ email: firebaseUser.email, password, email_confirm: true, user_metadata: { full_name: firebaseUser.displayName || "Google User", avatar_url: firebaseUser.photoUrl || "" } }) });
  if (create.ok) userId = (await create.json() as { id?: string }).id;
  if (!userId) {
    const usersResponse = await fetch(`${adminUrl}?page=1&per_page=1000`, { headers: adminHeaders });
    const users = await usersResponse.json() as { users?: Array<{ id?: string; email?: string }> };
    userId = users.users?.find((user) => user.email?.toLowerCase() === firebaseUser.email!.toLowerCase())?.id;
  }
  if (!userId) throw new ClinkDomainError("GOOGLE_USER_SYNC_FAILED", "Google account could not be linked to a Rizik account", 502);
  await fetch(`${adminUrl}/${encodeURIComponent(userId)}`, { method: "PUT", headers: adminHeaders, body: JSON.stringify({ password, email_confirm: true, user_metadata: { full_name: firebaseUser.displayName || "Google User", avatar_url: firebaseUser.photoUrl || "" } }) });
  const sessionResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", apikey: env.SUPABASE_SERVICE_ROLE_KEY }, body: JSON.stringify({ email: firebaseUser.email, password }) });
  const session = await sessionResponse.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!sessionResponse.ok || !session.access_token || !session.refresh_token) throw new ClinkDomainError("GOOGLE_SESSION_FAILED", "Google account was linked but a workspace session could not be created", 502);
  return { access_token: session.access_token, refresh_token: session.refresh_token, expires_in: session.expires_in || 3600 };
}

clinkApp.get("/api/clink/v1/commitments", (c) => c.json({ data: clinkStore.list(ownerId(c)).map(safeCommitment) }));
clinkApp.get("/api/clink/v1/operational-summary", (c) => c.json({ data: clinkStore.operationalSummary(ownerId(c)) }));
clinkApp.get("/api/clink/v1/reality-graph", (c) => c.json({ data: clinkStore.realityGraph(ownerId(c)) }));
clinkApp.get("/api/clink/v1/capabilities", (c) => c.json({ data: { nodes: clinkStore.listCapabilityNodes(ownerId(c)), dependencies: clinkStore.listCapabilityDependencies(ownerId(c)), health: clinkStore.capabilityHealth(ownerId(c)) } }));
clinkApp.post("/api/clink/v1/capabilities", async (c) => {
  try { return c.json({ data: clinkStore.createCapabilityNode({ ...(await c.req.json()), ownerUserId: ownerId(c) }) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/capabilities/:id/availability", async (c) => {
  try { const body = await c.req.json(); return c.json({ data: clinkStore.updateCapabilityAvailability(c.req.param("id"), ownerId(c), body.status, body.availabilityNote) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/capabilities/:id/dependencies", async (c) => {
  try { const body = await c.req.json(); return c.json({ data: clinkStore.addCapabilityDependency(c.req.param("id"), ownerId(c), body.dependsOnCapabilityId, body.relation || "requires", body.note) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/expectations", (c) => c.json({ data: clinkStore.listExpectations(ownerId(c)).map(safeExpectation) }));
clinkApp.get("/api/clink/v1/dependencies", (c) => c.json({ data: clinkStore.listDependencies(ownerId(c)) }));
clinkApp.post("/api/clink/v1/dependencies", async (c) => {
  try { return c.json({ data: clinkStore.createDependency({ ...(await c.req.json()), ownerUserId: ownerId(c) }) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/expectations", async (c) => {
  try { return c.json({ data: clinkStore.createExpectation({ ...(await c.req.json()), ownerUserId: ownerId(c) }) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/expectations/:id", (c) => {
  try { return c.json({ data: safeExpectation(clinkStore.assertExpectationOwner(c.req.param("id"), ownerId(c))) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/expectations/:id/timeline", (c) => {
  try { const expectation = clinkStore.assertExpectationOwner(c.req.param("id"), ownerId(c)); return c.json({ data: { events: expectation.events, transitions: expectation.transitions } }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/expectations/:id/send", (c) => {
  try { clinkStore.assertExpectationOwner(c.req.param("id"), ownerId(c)); return c.json({ data: clinkStore.sendExpectation(c.req.param("id")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/expectations/:id/withdraw", (c) => {
  try { return c.json({ data: safeExpectation(clinkStore.withdrawExpectation(c.req.param("id"), ownerId(c))) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/expectations/:id/convert-to-commitment", (c) => {
  try { return c.json({ data: safeCommitment(clinkStore.convertExpectationToCommitment(c.req.param("id"), ownerId(c))) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/auth/firebase", async (c) => {
  try { const body = await c.req.json(); if (!body.idToken) throw new ClinkDomainError("GOOGLE_TOKEN_REQUIRED", "Google sign-in token is required"); return c.json({ data: await syncFirebaseUser(c, body.idToken) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/share/expectation/:token", (c) => {
  const item = clinkStore.getExpectationByShareToken(c.req.param("token"));
  return item ? c.json({ data: safeExpectation(item) }) : c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410);
});
clinkApp.post("/api/clink/v1/share/expectation/:token/respond", async (c) => {
  try { return c.json({ data: safeExpectation(clinkStore.respondExpectationByToken(c.req.param("token"), await c.req.json())) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/legacy/claim", (c) => c.json({ data: clinkStore.claimLegacy(ownerId(c)).map(safeCommitment) }));
clinkApp.get("/api/clink/v1/commitments/:id", (c) => {
  try {
    const item = owned(c, c.req.param("id"));
    return item ? c.json({ data: safeCommitment(item) }) : c.json({ error: "NOT_FOUND" }, 404);
  } catch (error) {
    const result = jsonError(error); return c.json(result.body, result.status as 400);
  }
});
clinkApp.get("/api/clink/v1/commitments/:id/timeline", (c) => {
  try { const commitment = owned(c, c.req.param("id")); return c.json({ data: { events: commitment.events, transitions: commitment.transitions } }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/commitments/:id/capabilities", (c) => {
  try { const commitment = owned(c, c.req.param("id")); return c.json({ data: { requirements: clinkStore.listCapabilities(commitment.id), assignments: clinkStore.listAssignments(commitment.id) } }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/capabilities", async (c) => {
  try { const commitment = owned(c, c.req.param("id")); const body = await c.req.json(); return c.json({ data: clinkStore.addRequiredCapability(commitment.id, body.createdBy || ownerId(c), body, ownerId(c)) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/assignments", async (c) => {
  try { const commitment = owned(c, c.req.param("id")); const body = await c.req.json(); return c.json({ data: clinkStore.assignCapability(commitment.id, body.assignedBy || ownerId(c), body) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/assignments/:assignmentId/block", async (c) => {
  try { const commitment = owned(c, c.req.param("id")); const body = await c.req.json().catch(() => ({})); return c.json({ data: clinkStore.blockAssignment(commitment.id, c.req.param("assignmentId"), ownerId(c), body.note) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/share/:token", (c) => {
  const item = clinkStore.getByShareToken(c.req.param("token"));
  return item ? c.json({ data: safeCommitment(item) }) : c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410);
});
clinkApp.post("/api/clink/v1/share/:token/accept", (c) => {
  try { const item = clinkStore.getByShareToken(c.req.param("token")); if (!item) return c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410); return c.json({ data: safeCommitment(clinkStore.accept(item.id, "counterparty")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/share/:token/reject", async (c) => {
  try { const item = clinkStore.getByShareToken(c.req.param("token")); if (!item) return c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410); const body = await c.req.json().catch(() => ({})); return c.json({ data: safeCommitment(clinkStore.reject(item.id, "counterparty", body.reason)) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/share/:token/change-request", async (c) => {
  try { const item = clinkStore.getByShareToken(c.req.param("token")); if (!item) return c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410); const body = await c.req.json().catch(() => ({})); return c.json({ data: safeCommitment(clinkStore.requestChange(item.id, "counterparty", body.reason || "Terms need clarification")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/share/:token/evidence/:evidenceId/download-token", (c) => {
  try { const item = clinkStore.getByShareToken(c.req.param("token")); if (!item) return c.json({ error: "LINK_EXPIRED_OR_REVOKED" }, 410); const evidence = clinkStore.listEvidence(item.id).find((entry) => entry.id === c.req.param("evidenceId")); if (!evidence || evidence.visibility !== "shared") return c.json({ error: "EVIDENCE_NOT_AVAILABLE" }, 404); return c.json({ data: clinkStore.createEvidenceDownloadToken(item.id, evidence.id) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments", async (c) => {
  try { return c.json({ data: clinkStore.create({ ...(await c.req.json()), ownerUserId: ownerId(c) }) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/send", (c) => {
  try { owned(c, c.req.param("id")); const result = clinkStore.createShare(c.req.param("id")); return c.json({ data: result }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/accept", async (c) => {
  try { owned(c, c.req.param("id")); return c.json({ data: clinkStore.accept(c.req.param("id"), ownerId(c)) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/start", async (c) => {
  try { const body = await c.req.json().catch(() => ({})); owned(c, c.req.param("id")); return c.json({ data: clinkStore.start(c.req.param("id"), ownerId(c), body) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/reject", async (c) => {
  try { const body = await c.req.json().catch(() => ({})); owned(c, c.req.param("id")); return c.json({ data: clinkStore.reject(c.req.param("id"), ownerId(c), body.reason) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/change-request", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.requestChange(c.req.param("id"), ownerId(c), body.reason || "Terms need clarification") }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/amend", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.amend(c.req.param("id"), ownerId(c), body) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/fulfill", async (c) => {
  try { const body = await c.req.json().catch(() => ({})); owned(c, c.req.param("id")); return c.json({ data: clinkStore.fulfill(c.req.param("id"), ownerId(c), body) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/confirm", async (c) => {
  try { const body = await c.req.json().catch(() => ({})); owned(c, c.req.param("id")); return c.json({ data: clinkStore.confirm(c.req.param("id"), ownerId(c), body.accepted !== false, body) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/evidence", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.addEvidence(c.req.param("id"), ownerId(c), body) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/evidence/upload", async (c) => {
  try {
    const form = await c.req.formData();
    const fileEntry = form.get("file");
    if (!fileEntry || typeof fileEntry !== "object" || !("arrayBuffer" in fileEntry)) throw new ClinkDomainError("EVIDENCE_FILE_REQUIRED", "An evidence file is required");
    owned(c, c.req.param("id"));
    const file = fileEntry as File;
    if (file.size > 10 * 1024 * 1024) throw new ClinkDomainError("EVIDENCE_FILE_TOO_LARGE", "Evidence files must be 10 MB or smaller");
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) throw new ClinkDomainError("EVIDENCE_FILE_TYPE_NOT_ALLOWED", "Only JPG, PNG, WEBP and PDF evidence files are supported");
    const bucket = (c.env as { RIZIK_STORAGE?: R2Bucket }).RIZIK_STORAGE;
    if (!bucket) throw new ClinkDomainError("EVIDENCE_STORAGE_UNAVAILABLE", "Evidence storage is unavailable", 503);
    const objectKey = `clink/evidence/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await bucket.put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    return c.json({ data: clinkStore.addEvidence(c.req.param("id"), ownerId(c), { type: file.type.startsWith("image/") ? "photo" : "document", description: String(form.get("description") || file.name), objectKey, visibility: "shared" }) }, 201);
  } catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/commitments/:id/evidence", (c) => {
  try { owned(c, c.req.param("id")); return c.json({ data: clinkStore.listEvidence(c.req.param("id")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/evidence/:evidenceId/download-token", (c) => {
  try { owned(c, c.req.param("id")); return c.json({ data: clinkStore.createEvidenceDownloadToken(c.req.param("id"), c.req.param("evidenceId")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/disputes", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.openDispute(c.req.param("id"), ownerId(c), body.issueType || "other", body.claim || {}) }, 201); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/disputes/:id/respond", async (c) => {
  try { const body = await c.req.json(); const dispute = clinkStore.getDispute(c.req.param("id")); if (!dispute) return c.json({ error: "NOT_FOUND" }, 404); owned(c, dispute.commitmentId); return c.json({ data: clinkStore.respondDispute(c.req.param("id"), ownerId(c), body.message || "") }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/disputes/:id/resolve", async (c) => {
  try { const body = await c.req.json(); const dispute = clinkStore.getDispute(c.req.param("id")); if (!dispute) return c.json({ error: "NOT_FOUND" }, 404); owned(c, dispute.commitmentId); return c.json({ data: clinkStore.resolveDispute(c.req.param("id"), ownerId(c), body.resolution || {}) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/settlement", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.recordSettlement(c.req.param("id"), body, ownerId(c)) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/revoke-share", (c) => {
  try { owned(c, c.req.param("id")); return c.json({ data: clinkStore.revokeShare(c.req.param("id")) }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.post("/api/clink/v1/commitments/:id/close", async (c) => {
  try { const body = await c.req.json(); owned(c, c.req.param("id")); return c.json({ data: clinkStore.close(c.req.param("id"), ownerId(c), body.reason || "completed") }); }
  catch (error) { const result = jsonError(error); return c.json(result.body, result.status as 400); }
});
clinkApp.get("/api/clink/v1/evidence/download/:token", async (c) => {
  const record = clinkStore.resolveEvidenceDownloadToken(c.req.param("token"));
  if (!record?.evidence?.objectKey) return c.json({ error: "EVIDENCE_LINK_EXPIRED" }, 410);
  const bucket = (c.env as { RIZIK_STORAGE?: R2Bucket }).RIZIK_STORAGE;
  const object = bucket ? await bucket.get(record.evidence.objectKey) : null;
  if (!object) return c.json({ error: "EVIDENCE_NOT_FOUND" }, 404);
  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Cache-Control", "private, max-age=60");
  return new Response(object.body, { headers });
});
