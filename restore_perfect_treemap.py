import os

main_tsx_path = "apps/clink-web/src/main.tsx"
css_path = "apps/clink-web/src/styles.css"

new_main_tsx = """import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Plus, ArrowLeft, MessageSquareQuote, AlertCircle, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compileNeed } from "./api/clink";
import "./styles.css";

type EntityState = "resolved" | "pending" | "blocked" | "active" | "ghost" | "source";
type EntityType = "Source" | "Need" | "Capability" | "Responsibility" | "Commitment" | "Actor" | "Gap";
type CausalNode = { id: string; type: EntityType; title: string; subtitle?: string; state: EntityState; children?: Record<string, CausalNode>; };

// ─────────────────────────────────────────────────────────────
// 1. ATTENTION ENGINE
// ─────────────────────────────────────────────────────────────
function calculateWeights(nodes: Record<string, CausalNode>, expandedId: string | null): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (expandedId === id) weights[id] = 60.0; 
    else if (expandedId) {
      if (node.state === "ghost") weights[id] = 2.0;
      else weights[id] = 6.0; 
    }
    else {
      if (node.state === "ghost") weights[id] = 4.0;
      else if (node.type === "Source") weights[id] = 12.0;
      else if (node.type === "Gap" && node.state === "blocked") weights[id] = 20.0;
      else if (node.state === "pending") weights[id] = 12.0;
      else weights[id] = 10.0;
    }
  }
  return weights;
}

// ─────────────────────────────────────────────────────────────
// 2. SPATIAL ORGANISM (Ordered Treemap - Perfect Rectangles!)
// ─────────────────────────────────────────────────────────────
type Rect = { x: number, y: number, w: number, h: number };

// Fixed Topology Order: They will NEVER jump or swap places when expanding!
const TOPOLOGY = ["source", "need", "responsibility", "capability", "actor", "gap", "resolve", "commit", "spec", "timeline", "task", "proof"];

function generateOrderedTreemap(weights: Record<string, number>, width: number, height: number, gap: number = 12) {
  // Sort by fixed topology, NOT by weight!
  const sortedIds = Object.keys(weights).sort((a, b) => {
      const idxA = TOPOLOGY.indexOf(a);
      const idxB = TOPOLOGY.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });
  
  const totalWeight = sortedIds.reduce((sum, id) => sum + weights[id], 0);
  const rects: Record<string, Rect> = {};
  
  let currentX = 0;
  let currentY = 0;
  let currentW = width;
  let currentH = height;
  let remainingWeight = totalWeight;

  for (let i = 0; i < sortedIds.length; i++) {
    const id = sortedIds[i];
    const w = weights[id];
    
    if (i === sortedIds.length - 1) {
      rects[id] = { x: currentX, y: currentY, w: currentW, h: currentH };
      break;
    }

    const ratio = w / remainingWeight;
    let rw, rh;

    if (currentW > currentH) { // Slice vertically
      rw = currentW * ratio;
      rh = currentH;
      rects[id] = { x: currentX, y: currentY, w: rw, h: rh };
      currentX += rw;
      currentW -= rw;
    } else { // Slice horizontally
      rw = currentW;
      rh = currentH * ratio;
      rects[id] = { x: currentX, y: currentY, w: rw, h: rh };
      currentY += rh;
      currentH -= rh;
    }
    remainingWeight -= w;
  }

  // Apply gaps (Seam Engine)
  const finalRects: Record<string, Rect> = {};
  for (const [id, r] of Object.entries(rects)) {
      finalRects[id] = { x: r.x + gap/2, y: r.y + gap/2, w: r.w - gap, h: r.h - gap };
  }
  return finalRects;
}

// ─────────────────────────────────────────────────────────────
// 3. ONE WORK FIELD
// ─────────────────────────────────────────────────────────────
const SPRING: any = { type: "spring", stiffness: 200, damping: 25 }; 

function WorkField({ nodes, width, height, onNodeTap, expandedNodeId, isRoot = true }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; isRoot?: boolean }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const rects = useMemo(() => generateOrderedTreemap(weights, width, height, 16), [weights, width, height]);

    const getColors = (node: CausalNode, isExpanded: boolean) => {
        if (!isRoot) {
            if (node.state === "ghost") return { bg: "transparent", border: "1px dashed rgba(0,0,0,0.1)", text: "#94a3b8" };
            return { bg: "rgba(255,255,255,0.6)", border: "none", text: "#0f172a" };
        }
        
        let bg = "#ffffff";
        let text = "#0f172a";
        
        // Base Colors
        if (node.type === "Source") { bg = "#ffffff"; text = "#334155"; }
        else if (node.type === "Need") { bg = "#bae6fd"; text = "#0369a1"; }
        else if (node.type === "Gap" || node.state === "blocked") { bg = "#fecaca"; text = "#b91c1c"; }
        else if (node.type === "Capability") { bg = "#bbf7d0"; text = "#15803d"; }
        else if (node.type === "Actor") { bg = "#e9d5ff"; text = "#7e22ce"; }
        
        // If ghost, fade the text slightly but KEEP the solid background color so it's readable!
        if (node.state === "ghost") {
            text = "rgba(0,0,0,0.4)";
        }
        return { bg, border: "none", text };
    };

    return (
        <div className="work-field" style={{ width, height, position: 'relative' }}>
            <AnimatePresence>
                {Object.entries(nodes).map(([id, node]) => {
                    const rect = rects[id];
                    const isExpanded = expandedNodeId === id;
                    if (!rect) return null;
                    const { bg, border, text } = getColors(node, isExpanded);
                    
                    return (
                        <motion.div
                            key={id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                                opacity: 1, scale: 1, 
                                x: rect.x, y: rect.y, 
                                width: rect.w, height: rect.h,
                                backgroundColor: bg,
                                border: border,
                                borderRadius: isRoot ? 32 : 16,
                                boxShadow: isExpanded ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.03)"
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={SPRING}
                            className={`solid-card state-${node.state} ${isExpanded ? 'is-expanded' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onNodeTap(isExpanded ? null : id);
                            }}
                        >
                            <div className="card-content" style={{ padding: isExpanded ? '40px' : '24px' }}>
                                <div className="node-header">
                                    {isExpanded && isRoot && (
                                        <button className="btn-back" style={{color: text}} onClick={(e) => { e.stopPropagation(); onNodeTap(null); }}>
                                            <ArrowLeft size={20} /> <span style={{fontWeight: 700}}>BACK</span>
                                        </button>
                                    )}
                                    <div className="badge" style={{ color: text, background: 'rgba(255,255,255,0.6)' }}>
                                        {node.type === "Source" ? <MessageSquareQuote size={14}/> : node.type === "Gap" ? <AlertCircle size={14}/> : <Activity size={14}/>}
                                        <span>{node.type}</span>
                                    </div>
                                </div>
                                
                                <div className="text-zone" style={{ color: text }}>
                                    <motion.h3 layout className={isExpanded ? 'text-expanded' : 'text-normal'}>{node.title}</motion.h3>
                                    {node.subtitle && <p style={{opacity: 0.8}}>{node.subtitle}</p>}
                                </div>
                                
                                {/* RECURSION (Mosaic in Mosaic) */}
                                {isExpanded && node.children && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, ...SPRING }}
                                        className="recursive-container" 
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <WorkField 
                                            nodes={node.children} 
                                            width={Math.max(100, rect.w - 80)} 
                                            height={Math.max(100, rect.h - (isRoot ? 160 : 80))} 
                                            onNodeTap={() => {}} 
                                            expandedNodeId={null}
                                            isRoot={false}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

const INITIAL_NODES: Record<string, CausalNode> = {
  need: { id: "need", type: "Need", title: "NEED", state: "ghost" },
  capability: { id: "cap", type: "Capability", title: "CAPABILITY", state: "ghost" },
  actor: { id: "actor", type: "Actor", title: "ACTOR", state: "ghost" },
  gap: { id: "gap", type: "Gap", title: "RESPONSIBILITY", state: "ghost" },
};

export default function App() {
  const [nodes, setNodes] = useState<Record<string, CausalNode>>(INITIAL_NODES);
  const [viewState, setViewState] = useState<"QUIET" | "SOURCE_CREATED" | "COMPILING" | "COMPILED">("QUIET");
  const [intentValue, setIntentValue] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const handleIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentValue.trim()) return;
    const text = intentValue;
    setIntentValue("");
    setViewState("SOURCE_CREATED");
    
    setNodes(prev => ({
      source: { id: "source", type: "Source", title: text, subtitle: "YOU · Just now", state: "source" },
      ...prev
    }));

    setTimeout(async () => {
       setViewState("COMPILING");
       try {
         const response = await compileNeed({ text, locale: "en" });
         const draft = response?.draft || response?.data?.draft;
         if (draft) {
             setNodes(prev => {
                const next = { ...prev };
                next.need = { 
                    ...next.need, title: draft.desiredState?.title || "Need Resolved", state: "active",
                    children: {
                        spec: { id: "spec", type: "Capability", title: "Specifications", state: "ghost" },
                        timeline: { id: "timeline", type: "Gap", title: "Urgency", state: "ghost" }
                    }
                };
                if (draft.gap) {
                   next.gap = { 
                       ...next.gap, title: "GAP", subtitle: draft.gap, state: "blocked",
                       children: {
                           resolve: { id: "resolve", type: "Actor", title: "Find Actor", state: "pending" },
                           commit: { id: "commit", type: "Commitment", title: "Awaiting Commitment", state: "ghost" }
                       }
                   };
                } else { delete next.gap; }
                if (draft.dependencies?.length) {
                   next.responsibility = { 
                       id: "resp", type: "Responsibility", title: draft.dependencies[0].action || "Action required", state: "pending",
                       children: { task: { id: "t1", type: "Need", title: "Sub-task", state: "ghost"} }
                   };
                   next.actor = { 
                       ...next.actor, title: draft.dependencies[0].role || "Actor needed", state: "active",
                       children: { proof: { id: "proof", type: "Capability", title: "Verification", state: "ghost"} }
                   };
                }
                return next;
             });
         }
       } catch (err) { console.error(err); }
       setViewState("COMPILED");
    }, 1500); 
  };

  return (
    <div className="living-surface">
      <div className="work-viewport">
          <WorkField nodes={nodes} width={1200} height={760} onNodeTap={setExpandedId} expandedNodeId={expandedId} />
      </div>
      <div className="composer-bar">
        <div className="onboarding-text" style={{ opacity: viewState === "QUIET" ? 1 : 0, display: viewState === "QUIET" ? 'block' : 'none' }}>
             Tell C-Link what needs to move.
        </div>
        <form className="composer-form" onSubmit={handleIntent}>
          <input value={intentValue} onChange={(e) => setIntentValue(e.target.value)} placeholder="Type your intent..." disabled={viewState === "COMPILING" || viewState === "SOURCE_CREATED"} />
          <button type="submit" disabled={viewState === "COMPILING" || viewState === "SOURCE_CREATED"}>
             {viewState === "COMPILING" ? <Loader2 className="spinner-small" /> : <Plus size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
"""

