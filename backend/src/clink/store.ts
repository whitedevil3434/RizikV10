import { assertMaterialChange, assertTransition, CapabilityAssignment, CapabilityActorType, CapabilityDependency, CapabilityNode, CapabilityResponse, CapabilityResponseType, ClinkDomainError, Commitment, CommitmentEventType, CommitmentStatus, CommitmentVersion, createId, DependencyEdge, Dispute, Evidence, Expectation, ExpectationEvent, now, RealityTransition, RequiredCapability, Settlement, SignificanceSignal } from "./domain";

export interface CreateCommitmentInput {
  ownerUserId: string;
  creatorPartyId: string;
  counterpartyPartyId: string;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  currency?: string;
  deadline: string;
  location?: string;
  paymentTerms?: string;
  acceptanceCriteria: string;
  sourceContext?: string;
}

export interface AmendCommitmentInput {
  item?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  deadline?: string;
  location?: string;
  paymentTerms?: string;
  acceptanceCriteria?: string;
  reason: string;
}

export interface CreateExpectationInput {
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
  currency?: string;
  flexibility?: string;
  priority?: "standard" | "important" | "urgent";
}

export interface CapabilityResponseInput {
  type: CapabilityResponseType;
  proposedTerms?: CapabilityResponse["proposedTerms"];
  conditions?: string;
  limitations?: string;
  responseNote?: string;
  validUntil?: string;
}

export interface CreateDependencyInput {
  ownerUserId: string;
  fromPartyId: string;
  toPartyId: string;
  relation: "depends_on" | "enables";
  subjectId?: string;
  note?: string;
}

export interface CreateCapabilityInput {
  type: string;
  description: string;
  quantity?: number;
  unit?: string;
  actorType?: CapabilityActorType;
  registryCapabilityId?: string;
}

export interface CreateAssignmentInput {
  requirementId: string;
  actorId: string;
  actorType: CapabilityActorType;
  note?: string;
}

export interface CreateCapabilityNodeInput {
  ownerUserId: string;
  name: string;
  description?: string;
  parentCapabilityId?: string;
  actorType?: CapabilityActorType;
  validFrom?: string;
  validUntil?: string;
}

export interface IdempotencyRecord {
  ownerUserId: string;
  status: number;
  body: unknown;
  createdAt: string;
}

export class InMemoryClinkStore {
  private commitments = new Map<string, Commitment>();
  private expectations = new Map<string, Expectation>();
  private expectationShareTokens = new Map<string, string>();
  private dependencies = new Map<string, DependencyEdge>();
  private capabilities = new Map<string, RequiredCapability>();
  private assignments = new Map<string, CapabilityAssignment>();
  private capabilityNodes = new Map<string, CapabilityNode>();
  private capabilityDependencies = new Map<string, CapabilityDependency>();
  private shareTokens = new Map<string, string>();
  private evidence = new Map<string, Evidence>();
  private disputes = new Map<string, Dispute>();
  private settlements = new Map<string, Settlement>();
  private evidenceDownloadTokens = new Map<string, { evidenceId: string; commitmentId: string; expiresAt: string }>();
  private idempotency = new Map<string, IdempotencyRecord>();

  async hydrate(bucket?: R2Bucket) {
    if (!bucket) return;
    const object = await bucket.get("clink/state-v1.json");
    if (!object) return;
    const snapshot = await object.json<{
      commitments: Commitment[];
      expectations?: Expectation[];
      expectationShareTokens?: Array<[string, string]>;
      dependencies?: DependencyEdge[];
      capabilities?: RequiredCapability[];
      assignments?: CapabilityAssignment[];
      capabilityNodes?: CapabilityNode[];
      capabilityDependencies?: CapabilityDependency[];
      shareTokens: Array<[string, string]>;
      evidence: Evidence[];
      disputes: Dispute[];
      settlements: Settlement[];
      evidenceDownloadTokens?: Array<[string, { evidenceId: string; commitmentId: string; expiresAt: string }]>;
      idempotency?: Array<[string, IdempotencyRecord]>;
    }>();
    this.commitments = new Map(snapshot.commitments.map((item) => [item.id, { ...item, transitions: item.transitions || [] }]));
    this.expectations = new Map((snapshot.expectations || []).map((item) => [item.id, { ...item, transitions: item.transitions || [] }]));
    this.expectationShareTokens = new Map(snapshot.expectationShareTokens || []);
    this.dependencies = new Map((snapshot.dependencies || []).map((item) => [item.id, item]));
    this.capabilities = new Map((snapshot.capabilities || []).map((item) => [item.id, item]));
    this.assignments = new Map((snapshot.assignments || []).map((item) => [item.id, item]));
    this.capabilityNodes = new Map((snapshot.capabilityNodes || []).map((item) => [item.id, item]));
    this.capabilityDependencies = new Map((snapshot.capabilityDependencies || []).map((item) => [item.id, item]));
    this.shareTokens = new Map(snapshot.shareTokens);
    this.evidence = new Map(snapshot.evidence.map((item) => [item.id, item]));
    this.disputes = new Map(snapshot.disputes.map((item) => [item.id, item]));
    this.settlements = new Map(snapshot.settlements.map((item) => [item.id, item]));
    this.evidenceDownloadTokens = new Map(snapshot.evidenceDownloadTokens || []);
    this.idempotency = new Map(snapshot.idempotency || []);
  }

