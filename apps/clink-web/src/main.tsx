import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowUpRight, Bell, Building2, CalendarDays, Check,
  ChevronDown, CircleAlert, Clock3, FileCheck2, Link2, Menu, Plus,
  Search, Settings, ShieldCheck, Target, Users, Network, X,
} from "lucide-react";
import "./styles.css";
import "./connection.css";
import { acceptCommitment, acceptSharedCommitment, addEvidence, addRequiredCapability, assignCapability, closeCommitment, confirmCommitment, convertExpectationToCommitment, createCapabilityNode, createCommitment as createCommitmentApi, createExpectation as createExpectationApi, fulfillCommitment, getOperationalSummary, getSharedCommitment, getSharedExpectation, listCapabilities, listCommitments, listExpectations, openDispute, recordSettlement, rejectSharedCommitment, requestCommitmentChange, requestSharedCommitmentChange, respondToExpectation, revokeShare, sendCommitment, sendExpectation, startCommitment, uploadEvidence, type CapabilityHealth, type CapabilityNode, type ClinkApiExpectation, type OperationalSignal } from "./api/clink";
import { AuthGate } from "./auth/AuthGate";
import { supabase } from "./lib/supabase";
import { VisualTest } from "./VisualTest";

type Status = "accepted" | "pending" | "in_progress" | "fulfilled" | "partially_accepted" | "disputed" | "settled" | "completed";
type Commitment = { id: string; counterparty: string; type: string; summary: string; amount: string; due: string; status: Status; updated: string; initials: string };
type Expectation = ClinkApiExpectation;

const statusMeta: Record<Status, { label: string; tone: string }> = {
  accepted: { label: "Accepted", tone: "success" }, pending: { label: "Awaiting response", tone: "warning" }, disputed: { label: "Disputed", tone: "danger" }, completed: { label: "Completed", tone: "info" },
  in_progress: { label: "In progress", tone: "info" }, fulfilled: { label: "Fulfilled", tone: "info" }, partially_accepted: { label: "Partially accepted", tone: "warning" }, settled: { label: "Settled", tone: "success" },
};

