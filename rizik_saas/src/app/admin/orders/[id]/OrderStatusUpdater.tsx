"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/order";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "MANUFACTURING",
    "QA_CHECK",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

const SLA_STATES = ["ON_TRACK", "WATCH", "RISK", "CLOSED"];

interface Props {
    orderId: string;
    currentStatus: string;
    currentSla: string;
}

export default function OrderStatusUpdater({ orderId, currentStatus, currentSla }: Props) {
    const [status, setStatus] = useState(currentStatus);
    const [sla, setSla] = useState(currentSla);
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleSave() {
        setMessage(null);
        startTransition(async () => {
            const result = await updateOrderStatusAction(orderId, status, sla);
            if (result.error) {
                setMessage(`❌ ${result.error}`);
            } else {
                setMessage("✅ Order updated successfully!");
                router.refresh();
            }
        });
    }

    return (
        <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm p-6">
            <h3 className="text-base font-bold text-[#031E49] mb-4">Update Status</h3>

            {message && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.startsWith("✅") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                    {message}
                </div>
            )}

            {/* Status Selector */}
            <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1.5">
                    Order Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] font-semibold focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                >
                    {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
            </div>

            {/* SLA Selector */}
            <div className="mb-5">
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1.5">
                    SLA State
                </label>
                <select
                    value={sla}
                    onChange={(e) => setSla(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] font-semibold focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                >
                    {SLA_STATES.map((s) => (
                        <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={isPending || (status === currentStatus && sla === currentSla)}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${isPending
                        ? "bg-[#031E49]/50 text-white/70 cursor-wait"
                        : status === currentStatus && sla === currentSla
                            ? "bg-[#031E49]/20 text-[#031E49]/40 cursor-not-allowed"
                            : "bg-[#00B16A] text-white hover:bg-emerald-600"
                    }`}
            >
                {isPending ? "Saving..." : "Save Changes"}
            </button>
        </section>
    );
}
