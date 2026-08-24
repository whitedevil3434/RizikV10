import os

main_tsx_path = "src/main.tsx"
css_path = "src/styles.css"

with open(css_path, "r") as f:
    css = f.read()

new_main_tsx = """import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Plus, ArrowLeft, MessageSquareQuote, AlertCircle, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compileNeed } from "./api/clink";
import "./styles.css";

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

// Returns standard CSS grid properties (row/col span) for each state
function getGridArea(id: string, expandedId: string | null) {
  if (expandedId === id) return { gridColumn: "1 / span 4", gridRow: "1 / span 4" };
  if (expandedId) return { display: 'none' }; // Hide others when expanded for now

  // Default Topology
  switch(id) {
    case "source": return { gridColumn: "1 / span 4", gridRow: "1 / span 1" };
    case "need": return { gridColumn: "1 / span 2", gridRow: "2 / span 2" };
    case "gap": return { gridColumn: "3 / span 2", gridRow: "2 / span 2" };
    case "capability": return { gridColumn: "1 / span 2", gridRow: "4 / span 1" };
    case "actor": return { gridColumn: "3 / span 1", gridRow: "4 / span 1" };
    case "responsibility": return { gridColumn: "4 / span 1", gridRow: "4 / span 1" };
    default: return { gridColumn: "auto", gridRow: "auto" };
  }
}

function MosaicSurface({ 
  nodes, 
  onNodeTap, 
  expandedNodeId
}: { 
  nodes: Record<string, CausalNode>;
  onNodeTap: (id: string | null) => void;
  expandedNodeId: string | null;
}) {
    return (
        <div className="mosaic-grid">
            <AnimatePresence>
                {Object.entries(nodes).map(([id, node]) => {
                    const isExpanded = expandedNodeId === id;
                    const gridArea = getGridArea(id, expandedNodeId);
                    if (gridArea.display === 'none') return null;

                    return (
                        <motion.div
                            key={id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`territory-cell state-${node.state} ${isExpanded ? 'is-expanded' : ''}`}
                            style={gridArea}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (node.state !== 'ghost' && node.type !== 'Source') {
                                    onNodeTap(isExpanded ? null : id);
                                }
                            }}
                        >
                            {/* SVG Void Background for the specific cell */}
                            <svg className="cell-svg-background" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <rect x="0" y="0" width="100" height="100" rx="8" className="svg-seam" />
                            </svg>

                            {/* HTML Content Island (Centered in the territory) */}
                            <div className="content-island">
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
                                    <div className="recursive-container" onClick={e => e.stopPropagation()}>
                                        <MosaicSurface 
                                            nodes={node.children} 
                                            onNodeTap={() => {}} 
                                            expandedNodeId={null} 
                                        />
                                    </div>
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
          <MosaicSurface 
             nodes={nodes} 
             onNodeTap={setExpandedId} 
             expandedNodeId={expandedId}
          />
      </div>
      <div className="composer-bar">
        <form className="composer-form" onSubmit={handleIntent}>
          <input 
            value={intentValue} onChange={(e) => setIntentValue(e.target.value)}
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
  padding: 40px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CSS Grid Engine */
.mosaic-grid {
  width: 100%;
  max-width: 1000px;
  height: 100%;
  max-height: 700px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px; /* The physical seam distance */
}

/* Territory Cell */
.territory-cell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  padding: 24px;
}

/* The SVG Void/Seam Layer (Z-index 0) */
.cell-svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
.svg-seam {
  fill: var(--surface-sunken);
  stroke: var(--border-subtle);
  stroke-width: 0.5px;
  transition: all 0.3s ease;
}

.territory-cell.state-blocked .svg-seam { fill: rgba(239, 68, 68, 0.05); stroke: rgba(239, 68, 68, 0.2); }
.territory-cell.state-active .svg-seam { fill: var(--surface-raised); }
.territory-cell.state-ghost .svg-seam { fill: transparent; stroke: var(--border-subtle); stroke-dasharray: 4; }

/* The HTML Content Island Layer (Z-index 1) */
.content-island {
  position: relative;
  z-index: 1;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 20px 24px;
  min-width: 220px;
  max-width: 320px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.territory-cell.state-blocked .content-island { border-color: rgba(239, 68, 68, 0.3); }
.territory-cell.state-ghost .content-island { background: transparent; border-color: transparent; box-shadow: none; opacity: 0.5; }

/* Text & Badges */
.node-header { display: flex; align-items: center; justify-content: space-between; }
.badge { display: flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; padding: 4px 8px; border-radius: 12px; background: #f1f5f9; color: #475569; }
.badge.type-gap { background: #fef2f2; color: #b91c1c; }
.badge.type-source { background: #f0fdf4; color: #15803d; }
.node-content h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0f172a; line-height: 1.4; }
.node-content p { margin: 4px 0 0; font-size: 13px; color: #64748b; line-height: 1.5; }

/* Recursion container */
.recursive-container { width: 100%; min-height: 200px; margin-top: 16px; }

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

