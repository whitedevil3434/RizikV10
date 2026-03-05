import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";

export default async function ProductReviewsPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_product_reviews").select("*").order("created_at", { ascending: false });
    const reviews = (data || []) as Array<{
        id: string; product_sku: string; customer_name: string; customer_email: string | null;
        rating: number; review_text: string | null; verified_purchase: boolean; status: string; created_at: string;
    }>;

    const statusColor: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";
    const approvedCount = reviews.filter(r => r.status === "APPROVED").length;

    function renderStars(rating: number) {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    }

    return (
        <OpsShell title="Product Reviews" subtitle="Customer feedback and ratings — moderate, approve, and analyze." activeHref="/admin/products" scopeLabel="Admin ERP" roleLabel="E-Commerce" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/products", label: "Products", tone: "neutral" }, { href: "/admin/reviews", label: "Reviews", tone: "primary" }]}>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL REVIEWS</p>
                    <p className="text-2xl font-bold text-[#031E49]">{reviews.length}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">AVG RATING</p>
                    <p className="text-2xl font-bold text-amber-500">{avgRating} ★</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">PUBLISHED</p>
                    <p className="text-2xl font-bold text-[#00B16A]">{approvedCount}</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">All Reviews</h2></div>
                <div className="divide-y divide-[#031E49]/8">
                    {reviews.map(r => (
                        <article key={r.id} className="px-5 py-4 hover:bg-[#F5F2EB]/40 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-amber-400 text-sm tracking-wider">{renderStars(r.rating)}</span>
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#031E49]/10 text-[#031E49]/60">{r.product_sku}</span>
                                        {r.verified_purchase && <span className="text-[10px] font-bold text-[#00B16A]">✓ Verified</span>}
                                    </div>
                                    {r.review_text && <p className="text-sm text-[#031E49] mt-1">{r.review_text}</p>}
                                    <p className="text-[11px] text-[#0A2D6C]/45 mt-1.5">{r.customer_name} · {new Date(r.created_at).toLocaleDateString("en-GB")}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold shrink-0 ${statusColor[r.status] || "bg-gray-100"}`}>{r.status}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </OpsShell>
    );
}