function App() {
  const [workspaceName, setWorkspaceName] = useState("Your business");
  const [workspaceInitials, setWorkspaceInitials] = useState("YB");
  const [workspaceType, setWorkspaceType] = useState("Private workspace");
  const [workspaceLocation, setWorkspaceLocation] = useState("Not specified");
  const [nav, setNav] = useState("Overview");
  const [items, setItems] = useState<Commitment[]>([]);
  const [expectations, setExpectations] = useState<Expectation[]>([]);
  const [signals, setSignals] = useState<OperationalSignal[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityNode[]>([]);
  const [capabilityHealth, setCapabilityHealth] = useState<CapabilityHealth[]>([]);
  const [expectationOpen, setExpectationOpen] = useState(false);
  const [selectedExpectation, setSelectedExpectation] = useState<Expectation | null>(null);
  const [selected, setSelected] = useState<Commitment | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [apiState, setApiState] = useState<"connecting" | "connected" | "offline">("connecting");
  const [notice, setNotice] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [capabilityOpen, setCapabilityOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const counts = useMemo(() => ({ active: items.filter((x) => x.status !== "completed").length, attention: items.filter((x) => x.status === "pending" || x.status === "disputed").length, openNeeds: expectations.filter((x) => ["draft", "sent"].includes(x.status)).length, waitingResponses: expectations.filter((x) => x.status === "sent").length }), [items, expectations]);

  useEffect(() => {
    const loadIdentity = async () => {
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      const metadata = session?.user.user_metadata as Record<string, unknown> | undefined;
      const name = String(metadata?.business_name || metadata?.company_name || metadata?.full_name || session?.user.email?.split("@")[0] || "Your business").trim();
      setWorkspaceName(name);
      setWorkspaceInitials(name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "YB");
      setWorkspaceType(String(metadata?.business_type || "Private workspace"));
      setWorkspaceLocation(String(metadata?.business_location || "Not specified"));
    };
    Promise.all([loadIdentity(), listCommitments(), listExpectations(), getOperationalSummary(), listCapabilities()]).then(([, remote, needs, operational, registry]) => {
      if (remote.length) setItems(remote.map(toUiCommitment));
      setExpectations(needs);
      setSignals(operational.signals);
      setCapabilities(registry.nodes); setCapabilityHealth(registry.health);
      setApiState("connected");
    }).catch(() => setApiState("offline"));
  }, []);

  async function createExpectation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const created = await createExpectationApi({ ownerPartyId: workspaceName, counterpartyPartyId: String(data.get("counterparty") || "New business"), item: String(data.get("item") || "Product or service"), quantity: Number(data.get("quantity") || 1), unit: String(data.get("unit") || "unit"), neededBy: String(data.get("neededBy")), location: String(data.get("location") || "") || undefined, acceptanceCriteria: String(data.get("criteria") || "Confirm the agreed outcome"), budget: Number(data.get("budget") || 0) || undefined, currency: "BDT", flexibility: String(data.get("flexibility") || "") || undefined, priority: String(data.get("priority") || "standard") as "standard" | "important" | "urgent" });
      const shared = await sendExpectation(created.id);
      setExpectations((current) => [created, ...current.map((item) => item.id === created.id ? { ...item, status: "sent" as const } : item)]);
      setExpectationOpen(false); setSelectedExpectation({ ...created, status: "sent" }); setShareUrl(`${window.location.origin}/expectation/${shared.token}`); setApiState("connected"); setNotice("Need created and shared with the counterparty");
    } catch { setApiState("offline"); setNotice("The need could not be saved. Check your connection and try again."); }
  }

  async function createRegistryCapability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    try { const node = await createCapabilityNode({ name: String(data.get("name") || ""), description: String(data.get("description") || "") || undefined, actorType: String(data.get("actorType") || "business_unit") }); setCapabilities((current) => [...current, node].sort((a, b) => a.name.localeCompare(b.name))); setRegistryOpen(false); setNotice("Capability added to your private registry"); }
    catch { setNotice("Capability could not be added"); }
  }

  async function saveBusinessProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("businessName") || "Your business").trim();
    const type = String(data.get("businessType") || "Private workspace").trim();
    const location = String(data.get("businessLocation") || "Not specified").trim();
    if (!supabase) { setNotice("Secure identity is not configured"); return; }
    const result = await supabase.auth.updateUser({ data: { business_name: name, business_type: type, business_location: location } });
    if (result.error) { setNotice(result.error.message); return; }
    setWorkspaceName(name); setWorkspaceType(type); setWorkspaceLocation(location); setWorkspaceInitials(name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "YB"); setNotice("Business profile saved");
  }

  async function addSelectedCapability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    try {
      const created = await addRequiredCapability(selected.id, { type: String(data.get("type") || "execution"), description: String(data.get("description") || "Complete the required work"), quantity: Number(data.get("quantity") || 0) || undefined, unit: String(data.get("unit") || "") || undefined, actorType: String(data.get("actorType") || "human"), registryCapabilityId: String(data.get("registryCapabilityId") || "") || undefined });
      const actorId = String(data.get("actorId") || "").trim();
      if (actorId) await assignCapability(selected.id, { requirementId: created.id, actorId, actorType: String(data.get("actorType") || "human") });
      setCapabilityOpen(false); setNotice("Required capability added to the commitment"); setApiState("connected");
      const summary = await getOperationalSummary(); setSignals(summary.signals);
    } catch { setNotice("The required capability could not be added"); }
  }

  async function convertSelectedExpectation() {
    if (!selectedExpectation) return;
    try {
      const created = await convertExpectationToCommitment(selectedExpectation.id);
      const shared = await sendCommitment(created.id);
      setExpectations((current) => current.map((item) => item.id === selectedExpectation.id ? { ...item, status: "converted" } : item));
      const uiItem = toUiCommitment(created); setItems((current) => [uiItem, ...current]); setSelectedExpectation(null); setShareUrl(`${window.location.origin}/share/${shared.token}`); setApiState("connected"); setNotice("Capability aligned — commitment ready for final acceptance");
    } catch { setNotice("This need needs a capability response before it can become a commitment"); }
  }

  async function createCommitment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const counterparty = String(data.get("counterparty") || "New business");
    const item = String(data.get("item") || "New commitment");
    const amount = Number(data.get("amount") || 0);
    const deadline = String(data.get("date") || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    try {
    const created = await createCommitmentApi({ creatorPartyId: workspaceName, counterpartyPartyId: counterparty, item, quantity: 1, unit: "commitment", price: amount, currency: "BDT", deadline, acceptanceCriteria: String(data.get("criteria") || "Confirm the agreed commitment") });
      const shared = await sendCommitment(created.id);
      const uiItem = toUiCommitment(created);
      setItems((current) => [uiItem, ...current]); setExpectationOpen(false); setSelected(uiItem); setApiState("connected"); setShareUrl(`${window.location.origin}/share/${shared.token}`); setNotice("C-Link created and shared");
      return;
    } catch {
      setApiState("offline"); setNotice("The commitment could not be saved. Check your connection and try again.");
    }
  }

  function saveDraft(data: FormData) {
    const draft = { counterparty: String(data.get("counterparty") || ""), item: String(data.get("item") || ""), amount: String(data.get("amount") || ""), date: String(data.get("date") || ""), criteria: String(data.get("criteria") || ""), savedAt: new Date().toISOString() };
    localStorage.setItem("clink:draft", JSON.stringify(draft));
    setExpectationOpen(false);
    setNotice("Draft saved on this device");
  }

  async function addSelectedEvidence(description: string, file?: File) {
    if (!selected) return;
    try { if (file) await uploadEvidence(selected.id, file, description); else await addEvidence(selected.id, { description }); setApiState("connected"); setNotice("Evidence added to the C-Link"); }
    catch { setNotice("Evidence could not be added while offline"); }
    setEvidenceOpen(false);
  }

  async function revokeSelectedShare() {
    if (!selected) return;
    try { await revokeShare(selected.id); setShareUrl(null); setApiState("connected"); setNotice("Share link revoked"); }
    catch { setNotice("Share link could not be revoked"); }
  }

  async function reportSelectedIssue(issueType: string, description: string) {
    if (!selected) return;
    try { await openDispute(selected.id, issueType, { description }); setApiState("connected"); setNotice("Issue reported to the shared record"); }
    catch { setNotice("This commitment cannot accept an issue at its current stage"); }
    setIssueOpen(false);
  }

  async function acceptSelected() {
    if (!selected) return;
    try { await acceptCommitment(selected.id); setApiState("connected"); setNotice("Acceptance recorded"); }
    catch { setApiState("offline"); setNotice("Acceptance could not be recorded. Check your connection and try again."); return; }
    setItems((current) => current.map((x) => x.id === selected.id ? { ...x, status: "accepted", updated: "Accepted just now" } : x)); setSelected(null);
  }

  async function updateSelectedLifecycle(action: "start" | "fulfill" | "confirm" | "partial" | "settle" | "close", payload?: Record<string, unknown>) {
    if (!selected) return;
    try {
      const updated = action === "start" ? await startCommitment(selected.id, String(payload?.note || ""))
        : action === "fulfill" ? await fulfillCommitment(selected.id, String(payload?.note || ""))
        : action === "confirm" ? await confirmCommitment(selected.id, { accepted: true, receivedQuantity: Number(payload?.receivedQuantity || 0) || undefined, note: String(payload?.note || "") })
        : action === "partial" ? await confirmCommitment(selected.id, { accepted: true, partial: true, receivedQuantity: Number(payload?.receivedQuantity || 0) || undefined, note: String(payload?.note || "") })
        : action === "close" ? await closeCommitment(selected.id, String(payload?.reason || "completed"))
        : null;
      if (action === "settle") { await recordSettlement(selected.id, { amountDue: Number(payload?.amountDue || 0), amountPaid: Number(payload?.amountPaid || 0), currency: "BDT", paymentDate: String(payload?.paymentDate || new Date().toISOString().slice(0, 10)), paymentReference: String(payload?.paymentReference || "") || undefined, status: String(payload?.status || "paid") as "pending" | "partial" | "paid" | "refunded", note: String(payload?.note || "") }); }
      if (updated) { const next = toUiCommitment(updated); setItems((current) => current.map((item) => item.id === selected.id ? next : item)); setSelected(next); }
      setApiState("connected"); setNotice(action === "settle" ? "Settlement recorded" : "C-Link record updated");
    } catch { setNotice("This lifecycle action is not available at the current stage"); }
  }

  async function shareSelected() {
    if (!selected) return;
    try {
      const shared = await sendCommitment(selected.id);
      setShareUrl(`${window.location.origin}/share/${shared.token}`);
      setApiState("connected");
      setNotice("Share link ready");
    } catch {
      setApiState("offline"); setNotice("The share link could not be created. Check your connection and try again.");
    }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand-lockup"><div className="brand-mark">C</div><div><div className="brand-name">C-Link</div><div className="brand-caption">Business record</div></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-avatar">{workspaceInitials}</div><div className="workspace-copy"><strong>{workspaceName}</strong><span>Business workspace</span></div><ChevronDown size={16} className="muted-icon" /></div>
      <nav className="primary-nav" aria-label="Primary navigation">{[["Overview", Activity], ["Expectations", Target], ["Commitments", Link2], ["Capabilities", Network], ["Relationships", Users], ["Activity", Clock3]].map(([name, Icon]) => <button key={String(name)} className={`nav-item ${nav === name ? "active" : ""}`} onClick={() => { setNav(String(name)); setMobileNav(false); }}><Icon size={18} strokeWidth={1.8} /><span>{String(name)}</span>{name === "Commitments" && <span className="nav-count">{counts.active}</span>}{name === "Expectations" && <span className="nav-count">{counts.openNeeds}</span>}{name === "Capabilities" && <span className="nav-count">{capabilities.length}</span>}</button>)}</nav>
      <div className="sidebar-spacer" /><div className="sidebar-foot"><button className="nav-item" onClick={() => setNav("Business Profile")}><Building2 size={18} /><span>Business profile</span></button><button className="nav-item" onClick={() => setNav("Settings")}><Settings size={18} /><span>Settings</span></button><div className="security-note"><ShieldCheck size={16} /><span>Your records are private by default.</span></div></div>
    </aside>
    {mobileNav && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><span className="breadcrumb">{nav}</span><span className={`connection-status ${apiState}`}><i />{apiState === "connected" ? "Connected" : apiState === "offline" ? "Preview mode" : "Connecting"}</span></div><div className="topbar-actions"><button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={18} /></button><button className="icon-button notification" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><span /></button><div className="user-avatar">{workspaceInitials}</div></div></header>
      <div className="content-wrap">
        <section className="page-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase()}</p><h1>{nav === "Overview" ? `Good morning, ${workspaceName}` : nav}</h1><p className="page-subtitle">Turn a business need into a shared commitment, then close the loop with outcomes.</p></div><button className="primary-button" onClick={() => setExpectationOpen(true)}><Plus size={17} />New C-Link</button></section>
        {nav === "Overview" ? <><section className="summary-grid"><SummaryCard label="Open needs" value={String(counts.openNeeds)} detail={`${counts.waitingResponses} waiting for a capability response`} icon={<Target size={19} />} /><SummaryCard label="Active commitments" value={String(counts.active)} detail={`Across ${new Set(items.map((item) => item.counterparty)).size} counterparties`} icon={<Link2 size={19} />} /><SummaryCard label="Needs attention" value={String(Math.max(counts.attention, signals.length))} detail={`${signals.length} operational signal${signals.length === 1 ? "" : "s"} to review`} icon={<CircleAlert size={19} />} tone="warning" /><SummaryCard label="Capability nodes" value={String(capabilities.length)} detail={`${capabilityHealth.filter((item) => item.status === "unavailable" || item.blockedCount > 0).length} need review`} icon={<Network size={19} />} tone="success" /></section><section className="workspace-grid"><div className="panel"><PanelHeading title="Operational signals" subtitle="The most significant changes and unresolved gaps in your private workspace." /><div className="activity-list">{signals.length ? signals.slice(0, 5).map((signal) => <SignalItem key={signal.id} signal={signal} />) : <div className="empty-workspace compact"><div className="empty-icon"><ShieldCheck size={18} /></div><h2>No significant gaps</h2><p>C-Link will surface blocked, uncertain or action-worthy work here.</p></div>}</div></div><div className="panel"><PanelHeading title="Capability health" subtitle="Factual availability and assignment context, not a universal score." action="View registry" onAction={() => setNav("Capabilities")} /><div className="activity-list">{capabilityHealth.slice(0, 5).map((health) => <CapabilityHealthRow key={health.capabilityId} health={health} />)}</div></div></section><section className="workspace-grid"><div className="panel"><PanelHeading title="Open needs" subtitle="Expectations waiting to become shared commitments." action="View all" onAction={() => setNav("Expectations")} /><div className="commitment-list">{expectations.filter((item) => item.status !== "converted").slice(0, 5).map((item) => <ExpectationRow key={item.id} item={item} onClick={() => setSelectedExpectation(item)} />)}</div></div><div className="panel"><PanelHeading title="Recent activity" subtitle="A factual record of recent changes." /><div className="activity-list">{items.slice(0, 4).map((item) => <ActivityItem key={item.id} icon={item.status === "disputed" ? <CircleAlert /> : item.status === "completed" ? <FileCheck2 /> : item.status === "accepted" ? <Check /> : <Link2 />} title={`${statusMeta[item.status].label} commitment`} detail={`${item.counterparty} · ${item.id}`} time={item.updated} tone={item.status === "disputed" ? "danger" : item.status === "accepted" ? "success" : item.status === "completed" ? "info" : "neutral"} />)}</div></div></section><section className="principle-card"><div className="principle-icon"><ShieldCheck size={21} /></div><div><strong>Reduce business entropy.</strong><p>C-Link makes claims, capabilities, assignments, evidence and outcomes visible without declaring automatic truth.</p></div><button className="quiet-button" onClick={() => setInfoOpen(true)}>Learn how it works <ArrowUpRight size={15} /></button></section></> : nav === "Commitments" ? <CommitmentsPage items={items} onSelect={setSelected} /> : nav === "Expectations" ? <ExpectationsPage items={expectations} onSelect={setSelectedExpectation} /> : nav === "Capabilities" ? <CapabilitiesPage nodes={capabilities} health={capabilityHealth} onAdd={() => setRegistryOpen(true)} /> : nav === "Relationships" ? <RelationshipsPage items={items} /> : nav === "Activity" ? <ActivityPage items={items} /> : nav === "Business Profile" ? <BusinessProfilePage workspaceName={workspaceName} workspaceType={workspaceType} workspaceLocation={workspaceLocation} onSave={saveBusinessProfile} /> : <SettingsPage />}
      </div>
    </main>
    {expectationOpen && <ExpectationModal onClose={() => setExpectationOpen(false)} onSubmit={createExpectation} />}
    {shareUrl && <SharePanel url={shareUrl} onClose={() => setShareUrl(null)} onNotice={setNotice} onRevoke={revokeSelectedShare} />}
    {notice && <button className="toast" onClick={() => setNotice(null)}>{notice}<X size={14} /></button>}
    {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} onAccept={acceptSelected} onShare={shareSelected} onEvidence={() => setEvidenceOpen(true)} onIssue={() => setIssueOpen(true)} onCapability={() => setCapabilityOpen(true)} onLifecycle={updateSelectedLifecycle} />}
    {searchOpen && <SearchPanel items={items} onClose={() => setSearchOpen(false)} onSelect={(item) => { setSearchOpen(false); setSelected(item); }} />}
    {notificationsOpen && <NotificationPanel onClose={() => setNotificationsOpen(false)} />}
    {infoOpen && <InfoPanel onClose={() => setInfoOpen(false)} />}
    {evidenceOpen && selected && <EvidenceModal onClose={() => setEvidenceOpen(false)} onSubmit={addSelectedEvidence} />}
    {issueOpen && selected && <IssueModal onClose={() => setIssueOpen(false)} onSubmit={reportSelectedIssue} />}
    {capabilityOpen && selected && <CapabilityModal nodes={capabilities} onClose={() => setCapabilityOpen(false)} onSubmit={addSelectedCapability} />}
    {registryOpen && <CapabilityRegistryModal onClose={() => setRegistryOpen(false)} onSubmit={createRegistryCapability} />}
    {selectedExpectation && <ExpectationDrawer item={selectedExpectation} onClose={() => setSelectedExpectation(null)} onConvert={convertSelectedExpectation} />}
  </div>;
}

