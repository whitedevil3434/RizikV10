import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function B2BPortalPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_b2b_companies").select("*").order("credit_limit_bdt", { ascending: false });
    const companies = (data || []) as Array<{
        id: string; company_name: string; trade_license: string | null; contact_name: string | null;
        email: string | null; phone: string | null; address: string | null;
        payment_terms: string; credit_limit_bdt: number; discount_pct: number; status: string;
    }>;

    function formatBDT(n: number) {
        if (n >= 1000000) return `৳${(n / 1000000).toFixed(1)}M`;
        return `৳${Math.round(n).toLocaleString()}`;
    }

    const totalCredit = companies.reduce((s, c) => s + c.credit_limit_bdt, 0);
    const termsColor: Record<string, string> = { NET_30: "bg-blue-100 text-blue-700", NET_60: "bg-indigo-100 text-indigo-700", COD: "bg-amber-100 text-amber-700" };

    return (
        <OpsShell title="B2B Portal" subtitle="Wholesale accounts — company profiles, credit limits, and payment terms." activeHref="/admin/orders" scopeLabel="Admin ERP" roleLabel="B2B Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/b2b", label: "B2B Storefront", tone: "neutral" }, { href: "/admin/orders", label: "Orders", tone: "primary" }]}>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">B2B ACCOUNTS</p>
                    <p className="text-2xl font-bold text-[#031E49]">{companies.length}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL CREDIT EXTENDED</p>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalCredit)}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">AVG DISCOUNT</p>
                    <p className="text-2xl font-bold text-[#00B16A]">{companies.length > 0 ? (companies.reduce((s, c) => s + c.discount_pct, 0) / companies.length).toFixed(1) : 0}%</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Wholesale Accounts</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Terms</th><th className="px-5 py-3">Credit Limit</th><th className="px-5 py-3">Discount</th><th className="px-5 py-3">License</th><th className="px-5 py-3">Status</th></tr>
                        </thead>
                        <tbody>{companies.map(c => (
                            <tr key={c.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                <td className="px-5 py-3"><p className="font-semibold text-[#031E49]">{c.company_name}</p><p className="text-[11px] text-[#0A2D6C]/45">{c.address || ""}</p></td>
                                <td className="px-5 py-3"><p className="text-[#031E49]">{c.contact_name || "—"}</p><p className="text-[11px] text-[#0A2D6C]/45">{c.email || ""}</p></td>
                                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${termsColor[c.payment_terms] || "bg-gray-100"}`}>{c.payment_terms.replace("_", " ")}</span></td>
                                <td className="px-5 py-3 font-semibold text-[#031E49]">{formatBDT(c.credit_limit_bdt)}</td>
                                <td className="px-5 py-3 font-bold text-[#00B16A]">{c.discount_pct}%</td>
                                <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/50">{c.trade_license || "—"}</td>
                                <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{c.status}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
