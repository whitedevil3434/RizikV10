"use client";

import { useState } from "react";
import { approveWriterCreditsAction } from "@/lib/actions/order";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface ApproveCreditsButtonProps {
  orderId: string;
  orderCode: string;
}

export default function ApproveCreditsButton({ orderId, orderCode }: ApproveCreditsButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "danger";
    showConfirm: boolean;
  }>({
    title: "Confirm Approval",
    message: `Are you sure you want to approve credits for Order #${orderCode}?`,
    type: "warning",
    showConfirm: true,
  });

  const router = useRouter();

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setModalConfig({
      title: "Confirm Approval",
      message: `Are you sure you want to approve credits for Order #${orderCode}? This will grant the user their purchased writer credits immediately.`,
      type: "warning",
      showConfirm: true,
    });
    setShowModal(true);
  };

  const handleConfirmApproval = async () => {
    if (isPending) return;
    setIsPending(true);

    try {
      const result = await approveWriterCreditsAction(orderId);
      if (result.success) {
        setModalConfig({
          title: "Approved!",
          message: "Credits have been successfully granted to the user account.",
          type: "success",
          showConfirm: false,
        });
        // We keep the modal open to show success, but the user can then close it
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setModalConfig({
          title: "Approval Failed",
          message: result.error || "An error occurred while approving credits.",
          type: "danger",
          showConfirm: false,
        });
      }
    } catch (err) {
      console.error("Approval error:", err);
      setModalConfig({
        title: "Unexpected Error",
        message: "Something went wrong. Please try again or contact support.",
        type: "danger",
        showConfirm: false,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={isPending}
        className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all active:scale-95 shadow-lg border border-white/5 ${
          isPending 
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
            : "bg-emerald-600/90 text-white hover:bg-emerald-500 hover:shadow-emerald-500/20"
        }`}
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            APPROVING...
          </div>
        ) : (
          "APPROVE CREDITS"
        )}
      </button>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => !isPending && setShowModal(false)}
        onConfirm={handleConfirmApproval}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        isPending={isPending}
        confirmText={modalConfig.showConfirm ? "Approve Now" : "Close"}
        // If it's a success/error state, the confirm button just closes it
        {...(!modalConfig.showConfirm && {
          onConfirm: () => setShowModal(false),
          cancelText: ""
        })}
      />
    </>
  );
}
