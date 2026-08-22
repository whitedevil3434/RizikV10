export type CommitmentStatus =
  | "draft" | "sent" | "accepted" | "in_progress" | "fulfilled"
  | "partially_accepted" | "accepted_by_counterparty" | "disputed"
  | "settled" | "closed" | "rejected" | "cancelled" | "expired";

export type ExpectationStatus = "draft" | "sent" | "responded" | "converted" | "withdrawn" | "expired";
export type CapabilityResponseType = "can_fulfill" | "can_with_changes" | "cannot_fulfill";
export type RealitySubjectType = "expectation" | "capability" | "commitment" | "outcome";
export type CapabilityActorType = "human" | "team" | "machine" | "robot" | "ai_agent" | "service" | "contractor" | "business_unit" | "supplier";
export type CapabilityRequirementStatus = "open" | "partially_assigned" | "assigned" | "blocked" | "fulfilled" | "cancelled";
export type CapabilityAssignmentStatus = "proposed" | "assigned" | "blocked" | "completed" | "reassigned" | "cancelled";
export type CapabilityStatus = "available" | "limited" | "unavailable" | "retired";
export type SignificanceLevel = "informational" | "needs_review" | "action_worthy" | "blocking" | "high_impact" | "irreversible_risk";

export interface RequiredCapability {
  id: string;
  commitmentId: string;
  type: string;
  description: string;
  quantity?: number;
  unit?: string;
  actorType?: CapabilityActorType;
  registryCapabilityId?: string;
  status: CapabilityRequirementStatus;
  createdBy: string;
  createdAt: string;
}