function toUiCommitment(item: { id: string; status: string; counterpartyPartyId: string; versions: Array<{ item: string; quantity: number; unit: string; price: number; currency: string; deadline: string }>; events: Array<{ occurredAt: string }> }): Commitment {
  const version = item.versions[item.versions.length - 1];
  const status: Status = ["accepted", "in_progress", "fulfilled", "partially_accepted", "disputed", "settled", "closed"].includes(item.status) ? (item.status === "closed" ? "completed" : item.status as Status) : "pending";
  return { id: item.id, counterparty: item.counterpartyPartyId, type: "Business", summary: `${version?.quantity || 1} ${version?.unit || "item"} ${version?.item || "commitment"}`, amount: `৳${Number(version?.price || 0).toLocaleString("en-BD")}`, due: status === "completed" ? "Closed" : `Due ${version?.deadline || "soon"}`, status, updated: item.events?.at(-1)?.occurredAt ? "Updated recently" : "Created recently", initials: item.counterpartyPartyId.slice(0, 2).toUpperCase() };
}

function PanelHeading({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) { return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button className="text-button" onClick={onAction}>{action} <ArrowUpRight size={15} /></button>}</div>; }
function SummaryCard({ label, value, detail, icon, tone = "neutral" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: string }) { return <div className="summary-card"><div className={`summary-icon ${tone}`}>{icon}</div><div className="summary-content"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>; }
function CommitmentRow({ item, onClick }: { item: Commitment; onClick: () => void }) { const meta = statusMeta[item.status]; return <button className="commitment-row" onClick={onClick}><div className="party-avatar">{item.initials}</div><div className="commitment-main"><div className="commitment-title"><strong>{item.counterparty}</strong><span>{item.type}</span></div><p>{item.summary}</p><small>{item.id} · {item.updated}</small></div><div className="commitment-side"><span className={`status-pill ${meta.tone}`}><i />{meta.label}</span><strong>{item.amount}</strong><span>{item.due}</span></div><ArrowUpRight size={16} className="row-arrow" /></button>; }
function ActivityItem({ icon, title, detail, time, tone }: { icon: ReactNode; title: string; detail: string; time: string; tone: string }) { return <div className="activity-item"><div className={`activity-icon ${tone}`}>{icon}</div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>; }
function SignalItem({ signal }: { signal: OperationalSignal }) { const tone = signal.level === "blocking" || signal.level === "high_impact" || signal.level === "irreversible_risk" ? "danger" : signal.level === "action_worthy" ? "warning" : "neutral"; return <div className="activity-item signal-item"><div className={`activity-icon ${tone}`}><CircleAlert size={17} /></div><div className="activity-copy"><strong>{signal.title}</strong><span>{signal.detail} · {signal.reasons[0]}</span></div><span className={`status-pill ${tone}`}><i />{signal.level.replaceAll("_", " ")}</span></div>; }
function CapabilityHealthRow({ health }: { health: CapabilityHealth }) { const tone = health.status === "unavailable" || health.blockedCount > 0 ? "danger" : health.status === "limited" ? "warning" : "success"; return <div className="activity-item capability-health-row"><div className={`activity-icon ${tone}`}><Network size={16} /></div><div className="activity-copy"><strong>{health.name}</strong><span>{health.requiredCount} required · {health.assignedCount} assigned · {health.blockedCount} blocked</span></div><span className={`status-pill ${tone}`}><i />{health.status}</span></div>; }
function CapabilitiesPage({ nodes, health, onAdd }: { nodes: CapabilityNode[]; health: CapabilityHealth[]; onAdd: () => void }) { return <section className="panel page-panel"><PanelHeading title="Capability registry" subtitle="Your private inventory of what people, teams, machines and services can do." action="Add capability" onAction={onAdd} /><div className="capability-grid">{nodes.length ? nodes.map((node) => { const item = health.find((entry) => entry.capabilityId === node.id); return <div className="capability-card" key={node.id}><div className="capability-card-head"><div className="party-avatar"><Network size={15} /></div><span className={`status-pill ${node.status === "unavailable" ? "danger" : node.status === "limited" ? "warning" : "success"}`}><i />{node.status}</span></div><h3>{node.name}</h3><p>{node.description || "No description yet."}</p><div className="capability-meta"><span>{node.actorType.replaceAll("_", " ")}</span><span>{item?.requiredCount || 0} linked requirements</span></div></div>; }) : <div className="empty-workspace"><div className="empty-icon"><Network size={20} /></div><h2>No capabilities registered</h2><p>Add what your business, people, machines or services are capable of doing. C-Link will keep this private.</p><button className="primary-button" onClick={onAdd}><Plus size={16} />Add first capability</button></div>}</div></section>; }
function CapabilityRegistryModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="registry-title"><div className="modal-head"><div><p className="eyebrow">PRIVATE CAPABILITY REGISTRY</p><h2 id="registry-title">Add a capability</h2><p>Describe what this business, person, machine or service can do.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={onSubmit}><label>Capability name<input name="name" placeholder="e.g. Cold delivery" required /></label><label>Description<textarea name="description" rows={3} placeholder="What can this capability accomplish?" /></label><label>Capability owner type<select name="actorType" defaultValue="business_unit"><option value="business_unit">Business unit</option><option value="human">Human</option><option value="team">Team</option><option value="machine">Machine</option><option value="robot">Robot</option><option value="service">Software service</option><option value="contractor">External contractor</option><option value="supplier">Supplier</option></select></label><div className="modal-note"><ShieldCheck size={16} /><span>Capabilities are private and factual. C-Link does not publish a universal capability score.</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Add capability <Check size={16} /></button></div></form></section></div>; }

