import React, { useState, useEffect, useMemo } from "react";
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
    if (expandedId === id) weights[id] = 40.0; 
    else if (expandedId) {
      if (node.state === "ghost") weights[id] = 2.0;
      else weights[id] = 8.0; 
    }
    else {
      if (node.state === "ghost") weights[id] = 4.0;
      else if (node.type === "Source") weights[id] = 8.0;
      else if (node.type === "Gap" && node.state === "blocked") weights[id] = 20.0;
      else if (node.state === "pending") weights[id] = 12.0;
      else weights[id] = 10.0;
    }
  }
  return weights;
}

// ─────────────────────────────────────────────────────────────
// 2. TERRITORY SOLVER (DYNAMIC TETRIS)
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

// ─────────────────────────────────────────────────────────────
// 3. CONTINUOUS GEOMETRY ENGINE (ORGANIC SEAMS + INVISIBLE RECTANGLES)
// ─────────────────────────────────────────────────────────────
function extractGeometry(grid: (string | null)[][], width: number, height: number, nodes: Record<string, CausalNode>, COLS: number, ROWS: number) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const seams = [];
  
  // Create organic SVG seams
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
// 4. ONE WORK FIELD (Continuous SVG Face Engine)
// ─────────────────────────────────────────────────────────────

const SPRING: any = { type: "spring", stiffness: 180, damping: 25 }; 

function WorkField({ nodes, width, height, onNodeTap, expandedNodeId, isRoot = true, cols, rows }: { nodes: Record<string, CausalNode>; width: number; height: number; onNodeTap: (id: string | null) => void; expandedNodeId: string | null; isRoot?: boolean; cols: number; rows: number }) {
    const weights = useMemo(() => calculateWeights(nodes, expandedNodeId), [nodes, expandedNodeId]);
    const grid = useMemo(() => allocateTerritories(weights, cols, rows), [weights, cols, rows]);
    const { seams, anchors, cellW, cellH } = useMemo(() => extractGeometry(grid, width, height, nodes, cols, rows), [grid, width, height, nodes, cols, rows]);

    const getColors = (node: CausalNode, isExpanded: boolean) => {
        // Semantic Text colors over the empty white surface
        let text = "#111111"; // Default text color
        let ghostColor = "#888888";
        
        if (node.type === "Source") { text = "#1976D2"; } // Blue
        else if (node.type === "Gap" || node.type === "Responsibility") { text = "#C62828"; } // Red
        else if (node.type === "Capability") { text = "#2E7D32"; } // Green
        
        // Ghost state
        if (node.state === "ghost") {
            text = ghostColor;
        }
        return { text };
    };

    return (
        <div className="work-field" style={{ width, height, position: 'relative' }}>
            {/* LAYER 0: SVG BOUNDARY & SEAMS (NO TETRIS FILL, JUST SEAMS AND EMPTY SPACE) */}
            <svg className="svg-boundary-layer" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* The Outer Continuous Work Boundary (Only if root) */}
                {isRoot && <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />}
                
                {/* Dynamic Organic Seams based on State */}
                <g className="seams">
                    {seams.map((seam) => {
                        let strokeColor = "rgba(0,0,0,0.06)"; // Faint boundary
                        let strokeWidth = 2;
                        let dashArray = "none";
                        
                        const n1 = seam.id1 ? nodes[seam.id1] : null;
                        const n2 = seam.id2 ? nodes[seam.id2] : null;
                        
                        // Tension/Blocked seam styling
                        if (n1?.state === "blocked" || n2?.state === "blocked") {
                            strokeColor = "#E53935"; // Red Tension
                            strokeWidth = 2;
                            dashArray = "4 4";
                        } else if (n1?.state === "active" || n2?.state === "active") {
                            strokeColor = "#1976D2"; // Blue Active
                            strokeWidth = 2;
                        } else if (n1?.state === "ghost" && n2?.state === "ghost") {
                            dashArray = "2 4"; // Very faint latent territory
                        }

                        return (
                            <motion.line 
                                key={seam.id}
                                initial={false}
                                animate={{ x1: seam.x1, y1: seam.y1, x2: seam.x2, y2: seam.y2 }}
                                transition={SPRING}
                                stroke={strokeColor}
                                strokeWidth={strokeWidth}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>
            </svg>

            {/* LAYER 1: HTML CONTENT (Absolute positioned over SVG, NO CARDS, JUST TEXT) */}
            <div className="html-content-layer">
                <AnimatePresence>
                    {Object.entries(nodes).map(([id, node]) => {
                        const anchor = anchors[id];
                        const isExpanded = expandedNodeId === id;
                        if (!anchor) return null;
                        const { text } = getColors(node, isExpanded);
                        
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
                                        <div className={`badge type-${node.type.toLowerCase()}`} style={node.state === "ghost" ? {opacity: 0.5} : {}}>
                                            {node.type === "Source" ? <MessageSquareQuote size={12}/> : node.type === "Gap" ? <AlertCircle size={12}/> : <Activity size={12}/>}
                                            <span>{node.type}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-zone" style={{ color: text }}>
                                        <motion.h3 layout className={isExpanded ? 'text-expanded' : 'text-normal'}>{node.title}</motion.h3>
                                        {node.subtitle && <p className="node-sub">{node.subtitle}</p>}
                                    </div>
                                    
                                    {/* MOSAIC INSIDE MOSAIC (Recursion) */}
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
                       ...next.gap, title: "Missing Requirement", subtitle: draft.gap, state: "blocked",
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
      <div className="mosaic-scroll-viewport">
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
