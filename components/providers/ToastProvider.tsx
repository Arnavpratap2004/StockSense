"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-strong)",
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-lg)",
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          fontSize: "14px",
        },
        classNames: {
          success: "[&]:border-l-[3px] [&]:border-l-[#22C55E]",
          error: "[&]:border-l-[3px] [&]:border-l-[#EF4444]",
          warning: "[&]:border-l-[3px] [&]:border-l-[#F59E0B]",
          info: "[&]:border-l-[3px] [&]:border-l-[#3B82F6]",
        },
      }}
      richColors={false}
      closeButton
      duration={4000}
    />
  );
}
