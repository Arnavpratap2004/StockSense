import Link from "next/link";
import { ShieldX } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(239,68,68,0.05)] pointer-events-none" />
      <div className="absolute inset-0 grid-dots opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
      
      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--danger)] rounded-full blur-[140px] opacity-15 animate-[orb_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--danger)] rounded-full blur-[140px] opacity-10 animate-[orb_25s_ease-in-out_infinite_reverse]" />

      <div className="text-center space-y-6 animate-fade-in relative z-10 glass-strong p-12 rounded-3xl border border-[rgba(239,68,68,0.2)] shadow-[0_0_40px_rgba(239,68,68,0.1)] max-w-md w-full mx-4">
        <div className="mx-auto w-24 h-24 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-[float_6s_ease-in-out_infinite]">
          <ShieldX className="w-12 h-12 text-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[120px] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[rgba(239,68,68,0.4)] to-transparent leading-none select-none tracking-tighter opacity-50">403</h1>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Access Denied</h2>
          <p className="text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
            You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className={cn(buttonVariants({ variant: "outline" }), "w-full border-[rgba(239,68,68,0.3)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-300")}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