  async persist(bucket?: R2Bucket) {
    if (!bucket) return;
    await bucket.put("clink/state-v1.json", JSON.stringify({
      commitments: [...this.commitments.values()],
      expectations: [...this.expectations.values()],
      expectationShareTokens: [...this.expectationShareTokens.entries()],
      dependencies: [...this.dependencies.values()],
      capabilities: [...this.capabilities.values()],
      assignments: [...this.assignments.values()],
      capabilityNodes: [...this.capabilityNodes.values()],
      capabilityDependencies: [...this.capabilityDependencies.values()],
      shareTokens: [...this.shareTokens.entries()],
      evidence: [...this.evidence.values()],
      disputes: [...this.disputes.values()],
      settlements: [...this.settlements.values()],
      evidenceDownloadTokens: [...this.evidenceDownloadTokens.entries()],
      idempotency: [...this.idempotency.entries()],
    }), { httpMetadata: { contentType: "application/json" } });
  }

  list(ownerUserId: string): Commitment[] { return [...this.commitments.values()].filter((item) => item.ownerUserId === ownerUserId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  getIdempotency(key: string, ownerUserId: string) {
    const scopedKey = `${ownerUserId}:${key}`;
    const item = this.idempotency.get(scopedKey);
    if (!item) return undefined;
    if (Date.now() - new Date(item.createdAt).getTime() > 24 * 60 * 60 * 1000) { this.idempotency.delete(scopedKey); return undefined; }
    return item;
  }
  setIdempotency(key: string, ownerUserId: string, status: number, body: unknown) { this.idempotency.set(`${ownerUserId}:${key}`, { ownerUserId, status, body, createdAt: now() }); }
  listLegacy(): Commitment[] { return [...this.commitments.values()].filter((item) => !item.ownerUserId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  claimLegacy(ownerUserId: string) {
    const claimed = this.listLegacy();
    claimed.forEach((item) => { item.ownerUserId = ownerUserId; });
    return claimed;
  }
  get(id: string): Commitment | undefined { return this.commitments.get(id); }
  listCapabilities(commitmentId: string): RequiredCapability[] { return [...this.capabilities.values()].filter((item) => item.commitmentId === commitmentId); }
  listAssignments(commitmentId: string): CapabilityAssignment[] { return [...this.assignments.values()].filter((item) => item.commitmentId === commitmentId); }
  listCapabilityNodes(ownerUserId: string): CapabilityNode[] { return [...this.capabilityNodes.values()].filter((item) => item.ownerUserId === ownerUserId && item.status !== "retired").sort((a, b) => a.name.localeCompare(b.name)); }
  getCapabilityNode(id: string, ownerUserId: string) { const node = this.capabilityNodes.get(id); if (!node || node.ownerUserId !== ownerUserId) throw new ClinkDomainError("CLINK_FORBIDDEN", "Capability is outside this workspace", 403); return node; }
  createCapabilityNode(input: CreateCapabilityNodeInput) {
    if (!input.name?.trim()) throw new Error("Capability name is required");
    if (input.parentCapabilityId) {
      const parent = this.capabilityNodes.get(input.parentCapabilityId);
      if (!parent || parent.ownerUserId !== input.ownerUserId) throw new Error("Parent capability not found in this workspace");
    }
    const timestamp = now();
    const node: CapabilityNode = { id: createId("clcapnode"), ownerUserId: input.ownerUserId, name: input.name.trim(), description: input.description, parentCapabilityId: input.parentCapabilityId, actorType: input.actorType || "business_unit", status: "available", validFrom: input.validFrom, validUntil: input.validUntil, createdAt: timestamp, updatedAt: timestamp };
    this.capabilityNodes.set(node.id, node);
    return node;
  }
  updateCapabilityAvailability(id: string, ownerUserId: string, status: CapabilityNode["status"], availabilityNote?: string) {
    const node = this.getCapabilityNode(id, ownerUserId); node.status = status; node.availabilityNote = availabilityNote; node.updatedAt = now(); return node;
  }
  addCapabilityDependency(capabilityId: string, ownerUserId: string, dependsOnCapabilityId: string, relation: CapabilityDependency["relation"], note?: string) {
    const node = this.getCapabilityNode(capabilityId, ownerUserId); const dependency = this.getCapabilityNode(dependsOnCapabilityId, ownerUserId);
    if (node.id === dependency.id) throw new Error("A capability cannot depend on itself");
    const item: CapabilityDependency = { id: createId("clcapdep"), ownerUserId, capabilityId, dependsOnCapabilityId, relation, note, createdAt: now() };
    this.capabilityDependencies.set(item.id, item); return item;
  }
  listCapabilityDependencies(ownerUserId: string) { return [...this.capabilityDependencies.values()].filter((item) => item.ownerUserId === ownerUserId); }
  capabilityHealth(ownerUserId: string) {
    return this.listCapabilityNodes(ownerUserId).map((node) => {
      const required = [...this.capabilities.values()].filter((item) => item.registryCapabilityId === node.id);
      const assignments = required.flatMap((item) => this.listAssignments(item.commitmentId).filter((assignment) => assignment.requirementId === item.id));
      return { capabilityId: node.id, name: node.name, status: node.status, requiredCount: required.length, assignedCount: assignments.filter((item) => item.status === "assigned" || item.status === "completed").length, blockedCount: assignments.filter((item) => item.status === "blocked").length, dependencyCount: this.listCapabilityDependencies(ownerUserId).filter((item) => item.capabilityId === node.id || item.dependsOnCapabilityId === node.id).length };
    });
  }
  listExpectations(ownerUserId: string): Expectation[] { return [...this.expectations.values()].filter((item) => item.ownerUserId === ownerUserId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  getExpectation(id: string): Expectation | undefined { return this.expectations.get(id); }
  listDependencies(ownerUserId: string) { return [...this.dependencies.values()].filter((item) => item.ownerUserId === ownerUserId && item.status === "active"); }
  createDependency(input: CreateDependencyInput): DependencyEdge {
    if (!input.fromPartyId || !input.toPartyId || input.fromPartyId === input.toPartyId) throw new Error("A dependency requires two different parties");
    const edge: DependencyEdge = { id: createId("cldep"), ...input, status: "active", createdAt: now() };
    this.dependencies.set(edge.id, edge); return edge;
  }
  assertExpectationOwner(id: string, ownerUserId: string) {
    const expectation = this.requireExpectation(id);
    if (expectation.ownerUserId !== ownerUserId) throw new ClinkDomainError("CLINK_FORBIDDEN", "Expectation is outside this workspace", 403);
    return expectation;
  }
  getByShareToken(token: string): Commitment | undefined {
    const id = this.shareTokens.get(token);
    const commitment = id ? this.get(id) : undefined;
    if (commitment?.shareExpiresAt && new Date(commitment.shareExpiresAt).getTime() < Date.now()) return undefined;
    return commitment;
  }

  create(input: CreateCommitmentInput): Commitment {
    if (!input.counterpartyPartyId || !input.item || input.quantity <= 0 || input.price < 0 || !input.deadline || !input.acceptanceCriteria) {
      throw new Error("Missing or invalid commitment fields");
    }
    const id = createId("cl");
    const version: CommitmentVersion = {
      id: createId("clv"), number: 1, item: input.item, quantity: input.quantity, unit: input.unit,
      price: input.price, currency: input.currency || "BDT", deadline: input.deadline,
      location: input.location, paymentTerms: input.paymentTerms, acceptanceCriteria: input.acceptanceCriteria,
      createdAt: now(), createdBy: input.creatorPartyId,
    };
    const commitment: Commitment = {
      id, ownerUserId: input.ownerUserId, creatorPartyId: input.creatorPartyId, counterpartyPartyId: input.counterpartyPartyId,
      status: "draft", currentVersionId: version.id, versions: [version], events: [], createdAt: now(),
      aggregateVersion: 0, transitions: [], requiredCapabilities: [], assignments: [], sourceContext: input.sourceContext,
    };
    this.commitments.set(id, commitment);
    this.addEvent(commitment, "commitment.created", input.creatorPartyId, { versionId: version.id });
    this.addTransition(commitment.transitions, "commitment", commitment.id, "unknown", "draft", input.creatorPartyId, {});
    return commitment;
  }

  addRequiredCapability(id: string, actorPartyId: string, input: CreateCapabilityInput, ownerUserId?: string) {
    const commitment = this.require(id);
    if (!input.type || !input.description) throw new Error("Capability type and description are required");
    if (input.quantity !== undefined && input.quantity <= 0) throw new Error("Capability quantity must be greater than zero");
    if (input.registryCapabilityId && (!this.capabilityNodes.has(input.registryCapabilityId) || (ownerUserId && this.capabilityNodes.get(input.registryCapabilityId)?.ownerUserId !== ownerUserId))) throw new Error("Registry capability not found");
    const capability: RequiredCapability = { id: createId("clcap"), commitmentId: id, ...input, status: "open", createdBy: actorPartyId, createdAt: now() };
    this.capabilities.set(capability.id, capability);
    commitment.requiredCapabilities = [...(commitment.requiredCapabilities || []), capability];
    this.addEvent(commitment, "capability.required", actorPartyId, { capabilityId: capability.id });
    return capability;
  }

  assignCapability(id: string, actorPartyId: string, input: CreateAssignmentInput) {
    const commitment = this.require(id);
    const requirement = this.capabilities.get(input.requirementId);
    if (!requirement || requirement.commitmentId !== id) throw new Error("Capability requirement not found");
    if (!input.actorId || !input.actorType) throw new Error("An actor and actor type are required");
    if (["fulfilled", "cancelled"].includes(requirement.status)) throw new Error("This capability requirement is no longer assignable");
    const assignment: CapabilityAssignment = { id: createId("clasg"), commitmentId: id, ...input, status: "assigned", assignedBy: actorPartyId, assignedAt: now() };
    this.assignments.set(assignment.id, assignment);
    requirement.status = "assigned";
    commitment.assignments = [...(commitment.assignments || []), assignment];
    this.addEvent(commitment, "capability.assigned", actorPartyId, { assignmentId: assignment.id, requirementId: requirement.id, actorId: input.actorId });
    return assignment;
  }

  blockAssignment(id: string, assignmentId: string, actorPartyId: string, note?: string) {
    const commitment = this.require(id);
    const assignment = this.assignments.get(assignmentId);
    if (!assignment || assignment.commitmentId !== id) throw new Error("Capability assignment not found");
    if (["completed", "cancelled", "reassigned"].includes(assignment.status)) throw new Error("This assignment cannot be blocked");
    assignment.status = "blocked"; assignment.blockedAt = now(); assignment.note = note;
    const requirement = this.capabilities.get(assignment.requirementId);
    if (requirement) requirement.status = "blocked";
    commitment.assignments = [...(commitment.assignments || []).filter((item) => item.id !== assignment.id), assignment];
    commitment.requiredCapabilities = [...(commitment.requiredCapabilities || []).filter((item) => item.id !== requirement?.id), ...(requirement ? [requirement] : [])];
    this.addEvent(commitment, "capability.blocked", actorPartyId, { assignmentId, note });
    return assignment;
  }

  operationalSummary(ownerUserId: string) {
    const signals: SignificanceSignal[] = [];
    const commitments = this.list(ownerUserId);
    const expectations = this.listExpectations(ownerUserId);
    const add = (level: SignificanceSignal["level"], title: string, detail: string, sourceType: SignificanceSignal["sourceType"], sourceId: string, reasons: string[]) => signals.push({ id: createId("clsig"), level, title, detail, sourceType, sourceId, reasons, createdAt: now() });
    for (const expectation of expectations) {
      if (expectation.status === "sent") add("action_worthy", "Response still needed", `${expectation.item} · ${expectation.quantity} ${expectation.unit}`, "expectation", expectation.id, ["Counterparty response is pending", expectation.priority === "urgent" ? "Urgent priority" : "Open expectation"]);
      if (expectation.status === "responded" && expectation.response?.type === "can_with_changes") add("needs_review", "Capability terms changed", `${expectation.item} · review the proposed terms`, "expectation", expectation.id, ["Counterparty proposed changes"]);
    }
    for (const commitment of commitments) {
      const caps = this.listCapabilities(commitment.id);
      const assignments = this.listAssignments(commitment.id);
      if (commitment.status === "disputed") add("high_impact", "Dispute needs attention", "A shared outcome is contested", "commitment", commitment.id, ["Counterparty disagreement", "Outcome variance may be unresolved"]);
      if (commitment.status === "sent") add("needs_review", "Commitment awaiting response", "The counterparty has not accepted the shared terms", "commitment", commitment.id, ["Acceptance is not recorded"]);
      if (caps.some((cap) => cap.status === "blocked") || assignments.some((assignment) => assignment.status === "blocked")) add("blocking", "Capability is blocked", "An assigned capability cannot currently proceed", "commitment", commitment.id, ["Assignment marked blocked", "Owner review required"]);
      if (caps.some((cap) => cap.status === "open")) add("needs_review", "Capability is unassigned", "A required capability has no assigned actor", "commitment", commitment.id, ["No actor is assigned", "Execution ownership is unclear"]);
    }
    const weight: Record<string, number> = { irreversible_risk: 6, high_impact: 5, blocking: 4, action_worthy: 3, needs_review: 2, informational: 1 };
    signals.sort((a, b) => weight[b.level] - weight[a.level]);
    return {
      signals,
      metrics: {
        openClaims: expectations.filter((item) => ["draft", "sent", "responded"].includes(item.status)).length,
        unassignedCapabilities: commitments.reduce((sum, item) => sum + this.listCapabilities(item.id).filter((cap) => cap.status === "open").length, 0),
        blockedAssignments: commitments.reduce((sum, item) => sum + this.listAssignments(item.id).filter((assignment) => assignment.status === "blocked").length, 0),
        unresolvedDisputes: commitments.filter((item) => item.status === "disputed").length,
      },
    };
  }

  realityGraph(ownerUserId: string) {
    const nodes: Array<{ id: string; type: string; label: string; status?: string }> = [];
    const edges: Array<{ id: string; from: string; to: string; relation: string }> = [];
    const commitments = this.list(ownerUserId);
    const expectations = this.listExpectations(ownerUserId);
    expectations.forEach((item) => nodes.push({ id: item.id, type: "expectation", label: `${item.quantity} ${item.unit} ${item.item}`, status: item.status }));
    commitments.forEach((item) => {
      nodes.push({ id: item.id, type: "commitment", label: `${item.counterpartyPartyId} · ${item.status}`, status: item.status });
      if (item.sourceExpectationId) edges.push({ id: createId("clgedge"), from: item.sourceExpectationId, to: item.id, relation: "converted_into" });
      this.listCapabilities(item.id).forEach((capability) => {
        nodes.push({ id: capability.id, type: "capability", label: capability.description, status: capability.status });
        edges.push({ id: createId("clgedge"), from: item.id, to: capability.id, relation: "requires" });
      });
      this.listAssignments(item.id).forEach((assignment) => {
        nodes.push({ id: assignment.id, type: "assignment", label: `${assignment.actorType} · ${assignment.actorId}`, status: assignment.status });
        edges.push({ id: createId("clgedge"), from: assignment.requirementId, to: assignment.id, relation: "assigned_to" });
      });
    });
    this.listDependencies(ownerUserId).forEach((edge) => edges.push({ id: edge.id, from: edge.fromPartyId, to: edge.toPartyId, relation: edge.relation }));
    return { nodes, edges, visibility: "private" as const };
  }

  createExpectation(input: CreateExpectationInput): Expectation {
    if (!input.counterpartyPartyId || !input.item || input.quantity <= 0 || !input.neededBy || !input.acceptanceCriteria) throw new Error("Missing or invalid expectation fields");
    const expectation: Expectation = {
      id: createId("clex"), ownerUserId: input.ownerUserId, ownerPartyId: input.ownerPartyId, counterpartyPartyId: input.counterpartyPartyId,
      item: input.item, quantity: input.quantity, unit: input.unit || "unit", neededBy: input.neededBy, location: input.location,
      acceptanceCriteria: input.acceptanceCriteria, budget: input.budget, currency: input.currency || "BDT", flexibility: input.flexibility,
      priority: input.priority || "standard", status: "draft", createdAt: now(), updatedAt: now(), events: [], transitions: [],
    };
    this.expectations.set(expectation.id, expectation);
    this.addExpectationEvent(expectation, "expectation.created", input.ownerPartyId, {});
    this.addTransition(expectation.transitions, "expectation", expectation.id, "unknown", "expected", input.ownerPartyId, {});
    return expectation;
  }

  sendExpectation(id: string) {
    const expectation = this.requireExpectation(id);
    const previousStatus = expectation.status;
    if (!['draft', 'responded'].includes(expectation.status)) throw new Error("This expectation cannot be sent at its current stage");
    if (expectation.shareToken) this.expectationShareTokens.delete(expectation.shareToken);
    const token = crypto.randomUUID().replaceAll("-", "");
    expectation.shareToken = token;
    expectation.shareExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    expectation.status = "sent";
    expectation.updatedAt = now();
    this.expectationShareTokens.set(token, id);
    this.addExpectationEvent(expectation, "expectation.sent", expectation.ownerPartyId, { tokenCreated: true });
    this.addTransition(expectation.transitions, "expectation", expectation.id, previousStatus === "responded" ? "capability_received" : "expected", "response_requested", expectation.ownerPartyId, {});
    return { token, expiresAt: expectation.shareExpiresAt };
  }

  getExpectationByShareToken(token: string) {
    const id = this.expectationShareTokens.get(token);
    const expectation = id ? this.getExpectation(id) : undefined;
    if (expectation?.shareExpiresAt && new Date(expectation.shareExpiresAt).getTime() < Date.now()) return undefined;
    return expectation;
  }

  respondExpectationByToken(token: string, input: CapabilityResponseInput) {
    const expectation = this.getExpectationByShareToken(token);
    if (!expectation) throw new ClinkDomainError("LINK_EXPIRED_OR_REVOKED", "This expectation link is unavailable", 410);
    if (!['sent', 'responded'].includes(expectation.status)) throw new Error("This expectation is no longer accepting responses");
    if (!input.type) throw new Error("A capability response type is required");
    const response: CapabilityResponse = { id: createId("cler"), expectationId: expectation.id, responderPartyId: expectation.counterpartyPartyId, ...input, createdAt: now() };
    expectation.response = response;
    expectation.status = "responded";
    expectation.updatedAt = now();
    this.addExpectationEvent(expectation, input.type === "cannot_fulfill" ? "capability.declined" : input.type === "can_with_changes" ? "capability.change_proposed" : "capability.response_submitted", expectation.counterpartyPartyId, { responseId: response.id, type: input.type });
    this.addTransition(expectation.transitions, "capability", response.id, "response_requested", "capability_received", expectation.counterpartyPartyId, { responseType: input.type });
    return expectation;
  }

  convertExpectationToCommitment(id: string, ownerUserId: string) {
    const expectation = this.assertExpectationOwner(id, ownerUserId);
    if (expectation.status !== "responded" || !expectation.response || expectation.response.type === "cannot_fulfill") throw new Error("A responding capability is required before conversion");
    const terms = { quantity: expectation.response.proposedTerms?.quantity ?? expectation.quantity, unit: expectation.response.proposedTerms?.unit ?? expectation.unit, price: expectation.response.proposedTerms?.price ?? expectation.budget ?? 0, currency: expectation.response.proposedTerms?.currency ?? expectation.currency, deadline: expectation.response.proposedTerms?.neededBy ?? expectation.neededBy, location: expectation.response.proposedTerms?.location ?? expectation.location };
    const commitment = this.create({ ownerUserId, creatorPartyId: expectation.ownerPartyId, counterpartyPartyId: expectation.counterpartyPartyId, item: expectation.item, quantity: terms.quantity, unit: terms.unit, price: terms.price, currency: terms.currency, deadline: terms.deadline, location: terms.location, paymentTerms: expectation.response.conditions, acceptanceCriteria: expectation.acceptanceCriteria });
    commitment.sourceExpectationId = expectation.id;
    commitment.capabilityResponseId = expectation.response.id;
    commitment.alignmentId = createId("clal");
    expectation.status = "converted";
    expectation.updatedAt = now();
    this.addExpectationEvent(expectation, "expectation.aligned", expectation.ownerPartyId, { responseId: expectation.response.id, alignmentId: commitment.alignmentId });
    this.addExpectationEvent(expectation, "expectation.converted_to_commitment", expectation.ownerPartyId, { commitmentId: commitment.id });
    this.addTransition(expectation.transitions, "expectation", expectation.id, "capability_received", "committed", expectation.ownerPartyId, { commitmentId: commitment.id });
    return commitment;
  }

  withdrawExpectation(id: string, ownerUserId: string) {
    const expectation = this.assertExpectationOwner(id, ownerUserId);
    const previousStatus = expectation.status;
    if (["converted", "withdrawn", "expired"].includes(expectation.status)) throw new Error("This expectation cannot be withdrawn");
    expectation.status = "withdrawn"; expectation.updatedAt = now();
    if (expectation.shareToken) this.expectationShareTokens.delete(expectation.shareToken);
    delete expectation.shareToken; delete expectation.shareExpiresAt;
    this.addExpectationEvent(expectation, "expectation.withdrawn", expectation.ownerPartyId, {});
    this.addTransition(expectation.transitions, "expectation", expectation.id, previousStatus, "withdrawn", expectation.ownerPartyId, {});
    return expectation;
  }

  assertOwner(id: string, ownerUserId: string) {
    const commitment = this.require(id);
    if (commitment.ownerUserId !== ownerUserId) throw new ClinkDomainError("CLINK_FORBIDDEN", "Commitment is outside this workspace", 403);
    return commitment;
  }

  send(id: string, actorPartyId: string) { return this.transition(id, "sent", "commitment.sent", actorPartyId); }
  accept(id: string, actorPartyId: string) { const result = this.transition(id, "accepted", "commitment.accepted", actorPartyId); result.acceptedAt = now(); return result; }
  reject(id: string, actorPartyId: string, reason?: string) { return this.transition(id, "rejected", "commitment.rejected", actorPartyId, { reason }); }
  start(id: string, actorPartyId: string, payload: Record<string, unknown> = {}) { return this.transition(id, "in_progress", "commitment.started", actorPartyId, payload); }
  requestChange(id: string, actorPartyId: string, reason: string) {
    const commitment = this.require(id);
    if (!["sent", "accepted"].includes(commitment.status)) throw new Error("A change request requires a sent or accepted commitment");
    this.addEvent(commitment, "commitment.change_requested", actorPartyId, { reason });
    return commitment;
  }
  amend(id: string, actorPartyId: string, input: AmendCommitmentInput) {
    const commitment = this.require(id);
    if (!["sent", "accepted"].includes(commitment.status)) throw new Error("Only sent or accepted commitments can be amended");
    const current = commitment.versions.find((version) => version.id === commitment.currentVersionId)!;
    const next = { ...current, ...input };
    if (!input.reason || !assertMaterialChange(current, next)) throw new Error("An amendment requires a reason and a material change");
    if (next.quantity <= 0 || next.price < 0 || !next.deadline || !next.acceptanceCriteria) throw new Error("Invalid amended commitment terms");
    const version: CommitmentVersion = { ...next, id: createId("clv"), number: current.number + 1, previousVersionId: current.id, createdAt: now(), createdBy: actorPartyId };
    commitment.versions.push(version); commitment.currentVersionId = version.id;
    if (commitment.status === "accepted") commitment.status = "sent";
    this.addEvent(commitment, "commitment.amended", actorPartyId, { versionId: version.id, reason: input.reason, requiresAcceptance: true });
    return commitment;
  }
  fulfill(id: string, actorPartyId: string, payload: Record<string, unknown> = {}) { const result = this.transition(id, "fulfilled", "commitment.fulfilled", actorPartyId, payload); result.fulfilledAt = now(); return result; }
  confirm(id: string, actorPartyId: string, accepted: boolean, payload: Record<string, unknown> = {}) {
    const partial = payload.partial === true;
    const status: CommitmentStatus = accepted ? (partial ? "partially_accepted" : "accepted_by_counterparty") : "disputed";
    const type: CommitmentEventType = accepted ? (partial ? "commitment.partially_accepted" : "delivery.confirmed") : "dispute.opened";
    return this.transition(id, status, type, actorPartyId, payload);
  }
  close(id: string, actorPartyId: string, reason: string) { const result = this.transition(id, "closed", "commitment.closed", actorPartyId, { reason }); result.closedAt = now(); return result; }

  addEvidence(id: string, uploaderPartyId: string, input: Partial<Evidence>) {
    const commitment = this.require(id);
    const item: Evidence = { id: createId("clev"), commitmentId: id, uploaderPartyId, type: input.type || "note", description: input.description, objectKey: input.objectKey, visibility: input.visibility || "shared", createdAt: now() };
    this.evidence.set(item.id, item);
    this.addEvent(commitment, "evidence.added", uploaderPartyId, { evidenceId: item.id, type: item.type });
    return item;
  }

  listEvidence(id: string) { return [...this.evidence.values()].filter((item) => item.commitmentId === id); }

  createEvidenceDownloadToken(commitmentId: string, evidenceId: string) {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence || evidence.commitmentId !== commitmentId || !evidence.objectKey) throw new Error("Evidence file not found");
    const token = createId("cled").replace("cled_", "");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    this.evidenceDownloadTokens.set(token, { evidenceId, commitmentId, expiresAt });
    return { token, expiresAt };
  }

  resolveEvidenceDownloadToken(token: string) {
    const record = this.evidenceDownloadTokens.get(token);
    if (!record || new Date(record.expiresAt).getTime() < Date.now()) { this.evidenceDownloadTokens.delete(token); return undefined; }
    const evidence = this.evidence.get(record.evidenceId);
    return evidence?.objectKey ? { ...record, evidence } : undefined;
  }

  openDispute(id: string, openedBy: string, issueType: string, claim: Record<string, unknown>) {
    const commitment = this.require(id);
    if (!["fulfilled", "partially_accepted", "accepted_by_counterparty"].includes(commitment.status)) throw new Error("A dispute requires a fulfilled commitment");
    const dispute: Dispute = { id: createId("cld"), commitmentId: id, openedBy, issueType, claim, status: "open", responses: [], createdAt: now() };
    this.disputes.set(dispute.id, dispute);
    this.transition(id, "disputed", "dispute.opened", openedBy, { disputeId: dispute.id, issueType });
    return dispute;
  }

  respondDispute(disputeId: string, partyId: string, message: string) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    dispute.responses.push({ partyId, message, createdAt: now() }); dispute.status = "responded";
    this.addEvent(this.require(dispute.commitmentId), "dispute.responded", partyId, { disputeId, message });
    return dispute;
  }

  resolveDispute(disputeId: string, partyId: string, resolution: Record<string, unknown>) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    dispute.status = "resolved"; dispute.resolution = resolution;
    this.addEvent(this.require(dispute.commitmentId), "dispute.resolved", partyId, { disputeId, resolution });
    return dispute;
  }

  recordSettlement(id: string, input: Omit<Settlement, "id" | "commitmentId" | "recordedAt">, actorPartyId: string) {
    const commitment = this.require(id);
    if (!["accepted_by_counterparty", "partially_accepted", "disputed"].includes(commitment.status)) throw new Error("Settlement is not available for this commitment");
    const settlement: Settlement = { ...input, id: createId("cls"), commitmentId: id, recordedAt: now() };
    this.settlements.set(settlement.id, settlement);
    if (settlement.status === "paid") this.transition(id, "settled", "settlement.recorded", actorPartyId, settlement as unknown as Record<string, unknown>);
    else this.addEvent(commitment, "settlement.recorded", actorPartyId, settlement as unknown as Record<string, unknown>);
    return settlement;
  }

  listDisputes(id: string) { return [...this.disputes.values()].filter((item) => item.commitmentId === id); }
  getDispute(id: string) { return this.disputes.get(id); }
  listSettlements(id: string) { return [...this.settlements.values()].filter((item) => item.commitmentId === id); }

  createShare(id: string) {
    const commitment = this.require(id);
    if (commitment.status === "draft") this.transition(id, "sent", "commitment.sent", commitment.creatorPartyId);
    if (commitment.shareToken) this.shareTokens.delete(commitment.shareToken);
    const token = crypto.randomUUID().replaceAll("-", "");
    commitment.shareToken = token;
    commitment.shareExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    this.shareTokens.set(token, id);
    this.addEvent(commitment, "commitment.sent", commitment.creatorPartyId, { tokenCreated: true });
    return { token, expiresAt: commitment.shareExpiresAt };
  }

  revokeShare(id: string) {
    const commitment = this.require(id);
    if (commitment.shareToken) this.shareTokens.delete(commitment.shareToken);
    delete commitment.shareToken;
    delete commitment.shareExpiresAt;
    this.addEvent(commitment, "permission.revoked", commitment.creatorPartyId, { shareRevoked: true });
    return { revoked: true };
  }

  private transition(id: string, to: CommitmentStatus, eventType: CommitmentEventType, actorPartyId: string, payload: Record<string, unknown> = {}) {
    const commitment = this.require(id);
    const from = commitment.status;
    assertTransition(commitment.status, to);
    commitment.status = to;
    commitment.aggregateVersion += 1;
    this.addEvent(commitment, eventType, actorPartyId, payload);
    this.addTransition(commitment.transitions, "commitment", commitment.id, from, to, actorPartyId, payload);
    return commitment;
  }

  private addEvent(commitment: Commitment, type: CommitmentEventType, actorPartyId: string, payload: Record<string, unknown>) {
    commitment.events.push({ id: createId("cle"), type, actorPartyId, occurredAt: now(), payload });
    commitment.aggregateVersion += 1;
  }

  private require(id: string): Commitment {
    const commitment = this.get(id);
    if (!commitment) throw new Error("Commitment not found");
    return commitment;
  }

  private requireExpectation(id: string): Expectation {
    const expectation = this.getExpectation(id);
    if (!expectation) throw new Error("Expectation not found");
    return expectation;
  }

  private addExpectationEvent(expectation: Expectation, type: ExpectationEvent["type"], actorPartyId: string, payload: Record<string, unknown>) {
    expectation.events.push({ id: createId("clee"), type, actorPartyId, occurredAt: now(), payload });
  }

  private addTransition(target: RealityTransition[], subjectType: RealityTransition["subjectType"], subjectId: string, fromState: string, toState: string, actorPartyId: string, payload: Record<string, unknown>) {
    target.push({ id: createId("clrt"), subjectType, subjectId, fromState, toState, actorPartyId, occurredAt: now(), payload });
  }
}
