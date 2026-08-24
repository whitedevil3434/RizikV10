import os

main_tsx_path = "src/main.tsx"
css_path = "src/styles.css"

with open(css_path, "r") as f:
    css = f.read()

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
// 1. ATTENTION ENGINE (Weights)
// ─────────────────────────────────────────────────────────────
function calculateWeights(nodes: Record<string, CausalNode>, expandedId: string | null): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (expandedId === id) weights[id] = 5.0; // Claim maximum space
    else if (expandedId) weights[id] = 0.2; // Neighbors shrink
    else {
      if (node.state === "ghost") weights[id] = 0.5;
      else if (node.type === "Source") weights[id] = 0.8;
      else if (node.type === "Gap" && node.state === "blocked") weights[id] = 2.0;
      else if (node.state === "pending") weights[id] = 1.5;
      else weights[id] = 1.0;
    }
  }
  return weights;
}

// ─────────────────────────────────────────────────────────────
// 2. SPATIAL ALLOCATOR (The Mosaic Grid)
// ─────────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 8;

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

  // Seeding
  const seeds = [
    { x: 0, y: 0 }, { x: COLS - 1, y: 0 }, { x: 0, y: ROWS - 1 }, { x: COLS - 1, y: ROWS - 1 },
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }, { x: 0, y: Math.floor(ROWS/2) }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  for (let i = 0; i < sortedIds.length; i++) {
    queues[sortedIds[i]] = [seeds[i % seeds.length]];
  }

  const claimed: Record<string, number> = {};
  for (const id of sortedIds) claimed[id] = 0;

  // BFS claim
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
// 3. LAYER EXTRACTION (SVG Territory + HTML Bounding Box)
// ─────────────────────────────────────────────────────────────
function extractLayers(grid: (string | null)[][], id: string, width: number, height: number) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  
  const rects = [];
  let minX = 99999, minY = 99999, maxX = -1, maxY = -1;
  let count = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === id) {
        rects.push({ x: x * cellW, y: y * cellH, w: cellW + 1, h: cellH + 1 });
        minX = Math.min(minX, x * cellW);
        minY = Math.min(minY, y * cellH);
        maxX = Math.max(maxX, (x + 1) * cellW);
        maxY = Math.max(maxY, (y + 1) * cellH);
        count++;
      }
    }
  }

  if (count === 0) return { rects: [], bounds: { x: 0, y: 0, width: 0, height: 0 }};

  return { 
    rects, 
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } 
  };
}

