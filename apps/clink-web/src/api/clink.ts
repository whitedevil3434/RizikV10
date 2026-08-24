import { supabase } from "../lib/supabase";

export type ClinkApiCommitment = {
  id: string;
  creatorPartyId: string;
  counterpartyPartyId: string;
  status: string;
  currentVersionId: string;
  versions: Array<{ item: string; quantity: number; unit: string; price: number; currency: string; deadline: string; acceptanceCriteria?: string }>;
  createdAt: string;
  events: Array<{ type: string; occurredAt: string }>;
  sourceExpectationId?: string;
  transitions?: Array<{ id: string; subjectType: string; subjectId: string; fromState: string; toState: string; actorPartyId: string; occurredAt: string }>;
  requiredCapabilities?: Array<{ id: string; type: string; description: string; quantity?: number; unit?: string; actorType?: string; status: string }>;
  assignments?: Array<{ id: string; requirementId: string; actorId: string; actorType: string; status: string; note?: string }>;
};

export type OperationalSignal = { id: string; level: string; title: string; detail: string; sourceType: string; sourceId: string; reasons: string[]; createdAt: string };
export type CapabilityNode = { id: string; name: string; description?: string; parentCapabilityId?: string; actorType: string; status: "available" | "limited" | "unavailable" | "retired"; availabilityNote?: string; createdAt: string; updatedAt: string };
export type CapabilityHealth = { capabilityId: string; name: string; status: string; requiredCount: number; assignedCount: number; blockedCount: number; dependencyCount: number };

export type ClinkApiExpectation = {
  id: string;
  ownerPartyId: string;
  counterpartyPartyId: string;
  item: string;
  quantity: number;
  unit: string;
  neededBy: string;
  location?: string;
  acceptanceCriteria: string;
  budget?: number;
  currency: string;
  flexibility?: string;
  priority?: "standard" | "important" | "urgent";
  status: "draft" | "sent" | "responded" | "converted" | "withdrawn" | "expired";
  createdAt: string;
  updatedAt: string;
  response?: {
    id: string;
    type: "can_fulfill" | "can_with_changes" | "cannot_fulfill";
    proposedTerms?: { quantity?: number; unit?: string; price?: number; currency?: string; neededBy?: string; location?: string };
    conditions?: string;
    limitations?: string;
    responseNote?: string;
    validUntil?: string;
    createdAt: string;
  };
  events: Array<{ id: string; type: string; occurredAt: string; payload?: Record<string, unknown> }>;
  transitions?: Array<{ id: string; subjectType: string; subjectId: string; fromState: string; toState: string; actorPartyId: string; occurredAt: string }>;
};

export type ClinkDependency = { id: string; fromPartyId: string; toPartyId: string; relation: "depends_on" | "enables"; subjectId?: string; note?: string; status: "active" | "removed"; createdAt: string };

const baseUrl = (import.meta.env.VITE_CLINK_API_URL || "/api/clink/v1").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error(`C-Link API request failed (${response.status})`);
  const body = await response.json() as { data: T };
  return body.data;
}

export function listCommitments() {
  return request<ClinkApiCommitment[]>("/commitments");
}

export function listExpectations() {
  return request<ClinkApiExpectation[]>("/expectations");
}

export function getOperationalSummary() {
  return request<{ signals: OperationalSignal[]; metrics: { openClaims: number; unassignedCapabilities: number; blockedAssignments: number; unresolvedDisputes: number } }>("/operational-summary");
}

export function getRealityGraph() {
  return request<{ nodes: Array<{ id: string; type: string; label: string; status?: string }>; edges: Array<{ id: string; from: string; to: string; relation: string }>; visibility: "private" }>("/reality-graph");
}

export function listCapabilities() {
  return request<{ nodes: CapabilityNode[]; dependencies: Array<{ id: string; capabilityId: string; dependsOnCapabilityId: string; relation: string; note?: string }>; health: CapabilityHealth[] }>("/capabilities");
}

