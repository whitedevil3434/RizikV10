import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronDown, ChevronUp, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import "./visual-test.css";

type Role = "Restaurant" | "Supplier" | "Farm A" | "Farm B";
type Farm = { id: "a" | "b"; name: "Farm A" | "Farm B"; confirmed: boolean; quality: boolean; expanded: boolean };

const roleCopy: Record<Role, { eyebrow: string; title: string }> = {
  Restaurant: { eyebrow: "MY NEED", title: "CHICKEN" },
  Supplier: { eyebrow: "YOUR SUPPLY", title: "CHICKEN" },
  "Farm A": { eyebrow: "YOUR COMMITMENT", title: "CHICKEN" },
  "Farm B": { eyebrow: "YOUR COMMITMENT", title: "CHICKEN" },
};

export function VisualTest() {
  const [farms, setFarms] = useState<Farm[]>([
    { id: "a", name: "Farm A", confirmed: false, quality: false, expanded: false },
    { id: "b", name: "Farm B", confirmed: false, quality: false, expanded: false },
  ]);
  const [supplyVisible, setSupplyVisible] = useState(false);
  const [deliveryVisible, setDeliveryVisible] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [role, setRole] = useState<Role>("Restaurant");
  const [input, setInput] = useState("");
  const [lastAction, setLastAction] = useState("Start with the need, then talk to C-Link.");

  const confirmed = farms.filter((farm) => farm.confirmed).length;
  const allDone = deliveryConfirmed && confirmed === 2;
  const visibleFarms = supplyVisible;
  const copy = roleCopy[role];
  const roleSummary = useMemo(() => {
    if (role === "Farm A" || role === "Farm B") {
      const farm = farms.find((item) => item.name === role)!;
      return { label: "YOUR COMMITMENT", value: "500 KG", status: farm.confirmed ? "CONFIRMED" : "WAITING" };
    }
    return { label: role === "Supplier" ? "YOUR SUPPLY" : "SUPPLY", value: `${confirmed * 500} / 1000 KG`, status: confirmed === 2 ? "CONFIRMED" : "IN PROGRESS" };
  }, [confirmed, farms, role]);

  function mutate(message: string, action: () => void) { action(); setLastAction(message); }
  function toggleFarm(id: Farm["id"]) { setFarms((current) => current.map((farm) => farm.id === id ? { ...farm, expanded: !farm.expanded } : farm)); }
  function confirmFarm(id: Farm["id"]) {
    const farm = farms.find((item) => item.id === id)!;
    mutate(`${farm.name} confirmed 500 KG.`, () => {
      setFarms((current) => current.map((item) => item.id === id ? { ...item, confirmed: true, expanded: false } : item));
      setDeliveryVisible(true);
    });
  }
  function runCommand(command: string) {
    const normalized = command.toLowerCase();
    if (normalized.includes("দুই") || normalized.includes("two") || normalized.includes("500")) {
      mutate("Supply split created: 500 KG from each farm.", () => setSupplyVisible(true));
    } else if (normalized.includes("quality") && (normalized.includes("pending") || normalized.includes("হয়নি") || normalized.includes("নেই"))) {
      mutate("Farm A marked: quality pending.", () => setFarms((current) => current.map((farm) => farm.id === "a" ? { ...farm, quality: false, expanded: true } : farm)));
      setSupplyVisible(true);
    } else if (normalized.includes("quality") || normalized.includes("confirmed")) {
      mutate("Quality confirmed for Farm A.", () => setFarms((current) => current.map((farm) => farm.id === "a" ? { ...farm, quality: true } : farm)));
      setSupplyVisible(true);
    } else if (normalized.includes("delivery") || normalized.includes("কাল") || normalized.includes("tomorrow")) {
      mutate("Delivery added: tomorrow · 9 AM.", () => setDeliveryVisible(true));
    } else {
      setLastAction("Try: “দুইটা farm থেকে 500kg করে নেব”, “Quality confirmed”, or “Delivery কাল সকাল ৯টায়।”");
    }
    setInput("");
  }
  function submit(event: FormEvent) { event.preventDefault(); if (input.trim()) runCommand(input.trim()); }
  function reset() { setFarms([{ id: "a", name: "Farm A", confirmed: false, quality: false, expanded: false }, { id: "b", name: "Farm B", confirmed: false, quality: false, expanded: false }]); setSupplyVisible(false); setDeliveryVisible(false); setDeliveryConfirmed(false); setRole("Restaurant"); setLastAction("Start with the need, then talk to C-Link."); setInput(""); }

  return <main className="visual-test">
    <header className="visual-test-header"><div className="visual-brand"><span className="visual-mark">C</span><span>C-LINK</span><small>Living Stage · visual test</small></div><button className="reset-button" onClick={reset} aria-label="Reset prototype"><RotateCcw size={15} /> Reset</button></header>
    <section className="living-stage" aria-label="Living Stage">
      <div className="stage-kicker"><span>ONE SHARED WORK</span><span className="live-dot">● LIVE MOCK</span></div>
      <div className={`stage-content ${allDone ? "stage-complete" : ""}`}>
        <div className="need-card stage-card"><span className="card-eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><strong>1000 <em>KG</em></strong><span className="state-label">{allDone ? "COMMITTED" : "NEED"}</span>{allDone && <span className="card-id">C-Link #2048</span>}</div>
        <div className="connector down" />
        {role === "Restaurant" || role === "Supplier" ? <div className={`supply-card stage-card ${supplyVisible ? "revealed" : "hidden"}`}><span className="card-eyebrow">{role === "Supplier" ? "YOUR SUPPLY" : "SUPPLY"}</span><h2>{supplyVisible ? "RAHIM FOODS" : "WAITING"}</h2><strong>{supplyVisible ? "1000" : "—"} <em>KG</em></strong><span className="state-label">{supplyVisible ? `${confirmed * 500} / 1000 · ${roleSummary.status}` : "Tell C-Link what can move"}</span></div> : <div className="commitment-card stage-card"><span className="card-eyebrow">{roleSummary.label}</span><h2>{role}</h2><strong>{roleSummary.value}</strong><span className="state-label">{roleSummary.status}</span></div>}
        {!supplyVisible && role === "Restaurant" && <p className="stage-hint"><Sparkles size={14} /> Your Work will take shape here.</p>}
        {visibleFarms && (role === "Restaurant" || role === "Supplier") && <><div className="connector branch" /><div className="farm-grid">{farms.map((farm) => <article key={farm.id} className={`farm-card ${farm.expanded ? "expanded" : ""} ${farm.confirmed ? "confirmed" : ""}`}><button className="farm-summary" onClick={() => toggleFarm(farm.id)} aria-expanded={farm.expanded}><span><b>{farm.name}</b><small>500 KG · {farm.confirmed ? "CONFIRMED" : "WAITING"}</small></span>{farm.confirmed ? <Check size={18} /> : farm.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{farm.expanded && <div className="farm-detail"><p>500 KG available<br /><span>{farm.quality ? "Quality confirmed" : "Waiting for confirmation"}</span></p>{!farm.quality && <button className="outline-action" onClick={() => mutate("Farm A quality marked pending.", () => setFarms((current) => current.map((item) => item.id === farm.id ? { ...item, quality: false } : item)))}>Mark quality pending</button>}<button className="confirm-action" onClick={() => confirmFarm(farm.id)}><Check size={15} /> Confirm 500 KG</button><button className="message-action"><MessageCircle size={15} /> Message</button></div>}</article>)}</div></>}
        {deliveryVisible && <><div className="connector down short" /><button className={`delivery-card ${deliveryConfirmed ? "confirmed" : ""}`} onClick={() => mutate("Delivery confirmed for tomorrow · 9 AM.", () => setDeliveryConfirmed(true))}><span className="card-eyebrow">DELIVERY</span><strong>Tomorrow · 9 AM</strong><span>{deliveryConfirmed ? "CONFIRMED" : "Tap to confirm"}{deliveryConfirmed && <Check size={15} />}</span></button></>}
      </div>
      {allDone && <div className="completion-note"><Check size={16} /> Work is complete. The shape is now a quiet record.</div>}
    </section>
    <section className="action-console"><div className="console-label"><span>CONVERSATION / ACTION CONSOLE</span><small>{lastAction}</small></div><form onSubmit={submit} className="tell-form"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tell C-Link..." aria-label="Tell C-Link" /><button type="submit">Send</button></form><div className="suggestions"><button onClick={() => runCommand("দুইটা farm থেকে 500kg করে নেব")}>Split supply</button><button onClick={() => runCommand("Quality confirmed")}>Quality confirmed</button><button onClick={() => runCommand("Delivery কাল সকাল ৯টায়")}>Add delivery</button></div></section>
    <aside className="developer-switch"><span>VIEW AS</span>{(["Restaurant", "Supplier", "Farm A", "Farm B"] as Role[]).map((item) => <button key={item} className={role === item ? "selected" : ""} onClick={() => setRole(item)}>{item}</button>)}</aside>
  </main>;
}
