import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PurchaseOrdersPage() {
    const admin = createAdminClient();

    // Fetch POs
    const { data: pos } = await admin
        .from("rizik_purchase_orders")
        .select("*, supplier:supplier_id(name)")
        .order("created_at", { ascending: false });

    const purchaseOrders = (pos || []) as any[];

    return (
        <OpsShell
            title="Purchase Orders"
            subtitle="Manage raw material procurement and supplier tracking."
            activeHref="/admin/inventory"
            scopeLabel="Admin ERP"
            roleLabel="Procurement"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/inventory", label: "Stock Overview", tone: "neutral" },
                { href: "/admin/inventory/po", label: "Purchase Orders", tone: "primary" },
            ]}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#031E49]">Active POs</h2>
                <button className="px-5 py-2 bg-[#031E49] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#0A2D6C]">
                    + Create New PO
                </button>
            </div>

            <section className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F5F2EB] text-[#031E49]/50 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">PO Number</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Expected Date</th>
                            <th className="px-6 py-4 text-right">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#031E49]/5">
                        {purchaseOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-[#0A2D6C]/40 italic">
                                    No purchase orders found. Start by sourcing raw materials.
                                </td>
                            </tr>
                        ) : (
                            purchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-[#031E49]">{po.po_number}</td>
                                    <td className="px-6 py-4 text-[#031E49]">{po.supplier?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' :
                                                po.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#0A2D6C]/60">{po.expected_delivery_date || 'TBD'}</td>
                                    <td className="px-6 py-4 text-right font-bold text-[#031E49]">৳{po.total_amount_bdt.toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </OpsShell>
    );
}
