"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useToast } from "@/providers/StoreProvider";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-20 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={cn(
            "anim-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-[#E2E8EA] bg-white px-4 py-3 text-left shadow-lg shadow-[#16339B]/10",
            "border-l-4",
            toast.type === "success" && "border-l-[#16A34A]",
            toast.type === "error" && "border-l-[#DC2626]",
            toast.type === "info" && "border-l-[#1D4ED8]",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
          ) : toast.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1D4ED8]" />
          )}
          <span className="text-sm font-medium text-[#17242A]">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