with open(main_tsx_path, "w") as f:
    f.write(new_main_tsx)

new_css = """
:root {
  --surface-default: #0f172a;
  --color-primary: #3b82f6;
  --color-text-main: #0f172a;
}
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif; }
body { margin: 0; background: var(--surface-default); color: var(--color-text-main); overflow: hidden; }
.living-surface { width: 100vw; height: 100vh; display: flex; flex-direction: column; }

.work-viewport {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.work-field { position: relative; }

/* SOLID CARDS (Perfect Rectangles via Treemap) */
.solid-card { position: absolute; cursor: pointer; display: flex; flex-direction: column; overflow: hidden; }
.solid-card.is-expanded { cursor: default; z-index: 10; }

.card-content {
  width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px;
}

/* Typography */
.node-header { display: flex; align-items: center; justify-content: space-between; }
.badge { display: flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; padding: 6px 12px; border-radius: 20px; }
.text-zone h3 { margin: 0; font-weight: 700; letter-spacing: -0.5px; }
.text-normal { font-size: 20px; line-height: 1.3; }
.text-expanded { font-size: 36px; line-height: 1.1; font-weight: 800 !important; letter-spacing: -1px !important; }
.text-zone p { margin: 8px 0 0; font-size: 15px; font-weight: 500; }

.recursive-container { width: 100%; flex: 1; position: relative; margin-top: 16px; display: flex; justify-content: center; align-items: center; }

/* Composer Bar */
.composer-bar { padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 16px; position: absolute; bottom: 0; width: 100%; z-index: 100; pointer-events: auto; background: linear-gradient(to top, rgba(15, 23, 42, 1) 20%, transparent); }
.onboarding-text { font-size: 16px; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; transition: opacity 0.3s ease; }
.composer-form { display: flex; gap: 12px; width: 100%; max-width: 680px; box-shadow: 0 12px 48px rgba(0,0,0,0.3); border-radius: 40px; background: white; padding: 8px; border: 1px solid rgba(0,0,0,0.1); }
.composer-form input { flex: 1; padding: 20px 24px; border-radius: 32px; border: none; font-size: 17px; font-weight: 500; outline: none; background: transparent; }
.composer-form button { width: 56px; height: 56px; border-radius: 28px; background: #0f172a; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.composer-form button:hover { transform: scale(1.05); }
.composer-form button:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
.btn-back { background: transparent; border: none; font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 16px; border-radius: 20px; font-weight: 700; transition: transform 0.2s; }
.btn-back:hover { transform: scale(0.95); background: rgba(0,0,0,0.05); }
"""

with open(css_path, "w") as f:
    f.write(new_css)

