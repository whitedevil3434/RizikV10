import os

main_tsx_path = "src/main.tsx"
css_path = "src/styles.css"

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
    if (expandedId === id) weights[id] = 25.0; // MASSIVE territory claim
    else if (expandedId) weights[id] = 1.0; // Others sacrifice space
    else {
      if (node.state === "ghost") weights[id] = 2.0;
      else if (node.type === "Source") weights[id] = 3.0;
      else if (node.type === "Gap" && node.state === "blocked") weights[id] = 8.0;
      else if (node.state === "pending") weights[id] = 5.0;
      else weights[id] = 4.0;
    }
  }
  return weights;
}

// ─────────────────────────────────────────────────────────────
// 2. TERRITORY SOLVER (Numerical Discretization)
// ─────────────────────────────────────────────────────────────
const COLS = 16;
const ROWS = 12; // Increased rows for deeper canvas

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

  const seeds = [
    { x: 2, y: 2 }, { x: COLS - 3, y: 2 }, { x: 2, y: ROWS - 3 }, { x: COLS - 3, y: ROWS - 3 },
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }, { x: Math.floor(COLS/2), y: 0 }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  for (let i = 0; i < sortedIds.length; i++) queues[sortedIds[i]] = [seeds[i % seeds.length]];

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
// 3. CONTINUOUS GEOMETRY ENGINE
// ─────────────────────────────────────────────────────────────
function extractGeometry(grid: (string | null)[][], width: number, height: number, nodes: Record<string, CausalNode>) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const seams = [];
  
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const id = grid[y][x];
      if (x < COLS - 1 && grid[y][x+1] !== id) {
        seams.push({ id: `seam-v-${x}-${y}`, x1: (x+1)*cellW, y1: y*cellH, x2: (x+1)*cellW, y2: (y+1)*cellH, id1: id, id2: grid[y][x+1] });
      }
      if (y < ROWS - 1 && grid[y+1][x] !== id) {
        seams.push({ id: `seam-h-${x}-${y}`, x1: x*cellW, y1: (y+1)*cellH, x2: (x+1)*cellW, y2: (y+1)*cellH, id1: id, id2: grid[y+1][x] });
      }
    }
  }

  const anchors: Record<string, {x: number, y: number, w: number, h: number}> = {};
  for (const id of Object.keys(nodes)) {
    let minX = COLS, minY = ROWS, maxX = 0, maxY = 0, count = 0;
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
      anchors[id] = { 
          x: minX * cellW, 
          y: minY * cellH, 
          w: (maxX - minX + 1) * cellW, 
          h: (maxY - minY + 1) * cellH 
      };
    }
  }
  return { seams, anchors, cellW, cellH };
}

