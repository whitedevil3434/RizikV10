with open('src/main.tsx', 'w') as f:
    f.write("""import { ArrowUpRight, Minimize2, Package, Sparkles, CheckCircle2, Send, Clock, Inbox, Box, AlertTriangle, ShieldCheck, Users, Eye } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { 
  listCommitments, 
  listExpectations, 
  createExpectation, 
  type ClinkApiExpectation 
} from "./api/clink";
import { motion, AnimatePresence } from "framer-motion";

type Status = "accepted" | "pending" | "in_progress" | "fulfilled" | "partially_accepted" | "disputed" | "settled" | "completed" | "draft" | "sent";
type Commitment = { id: string; counterparty: string; type: string; summary: string; amount: string; due: string; status: Status; updated: string; initials: string };
type Expectation = ClinkApiExpectation;
type Perspective = "actor" | "responder";

// ─────────────────────────────────────────────────────────────
// SAMPLE INTENTS that cycle in the empty composer
// ─────────────────────────────────────────────────────────────
const SAMPLE_INTENTS = [
  "I need 500kg of fresh mangoes by Friday...",
  "Source 20 laptops for our new office...",
  "Find a logistics partner for Chittagong route...",
  "Need raw cotton 2 tons delivered next week...",
];

function App() {
  const [expectations, setExpectations] = useState<Expectation[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [perspective, setPerspective] = useState<Perspective>("actor");
  const [hintIndex, setHintIndex] = useState(0);

  // Cycle sample hints when canvas is empty
  useEffect(() => {
    const t = setInterval(() => setHintIndex(i => (i + 1) % SAMPLE_INTENTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setExpectations([
        {
          id: "exp_1",
          status: "sent", ownerPartyId: "Your Business", counterpartyPartyId: "Logistics Partner",
          item: "1000kg Fresh Apples", quantity: 1000, unit: "kg", neededBy: "2026-08-30",
          acceptanceCriteria: "Grade A", currency: "BDT", createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { state: { status: "draft", quantity: 500, item: "Apples", subtitle: "Unknown" }, date: "Aug 20", note: "Draft created" },
            { state: { status: "pending", quantity: 1000, item: "Premium Apples", subtitle: "Logistics Partner" }, date: "Aug 21", note: "Updated requirements" },
            { state: { status: "sent", quantity: 1000, item: "Fresh Apples", subtitle: "Logistics Partner" }, date: "Today", note: "Sent to partner" }
          ]
        } as unknown as Expectation,
        {
          id: "exp_2", status: "draft", ownerPartyId: "Your Business", counterpartyPartyId: "Supplier X",
          item: "Office Supplies", quantity: 1, unit: "batch", neededBy: "2026-09-01",
          acceptanceCriteria: "Standard", currency: "BDT", createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { state: { status: "draft", quantity: 1, item: "Office Supplies", subtitle: "Supplier X" }, date: "Today", note: "Draft created" }
          ]
        } as unknown as Expectation,
      ]);
      setCommitments([
        // Phase 2: Rich commitment cards with distinct statuses
        {
          id: "com_1", status: "in_progress", counterparty: "Client Y", type: "Supply",
          summary: "Deliver 50 Laptops", amount: "৳250,000", due: "Aug 28", updated: "2h ago", initials: "CY",
          history: [
            { state: { status: "accepted", summary: "Deliver 50 Laptops", counterparty: "Client Y" }, date: "Aug 22", note: "Commitment accepted" },
            { state: { status: "in_progress", summary: "Deliver 50 Laptops", counterparty: "Client Y" }, date: "Aug 23", note: "Execution started" },
          ]
        } as unknown as Commitment,
        {
          id: "com_2", status: "disputed", counterparty: "Rahman Traders", type: "Supply",
          summary: "500 bags cement - quantity mismatch", amount: "৳75,000", due: "Overdue", updated: "1d ago", initials: "RT",
          history: [
            { state: { status: "in_progress", summary: "500 bags cement", counterparty: "Rahman Traders" }, date: "Aug 18", note: "In execution" },
            { state: { status: "disputed", summary: "500 bags cement - quantity mismatch", counterparty: "Rahman Traders" }, date: "Aug 21", note: "Dispute raised" },
          ]
        } as unknown as Commitment,
        {
          id: "com_3", status: "fulfilled", counterparty: "Tech Importers BD", type: "Supply",
          summary: "20 units keyboards delivered", amount: "৳18,000", due: "Closed", updated: "3d ago", initials: "TI",
          history: [
            { state: { status: "fulfilled", summary: "20 units keyboards delivered", counterparty: "Tech Importers BD" }, date: "Aug 20", note: "Fulfilled" },
          ]
        } as unknown as Commitment,
      ]);
    });
  }, []);

  async function handleCompose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const intent = String(data.get("intent") || "").trim();
    if (!intent) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    setIsCompiling(true);
    (event.target as HTMLFormElement).reset();

    // Mock Compiler: parse quantity/unit/item from natural language
    const qtyMatch = intent.match(/(\\d+)\\s*(kg|pcs|units|tons|batch|lbs|unit|bags)?/i);
    let q = 1, u = "unit", it = intent;
    if (qtyMatch) {
      q = parseInt(qtyMatch[1]);
      u = qtyMatch[2] || "unit";
      it = intent.replace(qtyMatch[0], "").replace(/I need|we need|deliver|of/gi, "").trim();
      it = it.charAt(0).toUpperCase() + it.slice(1);
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      const mockCreated = {
        id: "exp_" + Date.now(), status: "draft",
        ownerPartyId: "Your Business", counterpartyPartyId: "Awaiting match...",
        item: it || intent, quantity: q, unit: u,
        neededBy: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        acceptanceCriteria: "Auto-generated by Compiler", currency: "BDT",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        history: [
          { state: { status: "draft", quantity: q, unit: u, item: it || intent, subtitle: "Awaiting match..." }, date: "Just now", note: "Intent compiled" }
        ]
      } as unknown as Expectation;
      setExpectations(prev => [mockCreated, ...prev]);
    } catch (e) { console.error(e); }
    finally { setIsCompiling(false); }
  }

  const allWork = [...expectations, ...commitments];
  const isEmpty = allWork.length === 0 && !isCompiling;

  return (
    <div className="living-surface">
      {/* ── Phase 3: Perspective Switcher ── */}
      <div className="perspective-bar">
        <div className="perspective-switcher">
          <Eye size={14} />
          <button
            className={`persp-btn ${perspective === "actor" ? "active" : ""}`}
            onClick={() => setPerspective("actor")}
          ><Users size={13} /> My Needs</button>
          <button
            className={`persp-btn ${perspective === "responder" ? "active" : ""}`}
            onClick={() => setPerspective("responder")}
          ><ShieldCheck size={13} /> My Commitments</button>
        </div>
        <span className="canvas-label">
          {perspective === "actor" ? "Acting as: Your Business" : "Responding as: Capability Provider"}
        </span>
      </div>

      {/* ── Phase 1: CSS Grid Masonry Canvas ── */}
      <motion.div layout className={`mosaic-canvas ${isEmpty ? "canvas-empty" : ""}`}>
        <AnimatePresence mode="popLayout">

          {/* Skeleton while compiling */}
          {isCompiling && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mosaic-card card-normal skeleton-card"
            >
              <div className="skeleton-pulse">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line medium"></div>
              </div>
              <div className="skeleton-overlay">
                <span className="pulsing-text">Compiling Natural Intent...</span>
              </div>
            </motion.div>
          )}

          {/* ── Phase 4: Breathing Invitation Empty State ── */}
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <div className="breath-rings">
                <div className="breath-ring ring-1" />
                <div className="breath-ring ring-2" />
                <div className="breath-ring ring-3" />
                <Sparkles className="breath-icon" />
              </div>
              <p className="empty-title">Nothing has claimed territory yet.</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={hintIndex}
                  className="empty-hint"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  Try: "{SAMPLE_INTENTS[hintIndex]}"
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Cards */}
          {allWork.map(work => (
            <MosaicCard
              key={work.id}
              work={work}
              perspective={perspective}
              isExpanded={expandedId === work.id}
              onToggle={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
                setExpandedId(expandedId === work.id ? null : work.id);
              }}
            />
          ))}

        </AnimatePresence>
      </motion.div>

      {/* ── Composer Bar ── */}
      <div className={`composer-bar ${isEmpty ? "composer-glowing" : ""}`}>
        <form onSubmit={handleCompose} className="composer-form">
          <input
            name="intent"
            placeholder={perspective === "actor"
              ? "Tell C-Link what you need... (e.g. 'I need 200kg mangoes by Friday')"
              : "Log what you can commit to... (e.g. 'Can deliver 500 units next week')"}
            autoComplete="off"
            autoFocus
          />
          <button type="submit" aria-label="Submit intent">
            <ArrowUpRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phase 1+2: MosaicCard — Spatial Territory + Rich Status Visuals
// ─────────────────────────────────────────────────────────────
function MosaicCard({ work, isExpanded, onToggle, perspective }: {
  work: any; isExpanded: boolean; onToggle: () => void; perspective: Perspective;
}) {
  if (!work) return null;

  const history = work.history || [{ state: work, date: "Today", note: "Current" }];
  const maxIndex = history.length - 1;
  const [timeIndex, setTimeIndex] = useState(maxIndex);

  useEffect(() => { setTimeIndex(maxIndex); }, [isExpanded, maxIndex, work.id]);

  const currentEvent = history[timeIndex];
  const currentState = currentEvent.state;
  const isPast = timeIndex < maxIndex;

  const isExpectation = "item" in (work as any);
  const rawStatus: Status = (currentState.status || work.status || "draft") as Status;

  // Phase 3: Perspective transforms language
  const title = isExpectation
    ? `${currentState.quantity} ${currentState.unit || "unit"} · ${currentState.item}`
    : (perspective === "responder" ? `Commit: ${currentState.summary || work.summary}` : (currentState.summary || work.summary));
  const subtitle = currentState.subtitle || currentState.counterpartyPartyId || currentState.counterparty || work.counterpartyPartyId || work.counterparty;

  // Phase 1: Spatial Territory — territory class by consequence
  const isHighConsequence = rawStatus === "sent" || rawStatus === "pending" || rawStatus === "disputed";
  const isDone = rawStatus === "fulfilled" || rawStatus === "completed" || rawStatus === "settled";

  let sizeClass = "card-normal";
  if (isExpanded) sizeClass = "card-expanded";
  else if (rawStatus === "disputed") sizeClass = "card-full"; // DISPUTES take full width
  else if (isHighConsequence) sizeClass = "card-large";
  else if (isDone) sizeClass = "card-small";

  if (isPast) sizeClass += " time-travel-active";

  // Phase 2: Status-driven visual variant
  const statusVariant = getStatusVariant(rawStatus);

  const StatusIcon = rawStatus === "sent" ? Send
    : rawStatus === "in_progress" ? Clock
    : rawStatus === "fulfilled" ? CheckCircle2
    : rawStatus === "disputed" ? AlertTriangle
    : rawStatus === "pending" ? Clock
    : Inbox;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={`mosaic-card ${sizeClass} status-${rawStatus}`}
      onClick={!isExpanded ? onToggle : undefined}
      style={{ cursor: isExpanded ? "default" : "pointer" }}
      whileHover={!isExpanded ? { scale: 0.99 } : undefined}
      whileTap={!isExpanded ? { scale: 0.975 } : undefined}
    >
      {/* Phase 2: Disputed stamp overlay */}
      {rawStatus === "disputed" && !isExpanded && (
        <div className="disputed-stamp">DISPUTED</div>
      )}

      <motion.div layout="position" className="card-header">
        <div className={`status-badge status-badge--${statusVariant}`}>
          <StatusIcon size={13} className="status-icon" />
          <span className="card-status">{rawStatus.replace("_", " ").toUpperCase()}</span>
        </div>
        {isExpanded && (
          <button className="icon-button" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <Minimize2 size={16} />
          </button>
        )}
      </motion.div>

      <motion.div layout="position" className="card-body">
        <AnimatePresence mode="wait">
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >{title}</motion.h2>
        </AnimatePresence>
        <p className="card-subtitle">{subtitle}</p>

        {/* Phase 2: In-progress bar */}
        {rawStatus === "in_progress" && !isExpanded && (
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: "45%" }} />
            <span className="progress-label">45% complete</span>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="card-deep-details"
            >
              {/* Ghost ink banner when in past */}
              {isPast && (
                <motion.div className="ghost-ink-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Clock size={14} />
                  <span>Viewing past state: <strong>{currentEvent.date}</strong> — {currentEvent.note}</span>
                </motion.div>
              )}

              {/* Phase 5: Disputed — Evidence & Actions */}
              {rawStatus === "disputed" && (
                <motion.div className="dispute-panel"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                >
                  <div className="dispute-header">
                    <AlertTriangle size={16} />
                    <span>Dispute Active — Evidence Required</span>
                  </div>
                  <p className="dispute-note">Both parties must submit evidence within 48h. The C-Link network will arbitrate.</p>
                  <div className="dispute-actions">
                    <button className="action-btn action-btn--danger">Submit Evidence</button>
                    <button className="action-btn action-btn--neutral">Request Mediation</button>
                  </div>
                </motion.div>
              )}

              {/* Entity badges */}
              {isExpectation && (
                <motion.div className="entity-badges"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={`q-${currentState.quantity}`} className="badge"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    ><Box size={12} className="badge-icon" /><span className="badge-label">QTY</span>{currentState.quantity} {currentState.unit}</motion.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span key={`i-${currentState.item}`} className="badge"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    ><Package size={12} className="badge-icon" /><span className="badge-label">ITEM</span>{currentState.item}</motion.span>
                  </AnimatePresence>
                  <span className="badge"><Clock size={12} className="badge-icon" /><span className="badge-label">DUE</span>{work.neededBy}</span>
                </motion.div>
              )}

              {/* Fulfillment badge for commitments */}
              {!isExpectation && rawStatus === "fulfilled" && (
                <motion.div className="fulfillment-badge"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                >
                  <CheckCircle2 size={18} />
                  <span>Commitment fulfilled · {work.amount}</span>
                </motion.div>
              )}

              {/* Timeline from history */}
              <div className="timeline">
                {history.map((event: any, idx: number) => (
                  <motion.div key={idx} className="timeline-item"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.25 }}
                  >
                    <span className={`dot ${idx === timeIndex ? "active" : idx < timeIndex ? "done" : ""}`} />
                    <p><strong>{event.note}</strong> · <span className="timeline-date">{event.date}</span></p>
                  </motion.div>
                ))}
              </div>

              {/* Time Travel Ruler */}
              {history.length > 1 && (
                <motion.div className="time-travel-bar"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                >
                  <div className="time-travel-header">
                    <span className="time-travel-label">
                      {isPast ? <><Clock size={13} /> Rewinding…</> : <><Sparkles size={13} /> Present</>}
                    </span>
                    {isPast && (
                      <button className="time-travel-reset" onClick={() => setTimeIndex(maxIndex)}>Back to now</button>
                    )}
                  </div>
                  <div className="ruler-track">
                    {history.map((_: any, idx: number) => (
                      <div key={idx}
                        className={`ruler-tick ${idx === timeIndex ? "active" : idx < timeIndex ? "done" : "future"}`}
                        onClick={() => setTimeIndex(idx)}
                      >
                        <div className="tick-mark" />
                        <span className="tick-label">{history[idx].date}</span>
                      </div>
                    ))}
                    <div className="ruler-progress" style={{ width: `${(timeIndex / maxIndex) * 100}%` }} />
                  </div>
                  <input type="range" min={0} max={maxIndex} value={timeIndex}
                    onChange={e => setTimeIndex(Number(e.target.value))}
                    className="time-scrubber"
                  />
                </motion.div>
              )}

              {/* Primary CTA */}
              {isExpectation && rawStatus === "draft" && !isPast && (
                <motion.div className="response-actions"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                >
                  <button className="primary-action"><Sparkles size={16} /> Send to Capability</button>
                </motion.div>
              )}
              {!isExpectation && rawStatus === "in_progress" && !isPast && (
                <motion.div className="response-actions"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                >
                  <button className="primary-action"><CheckCircle2 size={16} /> Mark Fulfilled</button>
                  <button className="action-btn action-btn--danger" style={{ marginLeft: 12 }}><AlertTriangle size={14} /> Raise Dispute</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function getStatusVariant(status: Status): string {
  if (status === "disputed") return "danger";
  if (status === "in_progress" || status === "sent" || status === "pending") return "active";
  if (status === "fulfilled" || status === "completed" || status === "settled") return "done";
  return "neutral";
}

function toUiCommitment(item: any): Commitment {
  const version = item.versions[item.versions.length - 1];
  const status: Status = ["accepted", "in_progress", "fulfilled", "partially_accepted", "disputed", "settled", "closed"].includes(item.status)
    ? (item.status === "closed" ? "completed" : item.status as Status) : "pending";
  return {
    id: item.id, counterparty: item.counterpartyPartyId, type: "Business",
    summary: `${version?.quantity || 1} ${version?.unit || "item"} ${version?.item || "commitment"}`,
    amount: `৳${Number(version?.price || 0).toLocaleString("en-BD")}`,
    due: status === "completed" ? "Closed" : `Due ${version?.deadline || "soon"}`,
    status, updated: item.events?.at(-1)?.occurredAt ? "Updated recently" : "Created recently",
    initials: item.counterpartyPartyId.slice(0, 2).toUpperCase()
  };
}

createRoot(document.getElementById("root")!).render(<App />);
""")