function expectationMeta(item: Expectation) {
  if (item.status === "responded") return { label: item.response?.type === "cannot_fulfill" ? "Not available" : "Response received", tone: item.response?.type === "cannot_fulfill" ? "danger" : "success" };
  if (item.status === "converted") return { label: "Converted", tone: "info" };
  if (item.status === "sent") return { label: "Awaiting response", tone: "warning" };
  if (item.status === "withdrawn") return { label: "Withdrawn", tone: "neutral" };
  return { label: "Draft", tone: "neutral" };
}

function ExpectationRow({ item, onClick }: { item: Expectation; onClick: () => void }) {
  const meta = expectationMeta(item);
  return <button className="commitment-row expectation-row" onClick={onClick}><div className="party-avatar"><Target size={15} /></div><div className="commitment-main"><div className="commitment-title"><strong>{item.counterpartyPartyId}</strong><span>Need</span></div><p>{item.quantity} {item.unit} · {item.item}</p><small>{item.id} · {item.updatedAt ? "Updated recently" : "Created recently"}</small></div><div className="commitment-side"><span className={`status-pill ${meta.tone}`}><i />{meta.label}</span><strong>{item.neededBy}</strong><span>{item.priority || "standard"}</span></div><ArrowUpRight size={16} className="row-arrow" /></button>;
}

