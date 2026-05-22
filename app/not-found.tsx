import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--brand-glow)] pointer-events-none" />
      <div className="absolute inset-0 grid-dots opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
      
      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-[140px] opacity-15 animate-[orb_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--brand-secondary)] rounded-full blur-[140px] opacity-15 animate-[orb_25s_ease-in-out_infinite_reverse]" />

      <div className="text-center space-y-6 animate-fade-in relative z-10 glass-strong p-12 rounded-3xl border border-[var(--border-strong)] shadow-[0_0_40px_rgba(59, 130, 246,0.1)] max-w-md w-full mx-4">
        <div className="mx-auto w-24 h-24 rounded-2xl bg-[var(--brand-glow)] border border-[var(--border-brand)] flex items-center justify-center shadow-glow animate-[float_6s_ease-in-out_infinite]">
          <FileQuestion className="w-12 h-12 text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(59, 130, 246,0.5)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[120px] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-muted)] to-transparent leading-none select-none tracking-tighter opacity-50">404</h1>
          <p className="text-lg text-[var(--text-secondary)] mt-2">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className={cn(buttonVariants({ variant: "outline" }), "w-full border-[var(--border-brand)] text-[var(--brand-primary)] hover:bg-[var(--brand-glow)] transition-all duration-300")}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