// ─────────────────────────────────────────────────────────────
// 4. ONE WORK FIELD (Renderer)
// ─────────────────────────────────────────────────────────────
function WorkField({ nodes, width, height, onNodeTap, expandedNodeId, isRoot = true }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; isRoot?: boolean }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights), [weights]);
    const { seams, anchors, cellW, cellH } = useMemo(() => extractGeometry(grid, width, height, nodes), [grid, width, height, nodes]);

    // Use a different color palette for nested mosaics to distinguish them
    const getFillColor = (node: CausalNode, isExpanded: boolean) => {
        if (isRoot) {
            if (isExpanded) return "var(--surface-raised)";
            if (node.state === "active" || node.type === "Source") return "var(--surface-raised)";
            if (node.state === "blocked") return "var(--surface-tension)";
            return "var(--surface-ghost)";
        } else {
            // Nested colors
            if (node.state === "ghost") return "transparent";
            return "rgba(255,255,255,0.4)";
        }
    };

    return (
        <div className="work-field" style={{ width, height, position: 'relative' }}>
            {/* CONTINUOUS GEOMETRY */}
            <svg width={width} height={height} className="geometry-layer">
                {/* Territories (Animated with Framer Motion) */}
                {Object.entries(nodes).map(([id, node]) => {
                    const fill = getFillColor(node, expandedNodeId === id);
                    return (
                        <g key={`fill-${id}`} className={`svg-territory state-${node.state}`}>
                            {grid.map((row, y) => row.map((cellId, x) => {
                                if (cellId === id) {
                                    return (
                                        <motion.rect 
                                            key={`${x}-${y}`} 
                                            initial={false}
                                            animate={{ x: x*cellW, y: y*cellH, width: cellW+0.5, height: cellH+0.5, fill }}
                                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                        />
                                    );
                                }
                                return null;
                            }))}
                        </g>
                    );
                })}

                {/* Seams (Animated) */}
                <g className="seams">
                    {seams.map((seam) => {
                        const node1 = nodes[seam.id1!];
                        const node2 = nodes[seam.id2!];
                        const isTension = node1?.state === "blocked" || node2?.state === "blocked";
                        const isGhost = node1?.state === "ghost" || node2?.state === "ghost";
                        
                        let strokeClass = "seam-normal";
                        if (isTension) strokeClass = "seam-tension";
                        else if (isGhost) strokeClass = "seam-ghost";

                        return (
                            <motion.line 
                                key={seam.id}
                                initial={false}
                                animate={{ x1: seam.x1, y1: seam.y1, x2: seam.x2, y2: seam.y2 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className={strokeClass} 
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>
            </svg>

            {/* HTML READABLE CONTENT */}
            <div className="content-layer">
                <AnimatePresence>
                    {Object.entries(nodes).map(([id, node]) => {
                        const anchor = anchors[id];
                        const isExpanded = expandedNodeId === id;
                        if (!anchor) return null;
                        
                        return (
                            <motion.div
                                key={id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, x: anchor.x, y: anchor.y, width: anchor.w, height: anchor.h }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                className={`content-face state-${node.state} ${isExpanded ? 'is-expanded' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (node.state !== 'ghost') onNodeTap(isExpanded ? null : id);
                                }}
                            >
                                <div className="semantic-content" style={{ padding: isRoot ? '24px' : '16px' }}>
                                    <div className="node-header">
                                        {isExpanded && isRoot && (
                                            <button className="btn-back" onClick={(e) => { e.stopPropagation(); onNodeTap(null); }}>
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                        )}
                                        <div className={`badge type-${node.type.toLowerCase()}`}>
                                            {node.type === "Source" ? <MessageSquareQuote size={12}/> : node.type === "Gap" ? <AlertCircle size={12}/> : <Activity size={12}/>}
                                            <span>{node.type}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-zone">
                                        <h3 style={{ fontSize: isRoot ? (isExpanded ? '24px' : '18px') : '14px' }}>{node.title}</h3>
                                        {node.subtitle && <p>{node.subtitle}</p>}
                                    </div>
                                    
                                    {/* MOSAIC INSIDE MOSAIC */}
                                    {isExpanded && node.children && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="recursive-container" 
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <WorkField 
                                                nodes={node.children} 
                                                width={Math.max(100, anchor.w - 48)} 
                                                height={Math.max(100, anchor.h - (isRoot ? 120 : 80))} 
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
                // Populate deeply nested children for true recursion test
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
          <WorkField nodes={nodes} width={1200} height={700} onNodeTap={setExpandedId} expandedNodeId={expandedId} />
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
  --surface-default: #fafafa;
  --surface-raised: #ffffff;
  --surface-tension: #fff5f5;
  --surface-ghost: #f8fafc;
  --border-subtle: #cbd5e1;
  --color-primary: #3b82f6;
  --color-gap: #ef4444;
  --color-text-main: #0f172a;
}
* { box-sizing: border-box; font-family: system-ui, sans-serif; }
body { margin: 0; background: var(--surface-default); color: var(--color-text-main); overflow: hidden; }
.living-surface { width: 100vw; height: 100vh; display: flex; flex-direction: column; }

.work-viewport {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.work-field {
  position: relative;
}

/* LAYER 1 & 2: CONTINUOUS GEOMETRY */
.geometry-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
/* Seams */
.seam-normal {
  stroke: var(--border-subtle);
  stroke-width: 1px;
}
.seam-tension {
  stroke: rgba(239, 68, 68, 0.5);
  stroke-width: 1.5px;
  stroke-dasharray: 4 4;
}
.seam-ghost {
  stroke: var(--border-subtle);
  stroke-width: 1px;
  stroke-dasharray: 2 6;
}

/* LAYER 3: HTML READABLE CONTENT (No Cards!) */
.content-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
.content-face {
  position: absolute;
  pointer-events: auto;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.semantic-content {
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}
.content-face.state-ghost .semantic-content { opacity: 0.3; }
.content-face.is-expanded .semantic-content { cursor: default; }

/* Text & Badges */
.node-header { display: flex; align-items: center; justify-content: space-between; }
.badge { display: flex; align-items: center; gap: 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #64748b; }
.badge.type-gap { color: #b91c1c; }
.badge.type-source { color: #15803d; }
.text-zone h3 { margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; line-height: 1.3; transition: font-size 0.3s ease; }
.text-zone p { margin: 6px 0 0; font-size: 14px; color: #475569; line-height: 1.5; }

/* Recursion container */
.recursive-container { 
   width: 100%; 
   flex: 1; 
   position: relative; 
   margin-top: 16px; 
}

/* Composer Bar */
.composer-bar { padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; position: absolute; bottom: 0; width: 100%; z-index: 100; pointer-events: auto; background: linear-gradient(to top, rgba(255,255,255,0.9) 50%, transparent); }
.onboarding-text { font-size: 14px; color: #64748b; font-weight: 500; transition: opacity 0.3s ease; }
.composer-form { display: flex; gap: 12px; width: 100%; max-width: 600px; box-shadow: 0 8px 32px rgba(0,0,0,0.06); border-radius: 32px; background: white; padding: 6px; border: 1px solid var(--border-subtle); }
.composer-form input { flex: 1; padding: 16px 20px; border-radius: 24px; border: none; font-size: 15px; outline: none; background: transparent; }
.composer-form button { width: 48px; height: 48px; border-radius: 24px; background: var(--color-primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.composer-form button:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-back { background: transparent; border: none; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.btn-back:hover { color: #0f172a; }
"""

with open(css_path, "w") as f:
    f.write(new_css)

