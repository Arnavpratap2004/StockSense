"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      }}
      richColors
      closeButton
    />
  );
}