// ─────────────────────────────────────────────────────────────
// 4. THE MOSAIC COMPONENT
// ─────────────────────────────────────────────────────────────
function MosaicSurface({ nodes, width, height, onNodeTap, expandedNodeId }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights), [weights]);

    return (
        <div className="mosaic-surface" style={{ width, height, position: 'relative' }}>
            {/* LAYER 1 & 2: SVG TERRITORY SEAMS */}
            <svg width={width} height={height} className="territory-svg-layer">
                <defs>
                   <filter id="goo">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                   </filter>
                </defs>
                <g filter="url(#goo)">
                    {Object.entries(nodes).map(([id, node]) => {
                        const { rects } = extractLayers(grid, id, width, height);
                        let fill = "var(--surface-sunken)";
                        if (node.state === "active" || expandedNodeId === id) fill = "var(--surface-raised)";
                        if (node.state === "blocked") fill = "#fee2e2"; 
                        if (node.state === "ghost") fill = "transparent";
                        
                        return (
                            <g key={`svg-${id}`} className={`svg-territory state-${node.state}`}>
                                {rects.map((r, i) => (
                                    <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} rx={2} />
                                ))}
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* LAYER 3: HTML CONTENT ISLANDS */}
            <div className="content-island-layer">
                <AnimatePresence>
                    {Object.entries(nodes).map(([id, node]) => {
                        const { bounds } = extractLayers(grid, id, width, height);
                        const isExpanded = expandedNodeId === id;
                        if (bounds.width === 0) return null;
                        
                        return (
                            <motion.div
                                key={id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                                className={`content-bounds state-${node.state}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (node.state !== 'ghost' && node.type !== 'Source') onNodeTap(isExpanded ? null : id);
                                }}
                            >
                                <div className={`island-inner ${isExpanded ? 'is-expanded' : ''}`}>
                                    <div className="node-header">
                                        {isExpanded && (
                                            <button className="btn-back" onClick={(e) => { e.stopPropagation(); onNodeTap(null); }}>
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                        )}
                                        <div className={`badge type-${node.type.toLowerCase()}`}>
                                            {node.type === "Source" ? <MessageSquareQuote size={12}/> : node.type === "Gap" ? <AlertCircle size={12}/> : <Activity size={12}/>}
                                            <span>{node.type}</span>
                                        </div>
                                    </div>
                                    <div className="node-content">
                                        <h3>{node.title}</h3>
                                        {node.subtitle && <p>{node.subtitle}</p>}
                                    </div>
                                    
                                    {isExpanded && node.children && (
                                        <div className="recursive-container" onClick={e => e.stopPropagation()}>
                                            <MosaicSurface nodes={node.children} width={bounds.width - 64} height={bounds.height - 120} onNodeTap={() => {}} expandedNodeId={null} />
                                        </div>
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
  need: { id: "need", type: "Need", title: "Waiting for intent", state: "ghost" },
  capability: { id: "cap", type: "Capability", title: "Potential capability", state: "ghost" },
  actor: { id: "actor", type: "Actor", title: "Unknown actor", state: "ghost" },
  gap: { id: "gap", type: "Gap", title: "Hidden gap", state: "ghost" },
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
                next.need = { ...next.need, title: draft.desiredState?.title || "Need Resolved", state: "active" };
                if (draft.gap) {
                   next.gap = { 
                       ...next.gap, title: "Missing Requirement", subtitle: draft.gap, state: "blocked",
                       children: {
                           resolve: { id: "resolve", type: "Actor", title: "Find Potential Actor", state: "ghost" },
                           commit: { id: "commit", type: "Commitment", title: "Awaiting Commitment", state: "ghost" }
                       }
                   };
                } else { delete next.gap; }
                if (draft.dependencies?.length) {
                   next.responsibility = { id: "resp", type: "Responsibility", title: draft.dependencies[0].action || "Action required", state: "pending" };
                   next.actor = { ...next.actor, title: draft.dependencies[0].role || "Actor needed", state: "active" };
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
      <div className="mosaic-scroll-viewport">
          <MosaicSurface nodes={nodes} width={1000} height={640} onNodeTap={setExpandedId} expandedNodeId={expandedId} />
      </div>
      <div className="composer-bar">
        <form className="composer-form" onSubmit={handleIntent}>
          <input value={intentValue} onChange={(e) => setIntentValue(e.target.value)} placeholder="Tell C-Link what you need..." disabled={viewState === "COMPILING" || viewState === "SOURCE_CREATED"} />
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
  --surface-default: #ffffff;
  --surface-raised: #f8fafc;
  --surface-sunken: #f1f5f9;
  --border-subtle: #e2e8f0;
  --color-primary: #3b82f6;
  --color-gap: #ef4444;
  --color-text-main: #0f172a;
}
* { box-sizing: border-box; font-family: system-ui, sans-serif; }
body { margin: 0; background: var(--surface-default); color: var(--color-text-main); }
.living-surface { width: 100vw; height: 100vh; display: flex; flex-direction: column; }

.mosaic-scroll-viewport {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.mosaic-surface {
  position: relative;
}

/* Layer 1 & 2: SVG Territories */
.territory-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
.svg-territory rect {
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  stroke: rgba(0,0,0,0.03);
  stroke-width: 1px;
}
.svg-territory.state-ghost rect { stroke-dasharray: 4; fill: transparent; }

/* Layer 3: HTML Content Bounds */
.content-island-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
.content-bounds {
  position: absolute;
  pointer-events: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px; /* The breathing room! territory > content */
}
.island-inner {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
  width: fit-content;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}
.content-bounds.state-blocked .island-inner { border-color: rgba(239, 68, 68, 0.3); }
.content-bounds.state-ghost .island-inner { background: transparent; border-color: transparent; box-shadow: none; opacity: 0.5; }
.island-inner.is-expanded {
  width: 100%;
  height: 100%;
  border-color: var(--color-primary);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  cursor: default;
}

/* Text & Badges */
.node-header { display: flex; align-items: center; justify-content: space-between; }
.badge { display: flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; padding: 4px 8px; border-radius: 12px; background: #f1f5f9; color: #475569; }
.badge.type-gap { background: #fef2f2; color: #b91c1c; }
.badge.type-source { background: #f0fdf4; color: #15803d; }
.node-content h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0f172a; line-height: 1.4; }
.node-content p { margin: 4px 0 0; font-size: 13px; color: #64748b; line-height: 1.5; }

/* Recursion container */
.recursive-container { width: 100%; flex: 1; min-height: 200px; margin-top: 16px; position: relative; }

/* Composer Bar */
.composer-bar { padding: 24px; background: white; border-top: 1px solid var(--border-subtle); display: flex; justify-content: center; }
.composer-form { display: flex; gap: 12px; width: 100%; max-width: 600px; }
.composer-form input { flex: 1; padding: 16px 20px; border-radius: 24px; border: 1px solid var(--border-subtle); font-size: 15px; outline: none; transition: border-color 0.2s; }
.composer-form input:focus { border-color: var(--color-primary); }
.composer-form button { width: 52px; height: 52px; border-radius: 26px; background: var(--color-primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.composer-form button:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-back { background: transparent; border: none; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 0; }
"""

with open(css_path, "w") as f:
    f.write(new_css)
