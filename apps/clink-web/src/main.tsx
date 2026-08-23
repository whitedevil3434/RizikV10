import { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { 
  listCommitments, 
  listExpectations, 
  createExpectation, 
  type ClinkApiExpectation 
} from "./api/clink";
import { ArrowUpRight, Maximize2, Minimize2 } from "lucide-react";

type Status = "accepted" | "pending" | "in_progress" | "fulfilled" | "partially_accepted" | "disputed" | "settled" | "completed";
type Commitment = { id: string; counterparty: string; type: string; summary: string; amount: string; due: string; status: Status; updated: string; initials: string };
type Expectation = ClinkApiExpectation;

function App() {
  const [expectations, setExpectations] = useState<Expectation[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listExpectations(), listCommitments()]).then(([needs, remotes]) => {
      setExpectations(needs || []);
      setCommitments((remotes || []).map(toUiCommitment));
    }).catch(e => {
      console.log("Mocking initial state for UI testing");
    });
  }, []);

  async function handleCompose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const intent = String(data.get("intent") || "").trim();
    if (!intent) return;
    
    // Pass raw intent as the 'item'. In a real app, compiler extracts quantity/unit/deadline.
    try {
      const created = await createExpectation({ 
        ownerPartyId: "Your Business", 
        counterpartyPartyId: "Unknown Capability", 
        item: intent, 
        quantity: 1, 
        unit: "unit", 
        neededBy: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        acceptanceCriteria: "TBD by compiler",
        currency: "BDT"
      });
      setExpectations(prev => [created, ...prev]);
    } catch (e) {
      // Fallback for UI testing when backend is not running
      const mockCreated = {
        id: "exp_" + Date.now(),
        status: "draft",
        ownerPartyId: "Your Business",
        counterpartyPartyId: "Unknown Capability",
        item: intent,
        quantity: 1,
        unit: "unit",
        neededBy: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        acceptanceCriteria: "TBD by compiler",
        currency: "BDT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: []
      } as unknown as Expectation;
      setExpectations(prev => [mockCreated, ...prev]);
    }
    
    (event.target as HTMLFormElement).reset();
  }

  const allWork = [...expectations, ...commitments];

  return (
    <div className="living-surface">
      <div className="mosaic-canvas">
        {allWork.length === 0 ? (
          <div className="empty-state">Nothing has claimed territory yet. Tell C-Link what you need.</div>
        ) : (
          allWork.map(work => (
            <MosaicCard 
              key={work.id} 
              work={work} 
              isExpanded={expandedId === work.id} 
              onToggle={() => setExpandedId(expandedId === work.id ? null : work.id)} 
            />
          ))
        )}
      </div>

      <div className="composer-bar">
        <form onSubmit={handleCompose} className="composer-form">
          <input 
            name="intent" 
            placeholder="Tell C-Link what you need... (e.g., 'I need 200kg chicken by tomorrow')" 
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

function MosaicCard({ work, isExpanded, onToggle }: { work: any, isExpanded: boolean, onToggle: () => void }) {
  const isExpectation = 'item' in work; // simple differentiator
  const title = isExpectation ? `${work.quantity} ${work.unit} · ${work.item}` : work.summary;
  const subtitle = isExpectation ? work.counterpartyPartyId : work.counterparty;
  const status = isExpectation ? work.status : work.status;
  
  // Calculate consequence/territory based on status
  // Needs attention (sent/pending) -> high consequence -> larger territory
  const isHighConsequence = status === "sent" || status === "pending";
  
  let sizeClass = "card-normal";
  if (isExpanded) sizeClass = "card-expanded";
  else if (isHighConsequence) sizeClass = "card-large";
  else if (status === "completed" || status === "converted") sizeClass = "card-small";

  return (
    <div className={`mosaic-card ${sizeClass}`} onClick={!isExpanded ? onToggle : undefined}>
      <div className="card-header">
        <span className="card-status">{status.replace('_', ' ').toUpperCase()}</span>
        {isExpanded && (
          <button className="icon-button" onClick={onToggle}>
            <Minimize2 size={16} />
          </button>
        )}
      </div>
      <div className="card-body">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        
        {isExpanded && (
          <div className="card-deep-details">
            <div className="timeline">
              <div className="timeline-item">
                <span className="dot active"></span>
                <p><strong>Work materialized</strong> in the Living Mosaic</p>
              </div>
              <div className="timeline-item">
                <span className="dot"></span>
                <p><strong>Awaiting counterparty</strong> capability response</p>
              </div>
            </div>
            
            {isExpectation && status === "responded" && work.response && (
              <div className="capability-response">
                <strong>Counterparty capability claim:</strong>
                <p>{work.response.type}</p>
                <button className="primary-action">Accept Responsibility</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function toUiCommitment(item: any): Commitment {
  const version = item.versions[item.versions.length - 1];
  const status: Status = ["accepted", "in_progress", "fulfilled", "partially_accepted", "disputed", "settled", "closed"].includes(item.status) ? (item.status === "closed" ? "completed" : item.status as Status) : "pending";
  return { id: item.id, counterparty: item.counterpartyPartyId, type: "Business", summary: `${version?.quantity || 1} ${version?.unit || "item"} ${version?.item || "commitment"}`, amount: `৳${Number(version?.price || 0).toLocaleString("en-BD")}`, due: status === "completed" ? "Closed" : `Due ${version?.deadline || "soon"}`, status, updated: item.events?.at(-1)?.occurredAt ? "Updated recently" : "Created recently", initials: item.counterpartyPartyId.slice(0, 2).toUpperCase() };
}

createRoot(document.getElementById("root")!).render(<App />);