export function createCapabilityNode(input: { name: string; description?: string; parentCapabilityId?: string; actorType?: string }) {
  return request<CapabilityNode>("/capabilities", { method: "POST", body: JSON.stringify(input) });
}

export function updateCapabilityAvailability(id: string, status: CapabilityNode["status"], availabilityNote?: string) {
  return request<CapabilityNode>(`/capabilities/${encodeURIComponent(id)}/availability`, { method: "POST", body: JSON.stringify({ status, availabilityNote }) });
}

export function addRequiredCapability(id: string, input: { type: string; description: string; quantity?: number; unit?: string; actorType?: string; registryCapabilityId?: string }) {
  return request<{ id: string; status: string }>(`/commitments/${encodeURIComponent(id)}/capabilities`, { method: "POST", body: JSON.stringify(input) });
}

export function assignCapability(id: string, input: { requirementId: string; actorId: string; actorType: string; note?: string }) {
  return request<{ id: string; status: string }>(`/commitments/${encodeURIComponent(id)}/assignments`, { method: "POST", body: JSON.stringify(input) });
}

export function listDependencies() {
  return request<ClinkDependency[]>("/dependencies");
}

export function createDependency(input: { fromPartyId: string; toPartyId: string; relation: "depends_on" | "enables"; subjectId?: string; note?: string }) {
  return request<ClinkDependency>("/dependencies", { method: "POST", body: JSON.stringify(input) });
}

export function createExpectation(input: {
  ownerPartyId: string;
  counterpartyPartyId: string;
  item: string;
  quantity: number;
  unit: string;
  neededBy: string;
  location?: string;
  acceptanceCriteria: string;
  budget?: number;
  currency: string;
  flexibility?: string;
  priority?: "standard" | "important" | "urgent";
}) {
  return request<ClinkApiExpectation>("/expectations", { method: "POST", body: JSON.stringify(input) });
}

export function sendExpectation(id: string) {
  return request<{ token: string; expiresAt: string }>(`/expectations/${encodeURIComponent(id)}/send`, { method: "POST", body: "{}" });
}

export function convertExpectationToCommitment(id: string) {
  return request<ClinkApiCommitment>(`/expectations/${encodeURIComponent(id)}/convert-to-commitment`, { method: "POST", body: "{}" });
}

export function getSharedExpectation(token: string) {
  return request<ClinkApiExpectation>(`/share/expectation/${encodeURIComponent(token)}`);
}

export function respondToExpectation(token: string, input: {
  type: "can_fulfill" | "can_with_changes" | "cannot_fulfill";
  proposedTerms?: { quantity?: number; unit?: string; price?: number; currency?: string; neededBy?: string; location?: string };
  conditions?: string;
  limitations?: string;
  responseNote?: string;
  validUntil?: string;
}) {
  return request<ClinkApiExpectation>(`/share/expectation/${encodeURIComponent(token)}/respond`, { method: "POST", body: JSON.stringify(input) });
}

export function createCommitment(input: {
  creatorPartyId: string;
  counterpartyPartyId: string;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  deadline: string;
  acceptanceCriteria: string;
}) {
  return request<ClinkApiCommitment>("/commitments", { method: "POST", body: JSON.stringify(input) });
}

export function sendCommitment(id: string) {
  return request<{ token: string; expiresAt: string }>(`/commitments/${encodeURIComponent(id)}/send`, { method: "POST", body: "{}" });
}

export function getSharedCommitment(token: string) {
  return request<ClinkApiCommitment>(`/share/${encodeURIComponent(token)}`);
}

export function acceptCommitment(id: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/accept`, { method: "POST", body: JSON.stringify({ actorPartyId: "counterparty" }) });
}

export function rejectCommitment(id: string, reason: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/reject`, { method: "POST", body: JSON.stringify({ actorPartyId: "counterparty", reason }) });
}