function ExpectationsPage({ items, onSelect }: { items: Expectation[]; onSelect: (item: Expectation) => void }) { return <section className="panel page-panel"><PanelHeading title="Needs and expectations" subtitle="Private requests waiting for a counterparty capability response." /><div className="commitment-list">{items.length ? items.map((item) => <ExpectationRow key={item.id} item={item} onClick={() => onSelect(item)} />) : <div className="empty-workspace"><div className="empty-icon"><Target size={20} /></div><h2>No open needs yet</h2><p>Create a C-Link by describing what you need to happen, then share it with a known counterparty.</p></div>}</div></section>; }

function ExpectationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal expectation-modal" role="dialog" aria-modal="true" aria-labelledby="expectation-title"><div className="modal-head"><div><p className="eyebrow">NEW EXPECTATION</p><h2 id="expectation-title">What do you need to happen?</h2><p>Start with a need. The counterparty can respond with what they can actually provide.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={onSubmit}><label>Counterparty<input name="counterparty" placeholder="Business or person name" required /></label><label>Product or service<input name="item" placeholder="e.g. 200 kg refined flour" required /></label><div className="form-row"><label>Quantity<input name="quantity" type="number" min="0.01" step="any" defaultValue="1" required /></label><label>Unit<input name="unit" placeholder="kg, hours, units" defaultValue="unit" required /></label></div><div className="form-row"><label>Needed by<input name="neededBy" type="date" defaultValue={defaultDate} required /></label><label>Budget (optional)<input name="budget" inputMode="decimal" placeholder="No budget set" /></label></div><label>Location (optional)<input name="location" placeholder="Delivery or service location" /></label><label>Acceptance criteria<textarea name="criteria" placeholder="What should the counterparty meet or provide?" rows={3} required /></label><div className="form-row"><label>Flexibility (optional)<input name="flexibility" placeholder="e.g. ±10 kg is acceptable" /></label><label>Priority<select name="priority" defaultValue="standard"><option value="standard">Standard</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label></div><div className="modal-note"><ShieldCheck size={16} /><span>This is a request, not a commitment. Nothing is locked until both sides align on terms.</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Create and share <ArrowUpRight size={16} /></button></div></form></section></div>;
}

function ExpectationDrawer({ item, onClose, onConvert }: { item: Expectation; onClose: () => void; onConvert: () => void }) {
  const meta = expectationMeta(item);
  const response = item.response;
  return <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="detail-drawer"><div className="drawer-head"><div><span className={`status-pill ${meta.tone}`}><i />{meta.label}</span><p className="drawer-id">{item.id}</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="drawer-title"><div className="party-avatar large"><Target size={20} /></div><div><h2>{item.counterpartyPartyId}</h2><p>Expectation exchange</p></div></div><div className="detail-block"><span className="detail-label">YOUR NEED</span><strong>{item.quantity} {item.unit} · {item.item}</strong><div className="detail-row"><span>Needed by</span><b>{item.neededBy}</b></div><div className="detail-row"><span>Location</span><b>{item.location || "Not specified"}</b></div><div className="detail-row"><span>Criteria</span><b>{item.acceptanceCriteria}</b></div></div>{response && <div className="detail-block response-block"><span className="detail-label">COUNTERPARTY RESPONSE</span><strong>{response.type === "can_fulfill" ? "Can fulfill" : response.type === "can_with_changes" ? "Can fulfill with changes" : "Cannot fulfill"}</strong>{response.proposedTerms && <div className="detail-row"><span>Proposed terms</span><b>{response.proposedTerms.quantity ?? item.quantity} {response.proposedTerms.unit ?? item.unit} · {response.proposedTerms.neededBy ?? item.neededBy}</b></div>}{response.conditions && <div className="detail-row"><span>Conditions</span><b>{response.conditions}</b></div>}{response.responseNote && <div className="detail-row"><span>Note</span><b>{response.responseNote}</b></div>}</div>}<div className="timeline">{item.events.slice(-4).map((event) => <TimelineItem key={event.id} title={event.type.replaceAll("_", " ").replaceAll(".", " · ")} detail="Recorded in the private expectation timeline" time={event.occurredAt} active />)}</div><div className="drawer-actions">{response && response.type !== "cannot_fulfill" && item.status === "responded" && <button className="primary-button full" onClick={onConvert}><Check size={17} />Align and create commitment</button>}<button className="quiet-button full" onClick={onClose}>Close</button></div></aside></div>;
}

