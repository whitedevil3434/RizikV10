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
      else weights[id] = 12.0;
    }
    else {
      if (node.state === "ghost") weights[id] = 4.0;
      else if (node.type === "Source") weights[id] = 8.0;
      else if (node.type === "Gap" && node.state === "blocked") weights[id] = 20.0;
      else if (node.state === "pending") weights[id] = 15.0;
      else weights[id] = 12.0;
    }
  }
  return weights;
}

// ─────────────────────────────────────────────────────────────
// 2. TERRITORY SOLVER
// ─────────────────────────────────────────────────────────────
const COLS = 16;
const ROWS = 12;

function allocateTerritories(weights: Record<string, number>) {
  const grid: (string | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalCells = COLS * ROWS;
  const allocations: Record<string, number> = {};
  
  let remaining = totalCells;
  const sortedIds = Object.entries(weights).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  
  for (let i = 0; i < sortedIds.length; i++) {
    const id = sortedIds[i];
    if (i === sortedIds.length - 1) allocations[id] = remaining;
    else {
      const cells = Math.max(1, Math.round((weights[id] / totalWeight) * totalCells));
      allocations[id] = cells;
      remaining -= cells;
    }
  }

  const SEED_MAP: Record<string, {x: number, y: number}> = {
    source: { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) },
    need: { x: 1, y: 1 },
    capability: { x: 1, y: ROWS - 2 },
    actor: { x: COLS - 2, y: ROWS - 2 },
    gap: { x: COLS - 2, y: 1 },
    responsibility: { x: Math.floor(COLS/2), y: ROWS - 2 }
  };
  
  const defaultSeeds = [
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }, { x: 0, y: 0 }, { x: COLS-1, y: 0 }, 
    { x: 0, y: ROWS-1 }, { x: COLS-1, y: ROWS-1 }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  let dIdx = 0;
  for (let i = 0; i < sortedIds.length; i++) {
     const id = sortedIds[i];
     const seed = SEED_MAP[id] || defaultSeeds[dIdx++ % defaultSeeds.length];
     queues[id] = [seed];
  }

  const claimed: Record<string, number> = {};
  for (const id of sortedIds) claimed[id] = 0;

  let progress = true;
  while (progress) {
    progress = false;
    for (const id of sortedIds) {
      if (claimed[id] >= allocations[id]) continue;
      const q = queues[id];
      let found = false;
      while (q.length > 0 && !found) {
        const {x, y} = q.shift()!;
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] === null) {
          grid[y][x] = id;
          claimed[id]++;
          found = true;
          progress = true;
          q.push({x: x+1, y}); q.push({x: x-1, y}); q.push({x, y: y+1}); q.push({x, y: y-1});
        }
      }
    }
  }
  
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (grid[y][x] === null) grid[y][x] = sortedIds[0];
      
  return grid;
}

// ─────────────────────────────────────────────────────────────
// 3. MICRO-POC RENDERER (Solid Colors & Adaptive Corners)
// ─────────────────────────────────────────────────────────────
function extractGeometry(grid: (string | null)[][], width: number, height: number, nodes: Record<string, CausalNode>) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const GAP_SIZE = 6; // The River (Seam Engine)

  const anchors: Record<string, {x: number, y: number, w: number, h: number, corners: Record<string, boolean>}> = {};
  for (const id of Object.keys(nodes)) {
    let minX = COLS, minY = ROWS, maxX = 0, maxY = 0;
    let count = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x] === id) {
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          count++;
        }
      }
    }
    
    if (count > 0) {
      // Adaptive Corners (Shape Engine) - Sharp if touching another territory, round if outer
      const corners = { tl: true, tr: true, bl: true, br: true };
      if (minX > 0 && grid[minY][minX-1] !== id && grid[minY][minX-1] !== null) corners.tl = false;
      if (minY > 0 && grid[minY-1][minX] !== id && grid[minY-1][minX] !== null) corners.tl = false;
      
      anchors[id] = { 
          x: minX * cellW + GAP_SIZE/2, 
          y: minY * cellH + GAP_SIZE/2, 
          w: (maxX - minX + 1) * cellW - GAP_SIZE, 
          h: (maxY - minY + 1) * cellH - GAP_SIZE,
          corners
      };
    }
  }
  return { anchors, cellW, cellH };
}

