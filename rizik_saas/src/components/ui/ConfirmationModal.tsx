"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "success" | "warning" | "danger";
  isPending?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isPending = false,
}) => {
  const icons = {
    info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
    success: <CheckCircleIcon className="h-6 w-6 text-emerald-400" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" />,
    danger: <ExclamationTriangleIcon className="h-6 w-6 text-rose-400" />,
  };

  const colors = {
    info: "border-blue-500/20 bg-blue-500/10",
    success: "border-emerald-500/20 bg-emerald-500/10",
    warning: "border-amber-500/20 bg-amber-500/10",
    danger: "border-rose-500/20 bg-rose-500/10",
  };

  const buttonColors = {
    info: "bg-blue-600 hover:bg-blue-500 text-white",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
    warning: "bg-amber-600 hover:bg-amber-500 text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl pointer-events-auto"
            >
              {/* Header / Icon Area */}
              <div className={`flex items-center gap-4 p-6 ${colors[type]} border-b border-white/5`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950/50 shadow-inner">
                  {icons[type]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-8">
                <p className="text-zinc-400 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-950/50 border-t border-white/5">
                <button
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isPending}
                  className={`
                    flex items-center justify-center gap-2 rounded-xl px-6 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50
                    ${buttonColors[type]}
                  `}
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
