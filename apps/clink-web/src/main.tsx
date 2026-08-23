import { ArrowUpRight, Minimize2, Package, Sparkles, CheckCircle2, Send, Clock, Inbox, Box, AlertTriangle, ShieldCheck, Users, Eye, Target, Briefcase } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { motion, AnimatePresence } from "framer-motion";

type Status = "draft" | "pending" | "in_progress" | "fulfilled" | "disputed";
type Lens = "actor" | "responder";

// UNIFIED WORK OBJECT (Single Reality)
type UnifiedWork = {
  id: string;
  status: Status;
  actor: string;
  responder: string;
  
  need: { qty: number; unit: string; item: string; due: string };
  capability: { summary: string };
  commitment: { qty: number; amount: string };
  gap: string | null;
  
  history: any[];
};

const SAMPLE_INTENTS = [
  "I need 500kg of fresh mangoes by Friday...",
  "Source 20 laptops for our new office...",
  "Find a logistics partner for Chittagong route...",
];

function App() {
  const [works, setWorks] = useState<UnifiedWork[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lens, setLens] = useState<Lens>("actor");
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHintIndex(i => (i + 1) % SAMPLE_INTENTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setWorks([
        {
          id: "work_1", status: "pending",
          actor: "Restaurant A", responder: "Supplier B",
          need: { qty: 1000, unit: "KG", item: "Fresh Chicken", due: "Aug 30" },
          capability: { summary: "Poultry Supply Chain" },
          commitment: { qty: 500, amount: "৳75,000" },
          gap: "500 KG deficit",
          history: [{ state: { status: "pending" }, date: "Today", note: "Supplier committed to half" }]
        },
        {
          id: "work_2", status: "in_progress",
          actor: "TechCorp BD", responder: "Supplier B",
          need: { qty: 50, unit: "Units", item: "Office Laptops", due: "Sep 05" },
          capability: { summary: "Electronics Distribution" },
          commitment: { qty: 50, amount: "৳2,500,000" },
          gap: null,
          history: [{ state: { status: "in_progress" }, date: "Yesterday", note: "Delivery started" }]
        },
        {
          id: "work_3", status: "disputed",
          actor: "Restaurant A", responder: "Supplier B",
          need: { qty: 200, unit: "KG", item: "Onions", due: "Aug 20" },
          capability: { summary: "Vegetable Wholesale" },
          commitment: { qty: 200, amount: "৳12,000" },
          gap: "Quality mismatch reported",
          history: [{ state: { status: "disputed" }, date: "Aug 21", note: "Restaurant raised dispute on quality" }]
        }
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

    const qtyMatch = intent.match(/(\d+)\s*(kg|pcs|units|tons|batch|lbs|unit|bags)?/i);
    let q = 1, u = "unit", it = intent;
    if (qtyMatch) {
      q = parseInt(qtyMatch[1]);
      u = qtyMatch[2] || "unit";
      it = intent.replace(qtyMatch[0], "").replace(/I need|we need|deliver|of/gi, "").trim();
      it = it.charAt(0).toUpperCase() + it.slice(1);
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      const mockCreated: UnifiedWork = {
        id: "work_" + Date.now(), status: "draft",
        actor: "You", responder: "Network",
        need: { qty: q, unit: u, item: it || intent, due: "TBD" },
        capability: { summary: "Awaiting match" },
        commitment: { qty: 0, amount: "TBD" },
        gap: "Unfulfilled",
        history: [{ state: { status: "draft" }, date: "Just now", note: "Intent compiled into reality" }]
      };
      setWorks(prev => [mockCreated, ...prev]);
    } finally { setIsCompiling(false); }
  }

  const isEmpty = works.length === 0 && !isCompiling;

  return (
    <div className="living-surface">
      {/* ── LENS CONTROL (Attention/Perspective) ── */}
      <div className="lens-control-bar">
        <span className="lens-label">Perspective Lens:</span>
        <div className="lens-switcher">
          <button
            className={`lens-btn ${lens === "actor" ? "active" : ""}`}
            onClick={() => setLens("actor")}
          ><Target size={14} /> My Needs</button>
          <button
            className={`lens-btn ${lens === "responder" ? "active" : ""}`}
            onClick={() => setLens("responder")}
          ><Briefcase size={14} /> My Capabilities</button>
        </div>
      </div>

      {/* ── MOSAIC CANVAS ── */}
      <motion.div layout className={`mosaic-canvas ${isEmpty ? "canvas-empty" : ""}`}>
        <AnimatePresence mode="popLayout">

          {isCompiling && (
            <motion.div layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="mosaic-card card-normal skeleton-card">
              <div className="skeleton-pulse">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
              <div className="skeleton-overlay"><span className="pulsing-text">Compiling Reality...</span></div>
            </motion.div>
          )}

          {isEmpty && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="empty-state">
              <div className="breath-rings"><div className="breath-ring ring-1"/><div className="breath-ring ring-2"/><div className="breath-ring ring-3"/><Sparkles className="breath-icon"/></div>
              <p className="empty-title">The canvas is silent.</p>
              <AnimatePresence mode="wait">
                <motion.p key={hintIndex} className="empty-hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>Try: "{SAMPLE_INTENTS[hintIndex]}"</motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Cards */}
          {works.map(work => (
            <UnifiedCard
              key={work.id}
              work={work}
              lens={lens}
              isExpanded={expandedId === work.id}
              onToggle={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
                setExpandedId(expandedId === work.id ? null : work.id);
              }}
            />
          ))}

        </AnimatePresence>
      </motion.div>

      <div className={`composer-bar ${isEmpty ? "composer-glowing" : ""}`}>
        <form onSubmit={handleCompose} className="composer-form">
          <input name="intent" placeholder="Inject intent into the mosaic..." autoComplete="off" autoFocus />
          <button type="submit" aria-label="Submit intent"><ArrowUpRight size={20} /></button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UNIFIED CARD — Shifts Spatial Weight Based on Lens
// ─────────────────────────────────────────────────────────────
function UnifiedCard({ work, isExpanded, onToggle, lens }: {
  work: UnifiedWork; isExpanded: boolean; onToggle: () => void; lens: Lens;
}) {
  const [timeIndex, setTimeIndex] = useState(work.history.length - 1);
  const maxIndex = work.history.length - 1;
  const isPast = timeIndex < maxIndex;

  // LENS GRAVITY: Which side of the reality holds weight right now?
  const isMyNeedLens = lens === "actor";
  
  // Dynamic Sizing based on lens and status
  let sizeClass = "card-normal";
  if (isExpanded) sizeClass = "card-expanded";
  else if (work.status === "disputed") sizeClass = "card-full"; 
  // If I'm looking through My Needs, my drafts/pending needs are large.
  // If I'm looking through My Capabilities, my commitments are large.
  else if (isMyNeedLens && (work.status === "pending" || work.status === "draft")) sizeClass = "card-large";
  else if (!isMyNeedLens && work.status === "in_progress") sizeClass = "card-large";
  else if (work.status === "fulfilled") sizeClass = "card-small";

  if (isPast) sizeClass += " time-travel-active";

  const StatusIcon = work.status === "draft" ? Sparkles
    : work.status === "in_progress" ? Clock
    : work.status === "fulfilled" ? CheckCircle2
    : work.status === "disputed" ? AlertTriangle
    : Inbox;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={`mosaic-card ${sizeClass} status-${work.status}`}
      onClick={!isExpanded ? onToggle : undefined}
      style={{ cursor: isExpanded ? "default" : "pointer" }}
    >
      {work.status === "disputed" && !isExpanded && <div className="disputed-stamp">DISPUTED</div>}

      <motion.div layout="position" className="card-header">
        <div className={`status-badge status-badge--${getStatusVariant(work.status)}`}>
          <StatusIcon size={13} className="status-icon" />
          <span className="card-status">{work.status.replace("_", " ").toUpperCase()}</span>
        </div>
        {isExpanded && <button className="icon-button" onClick={(e) => { e.stopPropagation(); onToggle(); }}><Minimize2 size={16} /></button>}
      </motion.div>

      {/* REARRANGING CORE REALITY based on lens */}
      <motion.div layout className="lens-container">
        {isMyNeedLens ? (
          // ACTOR LENS (Heavy emphasis on Need)
          <motion.div layout key="actor-lens" className="reality-stack actor-heavy"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          >
            <motion.h2 layout="position" className="primary-focus">
              {work.need.qty} {work.need.unit} · {work.need.item}
            </motion.h2>
            <motion.div layout="position" className="secondary-objects">
              <span className="obj-pill responder-pill">Supplier: {work.responder}</span>
              {work.commitment.qty > 0 && <span className="obj-pill commit-pill">Committed: {work.commitment.qty} {work.need.unit}</span>}
              {work.gap && <span className="obj-pill gap-pill">Gap: {work.gap}</span>}
            </motion.div>
          </motion.div>
        ) : (
          // RESPONDER LENS (Heavy emphasis on Capability/Commitment)
          <motion.div layout key="responder-lens" className="reality-stack responder-heavy"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          >
            <motion.h2 layout="position" className="primary-focus">
              {work.capability.summary}
            </motion.h2>
            <motion.div layout="position" className="secondary-objects">
              <span className="obj-pill commit-pill">My Responsibility: {work.commitment.qty || 0} {work.need.unit}</span>
              <span className="obj-pill actor-pill">Req by: {work.actor}</span>
              <span className="obj-pill need-pill">Total Need: {work.need.qty}</span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="card-deep-details">
            
            {/* Unified 360-degree view of the object */}
            <div className="reality-matrix">
              <div className="matrix-cell">
                <label>THE NEED</label>
                <div>{work.need.qty} {work.need.unit} {work.need.item}</div>
                <div className="sub">Due: {work.need.due}</div>
              </div>
              <div className="matrix-cell">
                <label>CAPABILITY APPLIED</label>
                <div>{work.capability.summary}</div>
                <div className="sub">By {work.responder}</div>
              </div>
              <div className="matrix-cell">
                <label>COMMITMENT</label>
                <div>{work.commitment.qty} units ({work.commitment.amount})</div>
              </div>
              {work.gap && (
                <div className="matrix-cell warning">
                  <label>GAP / CONFLICT</label>
                  <div>{work.gap}</div>
                </div>
              )}
            </div>

            {/* Actions dynamically shift based on lens */}
            <div className="response-actions">
              {lens === "actor" && work.status === "draft" && (
                <button className="primary-action"><Sparkles size={16} /> Broadcast Need</button>
              )}
              {lens === "responder" && work.status === "pending" && (
                <button className="primary-action"><CheckCircle2 size={16} /> Commit Capability</button>
              )}
              {work.status === "in_progress" && (
                <button className="primary-action"><CheckCircle2 size={16} /> Mark Fulfilled</button>
              )}
              {work.status === "disputed" && (
                <button className="action-btn action-btn--danger"><AlertTriangle size={14} /> Submit Evidence</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getStatusVariant(status: Status): string {
  if (status === "disputed") return "danger";
  if (status === "in_progress" || status === "pending") return "active";
  if (status === "fulfilled") return "done";
  return "neutral";
}

createRoot(document.getElementById("root")!).render(<App />);
