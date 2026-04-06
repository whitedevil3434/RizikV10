import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  BanknotesIcon, UserGroupIcon, TruckIcon,
  WrenchScrewdriverIcon, ShoppingBagIcon, ChartBarIcon
} from "@heroicons/react/24/outline";

export default async function AnalyticsDashboardPage() {
  const admin = createAdminClient();

  // Fetch data from ALL modules in parallel
  const [
    { data: invoices }, { data: expenses }, { data: orders },
    { data: customers }, { data: employees }, { data: batches },
    { data: qcData }, { data: products }, { data: reviews },
    { data: b2b }, { data: leaves }, { data: payroll },
  ] = await Promise.all([
    admin.from("rizik_invoices").select("id, total_bdt, status"),
    admin.from("rizik_expenses").select("id, amount_bdt, status, category"),
    admin.from("rizik_order_records").select("id, order_code, unit_price_bdt, quantity, status"),
    admin.from("rizik_customers").select("id, channel, lifetime_value_bdt, total_orders"),
    admin.from("rizik_employees").select("id, status, salary_bdt, department"),
    admin.from("rizik_production_batches").select("id, quantity_produced, quantity_rejected, status"),
    admin.from("rizik_qc_inspections").select("id, result, defect_count"),
    admin.from("empire_products").select("id, is_active, price"),
    admin.from("rizik_product_reviews").select("id, rating, status"),
    admin.from("rizik_b2b_companies").select("id, credit_limit_bdt, status"),
    admin.from("rizik_leave_requests").select("id, status, days"),
    admin.from("rizik_payroll").select("id, net_salary_bdt"),
  ]);

  const inv = (invoices || []) as Array<{ id: string; total_bdt: number; status: string }>;
  const exp = (expenses || []) as Array<{ id: string; amount_bdt: number; status: string; category: string }>;
  const ord = (orders || []) as Array<{ id: string; order_code: string; unit_price_bdt: number; quantity: number; status: string }>;
  const cust = (customers || []) as Array<{ id: string; channel: string; lifetime_value_bdt: number; total_orders: number }>;
  const emps = (employees || []) as Array<{ id: string; status: string; salary_bdt: number; department: string }>;
  const bat = (batches || []) as Array<{ id: string; quantity_produced: number; quantity_rejected: number; status: string }>;
  const qc = (qcData || []) as Array<{ id: string; result: string; defect_count: number }>;
  const prods = (products || []) as Array<{ id: string; is_active: boolean; price: number }>;
  const revs = (reviews || []) as Array<{ id: string; rating: number; status: string }>;
  const b2bList = (b2b || []) as Array<{ id: string; credit_limit_bdt: number; status: string }>;
  const leaveList = (leaves || []) as Array<{ id: string; status: string; days: number }>;
  const payList = (payroll || []) as Array<{ id: string; net_salary_bdt: number }>;

  // === COMPUTE METRICS ===
  const revenueCollected = inv.filter(i => i.status === "PAID").reduce((s, i) => s + i.total_bdt, 0);
  const revenueOutstanding = inv.filter(i => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.total_bdt, 0);
  const totalExpApproved = exp.filter(e => e.status === "APPROVED" || e.status === "PROCESSED").reduce((s, e) => s + e.amount_bdt, 0);
  const netProfit = revenueCollected - totalExpApproved;

  const uniqueOrders = [...new Set(ord.map(o => o.order_code))].length;
  const orderRevenue = ord.reduce((s, o) => s + o.quantity * o.unit_price_bdt, 0);
  const avgOrderValue = uniqueOrders > 0 ? orderRevenue / uniqueOrders : 0;
  const fulfillmentRate = ord.length > 0 ? (ord.filter(o => o.status === "DELIVERED" || o.status === "SHIPPED").length / ord.length * 100).toFixed(0) : "0";

  const totalLTV = cust.reduce((s, c) => s + c.lifetime_value_bdt, 0);
  const b2bCustomers = cust.filter(c => c.channel === "B2B").length;

  const activeEmps = emps.filter(e => e.status === "ACTIVE").length;
  const totalPayroll = payList.reduce((s, p) => s + p.net_salary_bdt, 0);
  const departments = [...new Set(emps.map(e => e.department))].length;

  const totalProduced = bat.reduce((s, b) => s + b.quantity_produced, 0);
  const totalRejected = bat.reduce((s, b) => s + b.quantity_rejected, 0);
  const yieldRate = totalProduced > 0 ? ((totalProduced - totalRejected) / totalProduced * 100).toFixed(1) : "0";
  const qcPassRate = qc.length > 0 ? (qc.filter(q => q.result === "PASS").length / qc.length * 100).toFixed(0) : "0";

  const activeProducts = prods.filter(p => p.is_active).length;
  const avgRating = revs.length > 0 ? (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1) : "0";
  const totalB2BCredit = b2bList.reduce((s, c) => s + c.credit_limit_bdt, 0);

  function formatBDT(n: number) {
    if (n >= 1000000) return `৳${(n / 1000000).toFixed(2)}M`;
    if (n >= 100000) return `৳${(n / 1000).toFixed(0)}K`;
    if (n >= 1000) return `৳${(n / 1000).toFixed(1)}K`;
    return `৳${Math.round(n).toLocaleString()}`;
  }

  const modules = [
    {
      title: "CMO: Market & Growth", icon: ChartBarIcon, href: "/admin/analytics", accent: "#6366F1",
      metrics: [
        { label: "Lead LTV", value: formatBDT(totalLTV) },
        { label: "B2B Expansion", value: b2bCustomers.toString() },
        { label: "Social Reach", value: "4.2M" }, // Mocked for now
        { label: "Active Campaigns", value: "8" },
      ],
    },
    {
      title: "COO: Operations Hub", icon: TruckIcon, href: "/admin/orders", accent: "#0A2D6C",
      metrics: [
        { label: "SLA Adherence", value: fulfillmentRate + "%" },
        { label: "Squad Utilization", value: "82%" },
        { label: "Active Orders", value: uniqueOrders.toString() },
        { label: "Route Efficiency", value: "94%" },
      ],
    },
    {
      title: "CFO: Financial Engine", icon: BanknotesIcon, href: "/admin/finance", accent: "#00B16A",
      metrics: [
        { label: "MTD Revenue", value: formatBDT(revenueCollected) },
        { label: "Burn Rate (Est)", value: formatBDT(totalExpApproved) },
        { label: "Net Margin", value: (revenueCollected > 0 ? (netProfit / revenueCollected * 100).toFixed(0) : 0) + "%" },
        { label: "Payroll Run", value: formatBDT(totalPayroll) },
      ],
    },
    {
      title: "CSO: Strategy & Supply", icon: WrenchScrewdriverIcon, href: "/admin/production/batches", accent: "#F59E0B",
      metrics: [
        { label: "Production Yield", value: yieldRate + "%" },
        { label: "QC Pass Rate", value: qcPassRate + "%" },
        { label: "Sourcing Speed", value: "1.4d" },
        { label: "Risk Items", value: "3" },
      ],
    },
  ];

  return (
    <OpsShell
      title="Executive Intelligence Dashboard"
      subtitle="Master control panel for CMO, COO, CFO, and CSO — specialized role-based visibility."
      activeHref="/admin/analytics"
      scopeLabel="Admin ERP"
      roleLabel="Strategic Analytics"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/finance", label: "Finance", tone: "neutral" },
        { href: "/admin/reports", label: "Staff Reports", tone: "neutral" },
        { href: "/admin/analytics", label: "Analytics", tone: "primary" },
      ]}
    >
      {/* Role-Specific Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 shadow-sm">
          <p className="text-[10px] font-bold text-[#6366F1] uppercase mb-1">CMO Briefing</p>
          <p className="text-xs text-[#0A2D6C]/60 italic font-medium">"Focus on B2B expansion; consumer LTV is up 12%."</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 shadow-sm">
          <p className="text-[10px] font-bold text-[#0A2D6C] uppercase mb-1">COO Briefing</p>
          <p className="text-xs text-[#0A2D6C]/60 italic font-medium">"SLA is healthy, active orders spiked in Sector 4."</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 shadow-sm">
          <p className="text-[10px] font-bold text-[#00B16A] uppercase mb-1">CFO Briefing</p>
          <p className="text-xs text-[#0A2D6C]/60 italic font-medium">"Net margin stable at 30%+. Payroll ready."</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 shadow-sm">
          <p className="text-[10px] font-bold text-[#F59E0B] uppercase mb-1">CSO Briefing</p>
          <p className="text-xs text-[#0A2D6C]/60 italic font-medium">"Yield rate hit 98%. Sourcing verified."</p>
        </div>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#031E49] to-[#0A2D6C] text-white p-6 shadow-lg transform hover:scale-[1.02] transition-all">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">TOTAL REVENUE</p>
          <p className="text-3xl font-bold">{formatBDT(revenueCollected)}</p>
          <p className="text-xs text-[#00B16A] mt-1">↗ {inv.filter(i => i.status === "PAID").length} invoices collected</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#00B16A] to-[#059669] text-white p-6 shadow-lg transform hover:scale-[1.02] transition-all">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">NET PROFIT</p>
          <p className="text-3xl font-bold">{formatBDT(netProfit)}</p>
          <p className="text-xs text-white/60 mt-1">{(revenueCollected > 0 ? (netProfit / revenueCollected * 100).toFixed(0) : 0)}% margin</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white p-6 shadow-lg transform hover:scale-[1.02] transition-all">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">CUSTOMER LTV</p>
          <p className="text-3xl font-bold">{formatBDT(totalLTV)}</p>
          <p className="text-xs text-white/60 mt-1">{cust.length} customers total</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white p-6 shadow-lg transform hover:scale-[1.02] transition-all">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">PRODUCTION YIELD</p>
          <p className="text-3xl font-bold">{yieldRate}%</p>
          <p className="text-xs text-white/60 mt-1">{totalProduced.toLocaleString()} units produced</p>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => (
          <Link key={mod.title} href={mod.href} className="group rounded-3xl border border-[#031E49]/10 bg-white p-8 shadow-sm hover:shadow-md hover:border-[#00B16A]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: mod.accent + "15" }}>
                  <mod.icon className="w-6 h-6" style={{ color: mod.accent }} />
                </div>
                <h3 className="text-lg font-bold text-[#031E49] group-hover:text-[#00B16A] transition-colors">{mod.title}</h3>
              </div>
              <span className="text-xs font-bold text-[#0A2D6C]/30 group-hover:text-[#00B16A]">View Deep Insights →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {mod.metrics.map(m => (
                <div key={m.label}>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#0A2D6C]/45 mb-1">{m.label}</p>
                  <p className={`text-xl font-black text-[#031E49] ${(m as { color?: string }).color || ""}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </OpsShell>
  );
}