export function requestCommitmentChange(id: string, reason: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/change-request`, { method: "POST", body: JSON.stringify({ actorPartyId: "counterparty", reason }) });
}

export function startCommitment(id: string, note?: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/start`, { method: "POST", body: JSON.stringify({ note }) });
}

export function fulfillCommitment(id: string, note?: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/fulfill`, { method: "POST", body: JSON.stringify({ note }) });
}

export function confirmCommitment(id: string, input: { accepted: boolean; partial?: boolean; receivedQuantity?: number; note?: string }) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/confirm`, { method: "POST", body: JSON.stringify(input) });
}

export function recordSettlement(id: string, input: { amountDue: number; amountPaid: number; currency?: string; paymentDate?: string; paymentReference?: string; status: "pending" | "partial" | "paid" | "refunded"; note?: string }) {
  return request<{ id: string; commitmentId: string; status: string }>(`/commitments/${encodeURIComponent(id)}/settlement`, { method: "POST", body: JSON.stringify(input) });
}

export function closeCommitment(id: string, reason: string) {
  return request<ClinkApiCommitment>(`/commitments/${encodeURIComponent(id)}/close`, { method: "POST", body: JSON.stringify({ reason }) });
}

export function addEvidence(id: string, input: { description: string; type?: string }) {
  return request<{ id: string; commitmentId: string }>(`/commitments/${encodeURIComponent(id)}/evidence`, { method: "POST", body: JSON.stringify({ type: input.type || "note", description: input.description, visibility: "shared" }) });
}

export async function uploadEvidence(id: string, file: File, description: string) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const body = new FormData();
  body.append("file", file);
  body.append("description", description);
  const response = await fetch(`${baseUrl}/commitments/${encodeURIComponent(id)}/evidence/upload`, { method: "POST", body, headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined });
  if (!response.ok) throw new Error(`C-Link evidence upload failed (${response.status})`);
  const payload = await response.json() as { data: { id: string; commitmentId: string } };
  return payload.data;
}

export function revokeShare(id: string) {
  return request<{ revoked: boolean }>(`/commitments/${encodeURIComponent(id)}/revoke-share`, { method: "POST", body: "{}" });
}

export function createEvidenceDownloadToken(id: string, evidenceId: string) {
  return request<{ token: string; expiresAt: string }>(`/commitments/${encodeURIComponent(id)}/evidence/${encodeURIComponent(evidenceId)}/download-token`, { method: "POST", body: "{}" });
}

export function openDispute(id: string, issueType: string, claim: Record<string, unknown>) {
  return request<{ id: string }>(`/commitments/${encodeURIComponent(id)}/disputes`, { method: "POST", body: JSON.stringify({ issueType, claim }) });
}

export function acceptSharedCommitment(token: string) {
  return request<ClinkApiCommitment>(`/share/${encodeURIComponent(token)}/accept`, { method: "POST", body: "{}" });
}

export function rejectSharedCommitment(token: string, reason: string) {
  return request<ClinkApiCommitment>(`/share/${encodeURIComponent(token)}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
}

export function requestSharedCommitmentChange(token: string, reason: string) {
  return request<ClinkApiCommitment>(`/share/${encodeURIComponent(token)}/change-request`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function signInWithFirebase(idToken: string) {
  const response = await fetch(`${baseUrl}/auth/firebase`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  const payload = await response.json() as { data?: { access_token: string; refresh_token: string; expires_in: number }; error?: string; message?: string };
  if (!response.ok || !payload.data) throw new Error(payload.message || payload.error || `Google sign-in failed (${response.status})`);
  return payload.data;
}


export async function compileNeed(input: { text: string; locale?: string }) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const url = `${baseUrl}/ai/compile-need`;
  const response = await fetch(url, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
    },
    body: JSON.stringify({ text: input.text, locale: input.locale || "bn" })
  });
  if (!response.ok) {
    throw new Error(`Compile need failed: ${response.status}`);
  }
  return response.json();
}
