import os

main_tsx_path = "apps/clink-web/src/main.tsx"
css_path = "apps/clink-web/src/styles.css"

new_main_tsx = """import React, { useState, useEffect, useMemo } from "react";
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
    if (expandedId === id) weights[id] = 50.0; 
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
// 2. TERRITORY SOLVER (DYNAMIC GRID)
// ─────────────────────────────────────────────────────────────
const TOPOLOGY = ["source", "need", "capability", "actor", "gap", "responsibility", "resolve", "commit", "spec", "timeline", "task", "proof"];

function allocateTerritories(weights: Record<string, number>, COLS: number, ROWS: number) {
  const grid: (string | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalCells = COLS * ROWS;
  const allocations: Record<string, number> = {};
  
  let remaining = totalCells;
  const sortedIds = Object.keys(weights).sort((a, b) => {
      const idxA = TOPOLOGY.indexOf(a);
      const idxB = TOPOLOGY.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });
  
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
    capability: { x: 1, y: Math.max(1, ROWS - 2) },
    actor: { x: Math.max(1, COLS - 2), y: Math.max(1, ROWS - 2) },
    gap: { x: Math.max(1, COLS - 2), y: 1 },
    responsibility: { x: Math.floor(COLS/2), y: Math.max(1, ROWS - 2) }
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

function extractGeometry(grid: (string | null)[][], width: number, height: number, nodes: Record<string, CausalNode>, COLS: number, ROWS: number) {
  const cellW = width / COLS;
  const cellH = height / ROWS;

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
  return { anchors, cellW, cellH };
}

// ─────────────────────────────────────────────────────────────
// 3. ONE WORK FIELD (Responsive)
// ─────────────────────────────────────────────────────────────
const SPRING: any = { type: "spring", stiffness: 150, damping: 20 }; 

function WorkField({ nodes, width, height, onNodeTap, expandedNodeId, isRoot = true, cols, rows }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; isRoot?: boolean; cols: number; rows: number; }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights, cols, rows), [weights, cols, rows]);
    const { anchors, cellW, cellH } = useMemo(() => extractGeometry(grid, width, height, nodes, cols, rows), [grid, width, height, nodes, cols, rows]);

    // Dynamic Filter Parameters for Responsiveness
    // If cells are smaller (mobile), blur and erode must be smaller so they don't erase the shape!
    const minCellSize = Math.min(cellW, cellH);
    const blurRadius = Math.max(4, minCellSize * 0.2); 
    const erodeRadius = Math.max(2, minCellSize * 0.12);

    return (
        <div className="work-field" style={{ width, height, position: 'relative' }}>
            <svg width={0} height={0} style={{ position: 'absolute' }}>
                <defs>
                    <filter id="squircle">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius} result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 100 -50" result="solid" />
                        <feMorphology in="solid" operator="erode" radius={erodeRadius} result="eroded" />
                    </filter>
                </defs>
            </svg>

            <svg width={width} height={height} className="geometry-layer">
                <g>
                    {Object.entries(nodes).map(([id, node]) => {
                        return (
                            <g key={`fill-${id}`} className={`svg-territory state-${node.state}`} filter="url(#squircle)">
                                {grid.map((row, y) => row.map((cellId, x) => {
                                    if (cellId === id) {
                                        return (
                                            <motion.rect 
                                                key={`${x}-${y}`} 
                                                initial={false}
                                                animate={{ x: x*cellW - 1, y: y*cellH - 1, width: cellW + 2, height: cellH + 2 }}
                                                fill="#0a0a0a"
                                                transition={SPRING}
                                            />
                                        );
                                    }
                                    return null;
                                }))}
                            </g>
                        );
                    })}
                </g>
            </svg>

            <div className="content-layer">
                <AnimatePresence>
                    {Object.entries(nodes).map(([id, node]) => {
                        const anchor = anchors[id];
                        const isExpanded = expandedNodeId === id;
                        if (!anchor) return null;
                        
                        const text = node.state === "ghost" ? "rgba(255, 255, 255, 0.4)" : "#ffffff";
                        
                        return (
                            <motion.div
                                key={id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, x: anchor.x, y: anchor.y, width: anchor.w, height: anchor.h }}
                                exit={{ opacity: 0 }}
                                transition={SPRING}
                                className={`content-face state-${node.state} ${isExpanded ? 'is-expanded' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNodeTap(isExpanded ? null : id);
                                }}
                            >
                                <div className="semantic-content" style={{ padding: isExpanded ? '24px' : '16px' }}>
                                    <div className="node-header">
                                        {isExpanded && isRoot && (
                                            <button className="btn-back" style={{color: text}} onClick={(e) => { e.stopPropagation(); onNodeTap(null); }}>
                                                <ArrowLeft size={16} /> <span style={{fontWeight: 700}}>BACK</span>
                                            </button>
                                        )}
                                        <div className="badge" style={{ color: text, background: 'rgba(255,255,255,0.1)' }}>
                                            {node.type === "Source" ? <MessageSquareQuote size={14}/> : node.type === "Gap" ? <AlertCircle size={14}/> : <Activity size={14}/>}
                                            <span>{node.type}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-zone" style={{ color: text }}>
                                        <motion.h3 layout className={isExpanded ? 'text-expanded' : 'text-normal'}>{node.title}</motion.h3>
                                        {node.subtitle && <p style={{opacity: 0.8}}>{node.subtitle}</p>}
                                    </div>
                                    
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
                                                width={Math.max(80, anchor.w - (width < 600 ? 32 : 80))} 
                                                height={Math.max(80, anchor.h - (isRoot ? (width < 600 ? 100 : 160) : 80))} 
                                                onNodeTap={() => {}} 
                                                expandedNodeId={null}
                                                isRoot={false}
                                                cols={Math.floor(cols/2)}
                                                rows={Math.floor(rows/2)}
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
  
  // Responsiveness
  const [windowSize, setWindowSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });
  useEffect(() => {
     const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.w < 768;
  const cols = isMobile ? 8 : 16;
  const rows = isMobile ? 12 : 12;

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
          {/* We now pass the dynamic window size instead of hardcoded 1200x760! */}
          <WorkField nodes={nodes} width={windowSize.w} height={windowSize.h} onNodeTap={setExpandedId} expandedNodeId={expandedId} cols={cols} rows={rows} />
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
  --surface-default: #f9f6f0; 
  --color-primary: #0f172a;
  --color-text-main: #0f172a;
}
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif; }
body { margin: 0; background: var(--surface-default); color: var(--color-text-main); overflow: hidden; /* Prevent mobile scroll bounce */ overscroll-behavior: none; }
.living-surface { width: 100vw; height: 100vh; display: flex; flex-direction: column; }

.work-viewport {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.work-field { position: relative; }

/* CONTINUOUS GEOMETRY */
.geometry-layer { position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }
.svg-territory rect { stroke: none; }
.svg-territory.state-ghost { opacity: 0.3; }

/* CONTENT */
.content-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
.content-face { position: absolute; pointer-events: auto; display: flex; justify-content: flex-start; align-items: flex-start; }
.semantic-content {
  width: 100%; height: 100%; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: opacity 0.3s ease;
  overflow: hidden; /* Prevent text spilling on mobile */
}
.content-face.state-ghost .semantic-content { opacity: 0.8; }
.content-face.is-expanded .semantic-content { cursor: default; }

/* Typography */
.node-header { display: flex; align-items: center; justify-content: space-between; }
.badge { display: flex; align-items: center; gap: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
.text-zone h3 { margin: 0; font-weight: 700; letter-spacing: -0.5px; }
.text-normal { font-size: 16px; line-height: 1.2; }
.text-expanded { font-size: 32px; line-height: 1.1; font-weight: 800 !important; letter-spacing: -1px !important; }
.text-zone p { margin: 4px 0 0; font-size: 13px; font-weight: 500; opacity: 0.8; line-height: 1.2; }

.recursive-container { width: 100%; flex: 1; position: relative; margin-top: 12px; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 8px; display: flex; justify-content: center; align-items: center; }

/* Composer Bar */
.composer-bar { padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; position: absolute; bottom: 0; width: 100%; z-index: 100; pointer-events: none; background: linear-gradient(to top, rgba(249, 246, 240, 1) 40%, transparent); }
.onboarding-text { font-size: 14px; color: #64748b; font-weight: 600; letter-spacing: 0.5px; transition: opacity 0.3s ease; }
.composer-form { pointer-events: auto; display: flex; gap: 10px; width: 100%; max-width: 680px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border-radius: 30px; background: white; padding: 6px; border: 1px solid rgba(0,0,0,0.05); }
.composer-form input { flex: 1; padding: 16px 20px; border-radius: 24px; border: none; font-size: 16px; font-weight: 500; outline: none; background: transparent; color: black; min-width: 0; }
.composer-form button { width: 50px; height: 50px; border-radius: 25px; background: #0a0a0a; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; flex-shrink: 0; }
.composer-form button:hover { transform: scale(1.05); }
.composer-form button:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
.btn-back { background: transparent; border: none; font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; border-radius: 20px; font-weight: 700; transition: transform 0.2s; white-space: nowrap; }
.btn-back:hover { transform: scale(0.95); background: rgba(255,255,255,0.1); }

/* MOBILE RESPONSIVENESS */
@media (max-width: 768px) {
  .text-normal { font-size: 14px; }
  .text-expanded { font-size: 24px; }
  .badge { font-size: 9px; padding: 4px 8px; }
  .composer-bar { padding: 12px; }
  .composer-form input { font-size: 14px; padding: 12px 16px; }
  .composer-form button { width: 44px; height: 44px; }
  .semantic-content { padding: 12px !important; }
}
"""

with open(css_path, "w") as f:
    f.write(new_css)

