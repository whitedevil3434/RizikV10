import os
import re

main_tsx_path = "src/main.tsx"
css_path = "src/styles.css"

with open(main_tsx_path, "r") as f:
    main_tsx = f.read()

with open(css_path, "r") as f:
    css = f.read()

# We will completely rewrite main.tsx to use the 3-layer architecture.
new_main_tsx = """import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Plus, ArrowLeft, MessageSquareQuote, AlertCircle, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compileNeed } from "./api/clink";
import "./styles.css";

// ─────────────────────────────────────────────────────────────
// 1. DATA MODEL
// ─────────────────────────────────────────────────────────────
type EntityState = "resolved" | "pending" | "blocked" | "active" | "ghost" | "source";
type EntityType = "Source" | "Need" | "Capability" | "Responsibility" | "Commitment" | "Actor" | "Gap";

type CausalNode = {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  state: EntityState;
  children?: Record<string, CausalNode>;
};

// ─────────────────────────────────────────────────────────────
// 2. ATTENTION ENGINE
// ─────────────────────────────────────────────────────────────
function calculateWeights(nodes: Record<string, CausalNode>, expandedId: string | null): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (expandedId === id) {
      weights[id] = 3.0; // Expanded node claims massive space
    } else if (expandedId) {
      weights[id] = 0.2; // Neighbors shrink
    } else {
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
// 3. SPATIAL ALLOCATOR (Grid-based Territory Solver)
// ─────────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 8;

function allocateTerritories(weights: Record<string, number>) {
  const grid: (string | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  
  // Normalize weights to cell counts
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalCells = COLS * ROWS;
  const allocations: Record<string, number> = {};
  
  let remainingCells = totalCells;
  const sortedIds = Object.entries(weights).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  
  for (let i = 0; i < sortedIds.length; i++) {
    const id = sortedIds[i];
    if (i === sortedIds.length - 1) {
      allocations[id] = remainingCells;
    } else {
      const cells = Math.max(1, Math.round((weights[id] / totalWeight) * totalCells));
      allocations[id] = cells;
      remainingCells -= cells;
    }
  }

  // Greedy BFS to claim contiguous cells
  const seedPoints = [
    { x: 0, y: 0 }, { x: COLS - 1, y: 0 }, { x: 0, y: ROWS - 1 }, { x: COLS - 1, y: ROWS - 1 },
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  for (let i = 0; i < sortedIds.length; i++) {
    const id = sortedIds[i];
    const seed = seedPoints[i % seedPoints.length];
    queues[id] = [seed];
  }

  const claimedCount: Record<string, number> = {};
  for (const id of sortedIds) claimedCount[id] = 0;

  let madeProgress = true;
  while (madeProgress) {
    madeProgress = false;
    for (const id of sortedIds) {
      if (claimedCount[id] >= allocations[id]) continue;
      
      const q = queues[id];
      let claimed = false;
      while (q.length > 0 && !claimed) {
        const {x, y} = q.shift()!;
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] === null) {
          grid[y][x] = id;
          claimedCount[id]++;
          claimed = true;
          madeProgress = true;
          // Add neighbors
          q.push({x: x+1, y}); q.push({x: x-1, y}); q.push({x, y: y+1}); q.push({x, y: y-1});
        }
      }
    }
  }

  // Fill any remaining holes
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === null) grid[y][x] = sortedIds[0];
    }
  }
  
  return grid;
}

// Extract SVG Path and Centroid
function extractGeometry(grid: (string | null)[][], id: string, width: number, height: number) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  
  const rects = [];
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let cellCount = 0;
  let sumX = 0, sumY = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === id) {
        rects.push({ x: x * cellW, y: y * cellH, w: cellW + 0.5, h: cellH + 0.5 }); // +0.5 overlaps seams slightly
        minX = Math.min(minX, x * cellW);
        minY = Math.min(minY, y * cellH);
        maxX = Math.max(maxX, (x + 1) * cellW);
        maxY = Math.max(maxY, (y + 1) * cellH);
        sumX += x;
        sumY += y;
        cellCount++;
      }
    }
  }

  // Centroid for Content Island
  const centroidX = cellCount > 0 ? (sumX / cellCount) * cellW + (cellW / 2) : 0;
  const centroidY = cellCount > 0 ? (sumY / cellCount) * cellH + (cellH / 2) : 0;
  
  // Bounding box dimensions for content island restriction
  const islandW = Math.max(200, (maxX - minX) * 0.7);
  const islandH = Math.max(100, (maxY - minY) * 0.7);

  return { 
    rects, 
    island: { 
      x: centroidX - (islandW / 2), 
      y: centroidY - (islandH / 2), 
      width: islandW, 
      height: islandH 
    } 
  };
}


// ─────────────────────────────────────────────────────────────
// 4. THE LIVING MOSAIC COMPONENT (Recursive)
// ─────────────────────────────────────────────────────────────
function MosaicSurface({ 
  nodes, 
  width, 
  height, 
  onNodeTap, 
  expandedNodeId,
  globalViewState
}: { 
  nodes: Record<string, CausalNode>;
  width: number;
  height: number;
  onNodeTap: (id: string | null) => void;
  expandedNodeId: string | null;
  globalViewState: string;
}) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights), [weights]);

    return (
        <div className="mosaic-surface" style={{ width, height, position: 'relative' }}>
            {/* LAYER 1 & 2: INVISIBLE TERRITORY + SVG SEAMS (VOID) */}
            <svg width={width} height={height} className="territory-void-layer">
                <defs>
                   <filter id="goo">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                   </filter>
                </defs>
                <g filter="url(#goo)">
                    {Object.entries(nodes).map(([id, node]) => {
                        const { rects } = extractGeometry(grid, id, width, height);
                        const isExpanded = expandedNodeId === id;
                        
                        let fill = "var(--surface-sunken)";
                        if (node.state === "active") fill = "var(--surface-raised)";
                        if (node.state === "blocked") fill = "rgba(239, 68, 68, 0.1)"; // Red tint for tension
                        if (isExpanded) fill = "var(--surface-raised)";
                        
                        return (
                            <g key={`svg-${id}`} className={`svg-territory state-${node.state}`} style={{ transition: 'all 0.5s ease-in-out' }}>
                                {rects.map((r, i) => (
                                    <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} rx={4} />
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
                        const { island } = extractGeometry(grid, id, width, height);
                        const isExpanded = expandedNodeId === id;
                        
                        return (
                            <motion.div
                                key={id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ 
                                    opacity: 1, scale: 1, 
                                    x: island.x, y: island.y, 
                                    width: island.width, height: island.height 
                                }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`content-island state-${node.state} ${isExpanded ? 'is-expanded' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (node.state !== 'ghost' && node.type !== 'Source') {
                                        onNodeTap(isExpanded ? null : id);
                                    }
                                }}
                            >
                                <div className="island-inner">
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

                                    {/* RECURSION */}
                                    {isExpanded && node.children && (
                                        <div className="recursive-mosaic-container" onClick={e => e.stopPropagation()}>
                                            <MosaicSurface 
                                                nodes={node.children} 
                                                width={island.width - 32} 
                                                height={island.height - 90} 
                                                onNodeTap={() => {}} 
                                                expandedNodeId={null} 
                                                globalViewState="COMPILED"
                                            />
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

// ─────────────────────────────────────────────────────────────
// 5. THE ROOT APPLICATION
// ─────────────────────────────────────────────────────────────
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
         } else fallbackCompile(text);
       } catch { fallbackCompile(text); }
       setViewState("COMPILED");
    }, 1500); 
  };

  const fallbackCompile = (text: string) => {
      setNodes(prev => ({
          ...prev,
          need: { ...prev.need, title: "English Learning", state: "active" },
          gap: { 
              ...prev.gap, title: "Speaking Partner", subtitle: "No partner available", state: "blocked",
              children: {
                  actor_search: { id: "actor_search", type: "Actor", title: "Search Global Partners", state: "ghost" },
                  capability_check: { id: "capability_check", type: "Capability", title: "Verify Schedule (30m/day)", state: "pending" }
              }
          },
          capability: { id: "cap2", type: "Capability", title: "30 mins / day", state: "resolved" }
      }));
  };

  return (
    <div className="living-surface">
      <div className="mosaic-scroll-viewport">
          <MosaicSurface 
             nodes={nodes} 
             width={1000} 
             height={600} 
             onNodeTap={setExpandedId} 
             expandedNodeId={expandedId}
             globalViewState={viewState}
          />
      </div>

      <div className="composer-bar">
        <form className="composer-form" onSubmit={handleIntent}>
          <input 
            value={intentValue}
            onChange={(e) => setIntentValue(e.target.value)}
            placeholder="Tell C-Link what you need..." 
            disabled={viewState === "COMPILING" || viewState === "SOURCE_CREATED"}
          />
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

# Now update CSS to support the 3 layers
new_css = css.replace(".geometry-card", ".content-island")
new_css += """
.territory-void-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
.svg-territory rect {
  stroke: rgba(0,0,0,0.05);
  stroke-width: 1px;
}
.content-island-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
.content-island {
  position: absolute;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.island-inner {
  background: var(--surface-default);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-island.is-expanded .island-inner {
  border-color: var(--color-primary);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
.content-island.state-ghost .island-inner {
  background: transparent;
  border-style: dashed;
  box-shadow: none;
  opacity: 0.6;
}
"""

with open(css_path, "w") as f:
    f.write(new_css)

print("Layer engine built.")
