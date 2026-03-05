import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  BanknotesIcon, UserGroupIcon, TruckIcon,
  WrenchScrewdriverIcon, ShoppingBagIcon,
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
      title: "Revenue & Finance", icon: BanknotesIcon, href: "/admin/finance", accent: "#00B16A",
      metrics: [
        { label: "Revenue Collected", value: formatBDT(revenueCollected) },
        { label: "Outstanding (AR)", value: formatBDT(revenueOutstanding) },
        { label: "Approved Expenses", value: formatBDT(totalExpApproved) },
        { label: "Net Profit", value: formatBDT(netProfit), color: netProfit >= 0 ? "text-[#00B16A]" : "text-red-600" },
      ],
    },
    {
      title: "Orders & Fulfillment", icon: TruckIcon, href: "/admin/orders", accent: "#0A2D6C",
      metrics: [
        { label: "Total Orders", value: uniqueOrders.toString() },
        { label: "Order Revenue", value: formatBDT(orderRevenue) },
        { label: "Avg Order Value", value: formatBDT(avgOrderValue) },
        { label: "Fulfillment Rate", value: fulfillmentRate + "%" },
      ],
    },
    {
      title: "Customers & CRM", icon: UserGroupIcon, href: "/admin/crm/customers", accent: "#6366F1",
      metrics: [
        { label: "Total Customers", value: cust.length.toString() },
        { label: "B2B Accounts", value: b2bCustomers.toString() },
        { label: "Total LTV", value: formatBDT(totalLTV) },
        { label: "B2B Credit Extended", value: formatBDT(totalB2BCredit) },
      ],
    },
    {
      title: "HR & Workforce", icon: UserGroupIcon, href: "/admin/hr", accent: "#EC4899",
      metrics: [
        { label: "Active Employees", value: activeEmps.toString() },
        { label: "Departments", value: departments.toString() },
        { label: "Monthly Payroll", value: formatBDT(totalPayroll) },
        { label: "Pending Leaves", value: leaveList.filter(l => l.status === "PENDING").length.toString() },
      ],
    },
    {
      title: "Production & QC", icon: WrenchScrewdriverIcon, href: "/admin/production/batches", accent: "#F59E0B",
      metrics: [
        { label: "Total Produced", value: totalProduced.toLocaleString() },
        { label: "Yield Rate", value: yieldRate + "%" },
        { label: "QC Pass Rate", value: qcPassRate + "%" },
        { label: "Active Batches", value: bat.filter(b => b.status === "IN_PROGRESS").length.toString() },
      ],
    },
    {
      title: "E-Commerce & Products", icon: ShoppingBagIcon, href: "/admin/products", accent: "#8B5CF6",
      metrics: [
        { label: "Active Products", value: activeProducts.toString() },
        { label: "Product Reviews", value: revs.length.toString() },
        { label: "Avg Rating", value: avgRating + " ★" },
        { label: "B2B Accounts", value: b2bList.filter(c => c.status === "ACTIVE").length.toString() },
      ],
    },
  ];

  return (
    <OpsShell
      title="Executive BI Dashboard"
      subtitle="Cross-module analytics — revenue, operations, workforce, and production at a glance."
      activeHref="/admin/analytics"
      scopeLabel="Admin ERP"
      roleLabel="Executive Analytics"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/finance", label: "Finance", tone: "neutral" },
        { href: "/admin/hr", label: "HR", tone: "neutral" },
        { href: "/admin/production/batches", label: "Production", tone: "neutral" },
        { href: "/admin/analytics", label: "Analytics", tone: "primary" },
      ]}
    >
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#031E49] to-[#0A2D6C] text-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">TOTAL REVENUE</p>
          <p className="text-3xl font-bold">{formatBDT(revenueCollected)}</p>
          <p className="text-xs text-[#00B16A] mt-1">↗ {inv.filter(i => i.status === "PAID").length} invoices collected</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#00B16A] to-[#059669] text-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">NET PROFIT</p>
          <p className="text-3xl font-bold">{formatBDT(netProfit)}</p>
          <p className="text-xs text-white/60 mt-1">{(revenueCollected > 0 ? (netProfit / revenueCollected * 100).toFixed(0) : 0)}% margin</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">CUSTOMER LTV</p>
          <p className="text-3xl font-bold">{formatBDT(totalLTV)}</p>
          <p className="text-xs text-white/60 mt-1">{cust.length} customers total</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">PRODUCTION YIELD</p>
          <p className="text-3xl font-bold">{yieldRate}%</p>
          <p className="text-xs text-white/60 mt-1">{totalProduced.toLocaleString()} units produced</p>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(mod => (
          <Link key={mod.title} href={mod.href} className="group rounded-2xl border border-[#031E49]/10 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#031E49]/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: mod.accent + "15" }}>
                <mod.icon className="w-5 h-5" style={{ color: mod.accent }} />
              </div>
              <h3 className="text-sm font-bold text-[#031E49] group-hover:text-[#00B16A] transition-colors">{mod.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mod.metrics.map(m => (
                <div key={m.label}>
                  <p className="text-[10px] uppercase text-[#0A2D6C]/45 mb-0.5">{m.label}</p>
                  <p className={`text-lg font-bold text-[#031E49] ${(m as { color?: string }).color || ""}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </OpsShell>
  );
}