const SPRING = { type: "spring", stiffness: 180, damping: 25 }; 

function WorkField({ nodes, width, height, onNodeTap, expandedNodeId, isRoot = true }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; isRoot?: boolean }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights), [weights]);
    const { anchors } = useMemo(() => extractGeometry(grid, width, height, nodes), [grid, width, height, nodes]);

    const getColors = (node: CausalNode, isExpanded: boolean) => {
        if (node.state === "ghost") return { bg: "#e2e8f0", text: "#94a3b8" };
        if (node.type === "Source") return { bg: "#f1f5f9", text: "#334155" };
        if (node.type === "Need") return { bg: "#e0f2fe", text: "#0284c7" };
        if (node.type === "Gap" || node.state === "blocked") return { bg: "#fee2e2", text: "#dc2626" };
        if (node.type === "Capability") return { bg: "#dcfce7", text: "#16a34a" };
        if (node.type === "Actor") return { bg: "#f3e8ff", text: "#9333ea" };
        return { bg: "#ffffff", text: "#0f172a" };
    };

    return (
        <div className="work-field" style={{ width, height, position: 'relative' }}>
            <AnimatePresence>
                {Object.entries(nodes).map(([id, node]) => {
                    const anchor = anchors[id];
                    const isExpanded = expandedNodeId === id;
                    if (!anchor) return null;
                    const { bg, text } = getColors(node, isExpanded);
                    
                    const radiusTL = anchor.corners.tl ? 32 : 8;
                    const radiusTR = anchor.corners.tr ? 32 : 8;
                    const radiusBL = anchor.corners.bl ? 32 : 8;
                    const radiusBR = anchor.corners.br ? 32 : 8;
                    
                    return (
                        <motion.div
                            key={id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ 
                                opacity: 1, scale: 1, 
                                x: anchor.x, y: anchor.y, 
                                width: anchor.w, height: anchor.h,
                                backgroundColor: bg,
                                borderRadius: `${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px`,
                                boxShadow: isExpanded ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.03)"
                            }}
                            exit={{ opacity: 0, scale: 0.95 }}
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
                                            <ArrowLeft size={20} /> <span>BACK</span>
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
                                
                                {/* RECURSION */}
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
                                            width={Math.max(100, anchor.w - 80)} 
                                            height={Math.max(100, anchor.h - (isRoot ? 160 : 80))} 
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
  --surface-default: #cbd5e1;
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

/* CONTENT CARDS (Micro-PoC Style) */
.solid-card { position: absolute; cursor: pointer; display: flex; flex-direction: column; overflow: hidden; }
.solid-card.state-ghost { opacity: 0.7; }
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

.recursive-container { width: 100%; flex: 1; position: relative; margin-top: 16px; background: rgba(255,255,255,0.4); border-radius: 24px; padding: 12px; display: flex; justify-content: center; align-items: center; }

/* Composer Bar */
.composer-bar { padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 16px; position: absolute; bottom: 0; width: 100%; z-index: 100; pointer-events: auto; background: linear-gradient(to top, rgba(203, 213, 225, 1) 20%, transparent); }
.onboarding-text { font-size: 16px; color: #475569; font-weight: 600; letter-spacing: 0.5px; transition: opacity 0.3s ease; }
.composer-form { display: flex; gap: 12px; width: 100%; max-width: 680px; box-shadow: 0 12px 48px rgba(0,0,0,0.08); border-radius: 40px; background: white; padding: 8px; border: 1px solid rgba(0,0,0,0.04); }
.composer-form input { flex: 1; padding: 20px 24px; border-radius: 32px; border: none; font-size: 17px; font-weight: 500; outline: none; background: transparent; }
.composer-form button { width: 56px; height: 56px; border-radius: 28px; background: #0f172a; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.composer-form button:hover { transform: scale(1.05); }
.composer-form button:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
.btn-back { background: transparent; border: none; font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 16px; border-radius: 20px; font-weight: 700; transition: transform 0.2s; }
.btn-back:hover { transform: scale(0.95); background: rgba(255,255,255,0.3); }
"""

with open(css_path, "w") as f:
    f.write(new_css)

