"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(239,68,68,0.05)] pointer-events-none" />
      <div className="absolute inset-0 grid-dots opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
      
      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--danger)] rounded-full blur-[140px] opacity-20 animate-[orb_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--warning)] rounded-full blur-[140px] opacity-10 animate-[orb_25s_ease-in-out_infinite_reverse]" />

      <div className="text-center space-y-6 animate-fade-in relative z-10 glass-strong p-12 rounded-3xl border border-[rgba(239,68,68,0.2)] shadow-[0_0_40px_rgba(239,68,68,0.1)] max-w-md w-full mx-4">
        <div className="mx-auto w-24 h-24 rounded-2xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center shadow-glow animate-[float_6s_ease-in-out_infinite]">
          <AlertTriangle className="w-12 h-12 text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">Something went wrong</h1>
          <p className="text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button 
          onClick={() => reset()}
          className="w-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] hover:brightness-110 text-white border-none shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