function CreateModal({ onClose, onSaveDraft, onSubmit }: { onClose: () => void; onSaveDraft: (data: FormData) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-head"><div><p className="eyebrow">NEW COMMITMENT</p><h2 id="create-title">Create a C-Link</h2><p>Record what your business has promised to deliver.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={onSubmit}><label>Counterparty<input name="counterparty" placeholder="Business or person name" required /></label><label>What is being committed?<input name="item" placeholder="e.g. 120 kg refined flour" required /></label><div className="form-row"><label>Amount<input name="amount" inputMode="decimal" placeholder="48000" required /></label><label>Due date<input name="date" type="date" defaultValue={defaultDate} required /></label></div><label>Acceptance criteria<textarea name="criteria" placeholder="What should the receiver confirm?" rows={3} required /></label><div className="modal-note"><ShieldCheck size={16} /><span>The recipient sees the final terms before accepting. Nothing is accepted automatically.</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={(event) => onSaveDraft(new FormData(event.currentTarget.form!))}>Save draft</button><button type="submit" className="primary-button">Create and share <ArrowUpRight size={16} /></button></div></form></section></div>; }

function DetailDrawer({ item, onClose, onAccept, onShare, onEvidence, onIssue, onCapability, onLifecycle }: { item: Commitment; onClose: () => void; onAccept: () => void; onShare: () => void; onEvidence: () => void; onIssue: () => void; onCapability: () => void; onLifecycle: (action: "start" | "fulfill" | "confirm" | "partial" | "settle" | "close", payload?: Record<string, unknown>) => void }) { const meta = statusMeta[item.status]; return <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="detail-drawer"><div className="drawer-head"><div><span className={`status-pill ${meta.tone}`}><i />{meta.label}</span><p className="drawer-id">{item.id}</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="drawer-title"><div className="party-avatar large">{item.initials}</div><div><h2>{item.counterparty}</h2><p>{item.type}</p></div></div><div className="detail-block"><span className="detail-label">COMMITMENT</span><strong>{item.summary}</strong><div className="detail-row"><span>Value</span><b>{item.amount}</b></div><div className="detail-row"><span>Deadline</span><b>{item.due}</b></div></div><div className="detail-block capability-preview"><span className="detail-label">CAPABILITY ALLOCATION</span><p>Define the capability required to complete this commitment, then assign a human, team, machine or service.</p><button className="secondary-button full" onClick={onCapability}><Target size={17} />Add required capability</button></div><div className="timeline"><TimelineItem title="C-Link created" detail="Terms prepared by the workspace owner" time="Recorded" active /><TimelineItem title={item.status === "pending" ? "Awaiting response" : meta.label} detail={item.status === "pending" ? "The counterparty has not responded yet" : "The current state is recorded in the timeline"} time="Current" active={item.status !== "pending"} /><TimelineItem title="Next step" detail="Execution evidence will appear here" time="Pending" /></div><div className="drawer-actions"><button className="secondary-button full" onClick={onShare}><Link2 size={17} />Share C-Link</button>{item.status === "pending" && <button className="primary-button full" onClick={onAccept}><Check size={17} />Mark as accepted</button>}{item.status === "accepted" && <button className="primary-button full" onClick={() => onLifecycle("start")}><ArrowUpRight size={17} />Start execution</button>}{item.status === "in_progress" && <button className="primary-button full" onClick={() => onLifecycle("fulfill")}><Check size={17} />Mark fulfilled</button>}{item.status === "fulfilled" && <><button className="primary-button full" onClick={() => onLifecycle("confirm")}><Check size={17} />Confirm received</button><button className="secondary-button full" onClick={() => onLifecycle("partial")}><Target size={17} />Record partial acceptance</button></>}{["accepted", "partially_accepted", "disputed"].includes(item.status) && <button className="secondary-button full" onClick={() => onLifecycle("settle", { amountDue: Number(item.amount.replace(/[^0-9.]/g, "")) || 0, amountPaid: Number(item.amount.replace(/[^0-9.]/g, "")) || 0, status: "paid" })}><Check size={17} />Record payment</button>}{item.status === "settled" && <button className="primary-button full" onClick={() => onLifecycle("close", { reason: "completed_and_paid" })}><Check size={17} />Close record</button>}<button className="secondary-button full" onClick={onEvidence}><FileCheck2 size={17} />Add evidence</button>{["fulfilled", "partially_accepted", "disputed"].includes(item.status) && <button className="quiet-button full" onClick={onIssue}>Report an issue</button>}</div></aside></div>; }

function CapabilityModal({ nodes, onClose, onSubmit }: { nodes: CapabilityNode[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="capability-title"><div className="modal-head"><div><p className="eyebrow">REQUIRED CAPABILITY</p><h2 id="capability-title">What must be capable of happening?</h2><p>Record the work requirement separately from the person or service that may later be assigned.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={onSubmit}><label>Registry capability (optional)<select name="registryCapabilityId" defaultValue=""><option value="">Define without linking a registry node</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name} · {node.status}</option>)}</select></label><label>Capability type<input name="type" placeholder="e.g. delivery, inspection, production" defaultValue="execution" required /></label><label>Required capability<textarea name="description" placeholder="e.g. Receive 200 kg at the buyer warehouse by Friday" rows={3} required /></label><div className="form-row"><label>Quantity<input name="quantity" type="number" min="0.01" step="any" /></label><label>Unit<input name="unit" placeholder="kg, hours, units" /></label></div><div className="form-row"><label>Actor type<select name="actorType" defaultValue="human"><option value="human">Human</option><option value="team">Team</option><option value="machine">Machine</option><option value="robot">Robot</option><option value="ai_agent">AI agent</option><option value="service">Software service</option><option value="contractor">External contractor</option><option value="supplier">Supplier</option></select></label><label>Assign actor (optional)<input name="actorId" placeholder="Person, team, machine or service ID" /></label></div><div className="modal-note"><ShieldCheck size={16} /><span>No actor is assigned unless you provide one. Assignment remains a human-approved decision.</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save capability <Check size={16} /></button></div></form></section></div>; }
function TimelineItem({ title, detail, time, active = false }: { title: string; detail: string; time: string; active?: boolean }) { return <div className={`timeline-item ${active ? "active" : ""}`}><div className="timeline-dot" /><div className="timeline-copy"><strong>{title}</strong><span>{detail}</span><time>{time}</time></div></div>; }

function SharePanel({ url, onClose, onNotice, onRevoke }: { url: string; onClose: () => void; onNotice: (message: string) => void; onRevoke: () => void }) {
  async function copy() {
    try { await navigator.clipboard.writeText(url); onNotice("Share link copied"); }
    catch { onNotice("Copy is unavailable — select the link manually"); }
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title"><div className="modal-head"><div><p className="eyebrow">READY TO SHARE</p><h2 id="share-title">Send this C-Link</h2><p>The recipient can review the terms without installing an app.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="share-link-box"><Link2 size={17} /><span>{url}</span></div><div className="modal-actions"><button className="quiet-button" onClick={onRevoke}>Revoke link</button><button className="secondary-button" onClick={onClose}>Done</button><button className="primary-button" onClick={copy}>Copy link <ArrowUpRight size={16} /></button></div></section></div>;
}

function CommitmentsPage({ items, onSelect }: { items: Commitment[]; onSelect: (item: Commitment) => void }) { return <section className="panel page-panel"><PanelHeading title="All commitments" subtitle="Every shared commitment in this workspace." /><div className="commitment-list">{items.map((item) => <CommitmentRow key={item.id} item={item} onClick={() => onSelect(item)} />)}</div></section>; }
function RelationshipsPage({ items }: { items: Commitment[] }) { const relationships = Array.from(new Map(items.map((item) => [item.counterparty, item])).values()); return <section className="panel page-panel"><PanelHeading title="Relationships" subtitle="Private history built from your shared commitments." /><div className="relationship-list">{relationships.map((item) => <div className="relationship-row" key={item.counterparty}><div className="party-avatar">{item.initials}</div><div><strong>{item.counterparty}</strong><span>Last recorded activity: {item.updated}</span></div><b>{item.status === "completed" ? "Closed" : statusMeta[item.status].label}</b></div>)}</div></section>; }
function ActivityPage({ items }: { items: Commitment[] }) { return <section className="panel page-panel"><PanelHeading title="Activity" subtitle="A factual record of changes in this workspace." /><div className="activity-list">{items.map((item) => <ActivityItem key={item.id} icon={<Link2 />} title={`${statusMeta[item.status].label} commitment`} detail={`${item.counterparty} · ${item.id}`} time={item.updated} tone={item.status === "disputed" ? "danger" : item.status === "accepted" ? "success" : "neutral"} />)}</div></section>; }
function BusinessProfilePage({ workspaceName, workspaceType, workspaceLocation, onSave }: { workspaceName: string; workspaceType: string; workspaceLocation: string; onSave: (event: FormEvent<HTMLFormElement>) => void }) { return <section className="profile-grid"><form className="panel profile-card" onSubmit={onSave}><p className="eyebrow">BUSINESS IDENTITY</p><h2>Business profile</h2><p className="page-subtitle">This identity labels your private C-Link workspace and shared records.</p><div className="profile-fields"><label><span>Business name</span><input name="businessName" defaultValue={workspaceName} required /></label><label><span>Business type</span><input name="businessType" defaultValue={workspaceType} required /></label><label><span>Location</span><input name="businessLocation" defaultValue={workspaceLocation} /></label><div><span>Record visibility</span><strong>Private by default</strong></div></div><button className="primary-button" type="submit">Save profile <Check size={16} /></button></form><div className="panel profile-card"><p className="eyebrow">CONTINUITY</p><h2>What C-Link remembers</h2><p className="page-subtitle">Documented commitments, responses, evidence and outcomes stay attached to the business record.</p><div className="profile-checks"><span><Check size={15} />Commitments and amendments</span><span><Check size={15} />Counterparty responses</span><span><Check size={15} />Evidence and issue history</span><span><Check size={15} />Permission-controlled sharing</span></div></div></section>; }
function SettingsPage() { return <section className="panel page-panel"><PanelHeading title="Settings" subtitle="Workspace controls and privacy defaults." /><div className="settings-list"><div><strong>Private records</strong><span>Only authorized workspace members and explicitly shared recipients can access records.</span></div><div><strong>Share links</strong><span>Recipient links expire automatically and can be revoked by the workspace.</span></div><div><strong>Evidence policy</strong><span>Evidence is recorded as submitted, confirmed, disputed or resolved—not as automatic truth.</span></div></div><div className="settings-actions"><button className="secondary-button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div></section>; }
function SearchPanel({ items, onClose, onSelect }: { items: Commitment[]; onClose: () => void; onSelect: (item: Commitment) => void }) { const [query, setQuery] = useState(""); const matches = items.filter((item) => `${item.counterparty} ${item.summary} ${item.id}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title"><div className="modal-head"><div><p className="eyebrow">WORKSPACE SEARCH</p><h2 id="search-title">Find a commitment</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search counterparty, item or C-Link ID" />{query && matches.length === 0 ? <p className="search-empty">No matching commitment found.</p> : <div className="search-results">{matches.map((item) => <button key={item.id} className="search-result" onClick={() => onSelect(item)}><span className="party-avatar">{item.initials}</span><span><strong>{item.counterparty}</strong><small>{item.id} · {item.summary}</small></span><ArrowUpRight size={15} /></button>)}</div>}</section></div>; }
function NotificationPanel({ onClose }: { onClose: () => void }) { return <div className="popover-panel notification-panel"><div className="popover-head"><strong>Notifications</strong><button className="icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button></div><div className="notification-item"><CircleAlert size={16} /><span><strong>One commitment needs attention.</strong><small>Review the open response and dispute.</small></span></div><div className="notification-item"><Check size={16} /><span><strong>Northstar Foods accepted.</strong><small>The shared record is up to date.</small></span></div></div>; }
function InfoPanel({ onClose }: { onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><div className="modal-head"><div><p className="eyebrow">HOW C-LINK WORKS</p><h2 id="info-title">One shared record</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="info-steps"><span><b>1</b><strong>Commit</strong><small>Record the terms both parties can see.</small></span><span><b>2</b><strong>Respond</strong><small>Accept, reject or request a change.</small></span><span><b>3</b><strong>Close the loop</strong><small>Add evidence, outcome and settlement records.</small></span></div></section></div>; }
function EvidenceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (description: string, file?: File) => void }) { const [description, setDescription] = useState(""); const [file, setFile] = useState<File>(); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="evidence-title"><div className="modal-head"><div><p className="eyebrow">ADD TO RECORD</p><h2 id="evidence-title">Add evidence</h2><p>Attach a note, photo or PDF to the shared record.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><label>Evidence note<textarea autoFocus rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened, and when?" /></label><label>File (optional)<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0])} /></label>{file && <p className="file-caption">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!description.trim() && !file} onClick={() => onSubmit(description.trim() || file?.name || "Evidence attached", file)}>Add to timeline</button></div></section></div>; }
function IssueModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (issueType: string, description: string) => void }) { const [issueType, setIssueType] = useState("other"); const [description, setDescription] = useState(""); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="issue-title"><div className="modal-head"><div><p className="eyebrow">SHARED RECORD</p><h2 id="issue-title">Report an issue</h2><p>This records a concern; it does not make a legal judgment.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><label>Issue type<select value={issueType} onChange={(e) => setIssueType(e.target.value)}><option value="quantity_mismatch">Quantity mismatch</option><option value="late_delivery">Late delivery</option><option value="condition_issue">Condition issue</option><option value="payment_mismatch">Payment mismatch</option><option value="other">Other</option></select></label><label>Description<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue clearly" /></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!description.trim()} onClick={() => onSubmit(issueType, description.trim())}>Report issue</button></div></section></div>; }

function ExpectationRecipientApp({ token }: { token: string }) {
  const [expectation, setExpectation] = useState<Expectation | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "submitted" | "error">("loading");
  const [responseType, setResponseType] = useState<"can_fulfill" | "can_with_changes" | "cannot_fulfill">("can_fulfill");
  const [quantity, setQuantity] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [price, setPrice] = useState("");
  const [conditions, setConditions] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getSharedExpectation(token).then((data) => { setExpectation(data); setQuantity(String(data.quantity)); setNeededBy(data.neededBy); setState("ready"); }).catch(() => setState("error")); }, [token]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!expectation || busy) return; setBusy(true);
    try { const next = await respondToExpectation(token, { type: responseType, proposedTerms: responseType === "cannot_fulfill" ? undefined : { quantity: Number(quantity), unit: expectation.unit, neededBy, price: Number(price) || expectation.budget || 0, currency: expectation.currency }, conditions, responseNote: note }); setExpectation(next); setState("submitted"); } catch { setState("error"); } finally { setBusy(false); }
  }
  if (state === "loading") return <RecipientShell><div className="recipient-state"><div className="loading-mark" /><h1>Loading your C-Link</h1><p>Preparing the shared business need.</p></div></RecipientShell>;
  if (state === "error" || !expectation) return <RecipientShell><div className="recipient-state"><div className="recipient-icon danger"><CircleAlert size={23} /></div><h1>This C-Link is unavailable</h1><p>The need may have expired, been withdrawn, or is no longer accepting responses.</p></div></RecipientShell>;
  if (state === "submitted") return <RecipientShell><div className="recipient-state"><div className="recipient-icon"><Check size={23} /></div><h1>Response recorded</h1><p>Your capability response has been sent to {expectation.ownerPartyId}. The sender can now review it before creating a shared commitment.</p><p className="recipient-footnote">C-Link records a submitted response. It does not guarantee fulfilment or make a legal judgment.</p></div></RecipientShell>;
  return <RecipientShell><main className="recipient-card expectation-recipient-card"><div className="recipient-brand"><div className="brand-mark">C</div><span>C-Link</span><span className="recipient-label">Shared business need</span></div><div className="recipient-heading"><p className="eyebrow">RESPOND TO A BUSINESS NEED</p><h1>{expectation.ownerPartyId} needs your capability</h1><p>Review the need and tell them what you can actually provide. Nothing becomes a commitment until both sides align.</p></div><section className="terms-card"><div className="terms-card-head"><div><span className="detail-label">REQUESTED</span><h2>{expectation.item}</h2></div><span className="status-pill warning"><i />Needs response</span></div><div className="terms-grid"><div><span>Quantity</span><strong>{expectation.quantity} {expectation.unit}</strong></div><div><span>Needed by</span><strong>{expectation.neededBy}</strong></div><div><span>Location</span><strong>{expectation.location || "Not specified"}</strong></div></div><div className="criteria"><span>Acceptance criteria</span><strong>{expectation.acceptanceCriteria}</strong></div></section><form className="recipient-response-form" onSubmit={submit}><label>Response<select value={responseType} onChange={(e) => setResponseType(e.target.value as typeof responseType)}><option value="can_fulfill">I can fulfill this need</option><option value="can_with_changes">I can fulfill with changes</option><option value="cannot_fulfill">I cannot fulfill this need</option></select></label>{responseType !== "cannot_fulfill" && <div className="form-row"><label>Available quantity<input type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></label><label>Proposed price<input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={expectation.budget ? String(expectation.budget) : "Optional"} /></label><label>Available by<input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} required /></label></div>}<label>Conditions or limitations<textarea rows={3} value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="What should the sender know before alignment?" /></label><label>Response note (optional)<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a short note" /></label><div className="recipient-note"><ShieldCheck size={17} /><span>Your response is a submitted capability claim. The sender will review it before creating any commitment.</span></div><button className="primary-button full" disabled={busy}>{busy ? "Recording…" : "Send capability response"}</button></form><p className="recipient-footnote">C-Link keeps needs, responses and outcomes together. It does not move money or automatically verify claims.</p></main></RecipientShell>;
}

function RecipientApp({ token }: { token: string }) {
  const [commitment, setCommitment] = useState<Awaited<ReturnType<typeof getSharedCommitment>> | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "accepted" | "rejected" | "change_requested">("loading");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState<"change" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getSharedCommitment(token).then((data) => { setCommitment(data); setState(data.status === "accepted" ? "accepted" : "ready"); }).catch(() => setState("error")); }, [token]);

  async function respond(action: "accept" | "reject" | "change") {
    if (!commitment || busy) return;
    setBusy(true);
    try {
      const next = action === "accept" ? await acceptSharedCommitment(token) : action === "reject" ? await rejectSharedCommitment(token, note || "Terms were not accepted") : await requestSharedCommitmentChange(token, note || "Please review the terms");
      setCommitment(next); setState(action === "accept" ? "accepted" : action === "reject" ? "rejected" : "change_requested"); setShowNote(null); setNote("");
    } catch { setState("error"); }
    finally { setBusy(false); }
  }

  if (state === "loading") return <RecipientShell><div className="recipient-state"><div className="loading-mark" /><h1>Loading your C-Link</h1><p>Preparing the shared commitment record.</p></div></RecipientShell>;
  if (state === "error" || !commitment) return <RecipientShell><div className="recipient-state"><div className="recipient-icon danger"><CircleAlert size={23} /></div><h1>This C-Link is unavailable</h1><p>The link may have expired, been revoked, or is not accessible anymore.</p></div></RecipientShell>;
  const version = commitment.versions.at(-1)!;
  const isFinal = ["accepted", "rejected", "change_requested"].includes(state);
  return <RecipientShell><main className="recipient-card"><div className="recipient-brand"><div className="brand-mark">C</div><span>C-Link</span><span className="recipient-label">Shared commitment</span></div><div className="recipient-heading"><p className="eyebrow">REVIEW BEFORE YOU RESPOND</p><h1>{commitment.creatorPartyId} sent you a commitment</h1><p>Read the agreed terms carefully. Nothing is accepted until you choose an action below.</p></div><section className="terms-card"><div className="terms-card-head"><div><span className="detail-label">COMMITMENT</span><h2>{version.item}</h2></div><span className={`status-pill ${isFinal ? "success" : "warning"}`}><i />{state === "accepted" ? "Accepted" : state === "rejected" ? "Rejected" : state === "change_requested" ? "Change requested" : "Awaiting response"}</span></div><div className="terms-grid"><div><span>Quantity</span><strong>{version.quantity} {version.unit}</strong></div><div><span>Amount</span><strong>{version.currency} {Number(version.price).toLocaleString("en-BD")}</strong></div><div><span>Due date</span><strong>{version.deadline}</strong></div></div><div className="criteria"><span>Acceptance criteria</span><strong>{version.acceptanceCriteria || "Confirm the agreed commitment"}</strong></div></section>{!isFinal ? <><div className="recipient-note"><ShieldCheck size={17} /><span>This is a shared record of the sender's terms. You can accept, reject, or request a change.</span></div>{showNote && <label className="recipient-form-label">{showNote === "change" ? "What should be changed?" : "Why are you rejecting this commitment?"}<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a short note" rows={3} autoFocus /></label>}<div className="recipient-actions"><button className="secondary-button" disabled={busy} onClick={() => { if (showNote === "reject") respond("reject"); else setShowNote("reject"); }}>{showNote === "reject" ? "Send rejection" : "Reject"}</button><button className="secondary-button" disabled={busy} onClick={() => { if (showNote === "change") respond("change"); else setShowNote("change"); }}>{showNote === "change" ? "Send change request" : "Request a change"}</button><button className="primary-button" disabled={busy} onClick={() => respond("accept")}><Check size={17} />{busy ? "Recording…" : "Accept commitment"}</button></div></> : <div className="recipient-complete"><Check size={18} /><span>{state === "accepted" ? "Your acceptance has been recorded. Both parties now share the same commitment version." : state === "change_requested" ? "Your change request has been recorded and sent back to the sender." : "Your rejection has been recorded."}</span></div>}<p className="recipient-footnote">C-Link records responses and evidence. It does not make legal judgments or move money.</p></main></RecipientShell>;
}

function RecipientShell({ children }: { children: ReactNode }) { return <div className="recipient-shell">{children}</div>; }

export default App;

const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)/);
const expectationShareMatch = window.location.pathname.match(/^\/expectation\/([^/]+)/);
const rootElement = document.getElementById("root")!;
const rootKey = "__clinkReactRoot";
const root = (window as Window & { [rootKey]?: ReturnType<typeof createRoot> })[rootKey] || createRoot(rootElement);
(window as Window & { [rootKey]?: ReturnType<typeof createRoot> })[rootKey] = root;
const visualTestRoute = window.location.pathname === "/clink/visual-test";
root.render(visualTestRoute ? <VisualTest /> : expectationShareMatch ? <ExpectationRecipientApp token={decodeURIComponent(expectationShareMatch[1])} /> : shareMatch ? <RecipientApp token={decodeURIComponent(shareMatch[1])} /> : <AuthGate><App /></AuthGate>);