export interface CapabilityNode {
  id: string;
  ownerUserId: string;
  name: string;
  description?: string;
  parentCapabilityId?: string;
  actorType: CapabilityActorType;
  status: CapabilityStatus;
  availabilityNote?: string;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapabilityDependency {
  id: string;
  ownerUserId: string;
  capabilityId: string;
  dependsOnCapabilityId: string;
  relation: "requires" | "enables";
  note?: string;
  createdAt: string;
}

export interface CapabilityAssignment {
  id: string;
  commitmentId: string;
  requirementId: string;
  actorId: string;
  actorType: CapabilityActorType;
  status: CapabilityAssignmentStatus;
  assignedBy: string;
  assignedAt: string;
  note?: string;
  blockedAt?: string;
  completedAt?: string;
}

export interface SignificanceSignal {
  id: string;
  level: SignificanceLevel;
  title: string;
  detail: string;
  sourceType: "expectation" | "commitment" | "capability" | "assignment" | "dependency";
  sourceId: string;
  reasons: string[];
  createdAt: string;
}

export interface RealityTransition {
  id: string;
  subjectType: RealitySubjectType;
  subjectId: string;
  fromState: string;
  toState: string;
  actorPartyId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface DependencyEdge {
  id: string;
  ownerUserId: string;
  fromPartyId: string;
  toPartyId: string;
  relation: "depends_on" | "enables";
  subjectId?: string;
  note?: string;
  status: "active" | "removed";
  createdAt: string;
  removedAt?: string;
}

export type CommitmentEventType =
  | "commitment.created" | "commitment.sent" | "commitment.accepted"
  | "commitment.rejected" | "commitment.change_requested" | "commitment.amended"
  | "commitment.started" | "commitment.fulfilled" | "evidence.added"
  | "delivery.confirmed" | "commitment.partially_accepted" | "dispute.opened"
  | "dispute.responded" | "dispute.resolved" | "settlement.recorded"
  | "commitment.closed" | "commitment.cancelled" | "permission.revoked"
  | "capability.required" | "capability.assigned" | "capability.blocked";

export interface CommitmentVersion {
  id: string;
  number: number;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  deadline: string;
  location?: string;
  paymentTerms?: string;
  acceptanceCriteria: string;
  previousVersionId?: string;
  createdAt: string;
  createdBy: string;
}

export interface CommitmentEvent {
  id: string;
  type: CommitmentEventType;
  actorPartyId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface Commitment {
  id: string;
  ownerUserId: string;
  creatorPartyId: string;
  counterpartyPartyId: string;
  status: CommitmentStatus;
  currentVersionId: string;
  versions: CommitmentVersion[];
  events: CommitmentEvent[];
  aggregateVersion: number;
  createdAt: string;
  acceptedAt?: string;
  fulfilledAt?: string;
  closedAt?: string;
  shareToken?: string;
  shareExpiresAt?: string;
  sourceExpectationId?: string;
  capabilityResponseId?: string;
  alignmentId?: string;
  transitions: RealityTransition[];
  sourceContext?: string;
  requiredCapabilities?: RequiredCapability[];
  assignments?: CapabilityAssignment[];
}

export interface Expectation {
  id: string;
  ownerUserId: string;
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
  status: ExpectationStatus;
  createdAt: string;
  updatedAt: string;
  shareToken?: string;
  shareExpiresAt?: string;
  response?: CapabilityResponse;
  events: ExpectationEvent[];
  transitions: RealityTransition[];
}

export interface CapabilityResponse {
  id: string;
  expectationId: string;
  responderPartyId: string;
  type: CapabilityResponseType;
  proposedTerms?: {
    quantity?: number;
    unit?: string;
    price?: number;
    currency?: string;
    neededBy?: string;
    location?: string;
  };
  conditions?: string;
  limitations?: string;
  responseNote?: string;
  validUntil?: string;
  createdAt: string;
}

export interface ExpectationEvent {
  id: string;
  type: "expectation.created" | "expectation.sent" | "capability.response_submitted" | "capability.change_proposed" | "capability.declined" | "expectation.aligned" | "expectation.converted_to_commitment" | "expectation.withdrawn" | "outcome.recorded" | "expectation.updated_from_outcome";
  actorPartyId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface Evidence {
  id: string;
  commitmentId: string;
  eventId?: string;
  uploaderPartyId: string;
  type: "note" | "photo" | "document" | "location" | "quantity" | "condition" | "payment_reference";
  description?: string;
  objectKey?: string;
  visibility: "private" | "shared" | "dispute_only";
  createdAt: string;
}

export interface Dispute {
  id: string;
  commitmentId: string;
  openedBy: string;
  issueType: string;
  claim: Record<string, unknown>;
  status: "open" | "responded" | "resolved" | "appealed" | "closed";
  responses: Array<{ partyId: string; message: string; createdAt: string }>;
  resolution?: Record<string, unknown>;
  createdAt: string;
}

export interface Settlement {
  id: string;
  commitmentId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: "not_due" | "due" | "partially_paid" | "paid" | "overdue" | "payment_disputed";
  paymentReference?: string;
  recordedAt: string;
}

export const transitions: Record<CommitmentStatus, CommitmentStatus[]> = {
  draft: ["sent"],
  sent: ["accepted", "rejected", "expired"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["fulfilled", "cancelled"],
  fulfilled: ["accepted_by_counterparty", "partially_accepted", "disputed"],
  partially_accepted: ["disputed", "settled"],
  accepted_by_counterparty: ["settled"],
  disputed: ["settled"],
  settled: ["closed"],
  closed: [], rejected: [], cancelled: [], expired: [],
};

export class ClinkDomainError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 422) {
    super(message);
    this.name = "ClinkDomainError";
  }
}

export function assertTransition(from: CommitmentStatus, to: CommitmentStatus) {
  if (!transitions[from].includes(to)) {
    throw new ClinkDomainError("INVALID_TRANSITION", `Cannot move commitment from ${from} to ${to}`);
  }
}

export function assertMaterialChange(current: CommitmentVersion, next: Partial<CommitmentVersion>) {
  const fields: Array<keyof CommitmentVersion> = ["item", "quantity", "unit", "price", "currency", "deadline", "location", "paymentTerms", "acceptanceCriteria"];
  return fields.some((field) => next[field] !== undefined && next[field] !== current[field]);
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function now(): string { return new Date().toISOString(); }
