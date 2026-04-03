"use client";

import { useState } from "react";
import { approveWriterCredits } from "@/lib/ops/data";
import { useRouter } from "next/navigation";

interface ApproveCreditsButtonProps {
  orderId: string;
  orderCode: string;
}

export default function ApproveCreditsButton({ orderId, orderCode }: ApproveCreditsButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to approve credits for Order #${orderCode}?`)) return;

    setIsPending(true);
    try {
      const result = await approveWriterCredits(orderId);
      if (result.success) {
        alert("Credits approved successfully!");
        router.refresh();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
        isPending 
          ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
          : "bg-[#00B16A] text-white hover:bg-[#009257] active:scale-95 shadow-sm"
      }`}
    >
      {isPending ? "APPROVING..." : "APPROVE CREDITS"}
    </button>
  );
}
