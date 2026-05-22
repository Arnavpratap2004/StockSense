import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";
import { Boxes } from "lucide-react";

export const metadata = {
  title: "Login — StockSense",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden items-center justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C0F] via-[#0A0C0F] to-[#0a1f18] animate-gradient-shift" />
        
        {/* Animated grid dots background */}
        <div className="absolute inset-0 grid-dots opacity-40 animate-[pulse_8s_ease-in-out_infinite]" />

        {/* Ambient glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-10 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-[140px] opacity-20 animate-[orb_15s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 -right-10 w-[500px] h-[500px] bg-[var(--brand-secondary)] rounded-full blur-[160px] opacity-10 animate-[orb_20s_ease-in-out_infinite_reverse]" />
        </div>
        
        {/* CSS Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => {
            // Deterministic pseudo-random values based on index
            const left = (i * 13) % 100;
            const top = (i * 27) % 100;
            const duration = (i % 10) + 10;
            const delay = (i % 10);
            
            return (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float-up" 
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `-${delay}s`,
                }} 
              />
            );
          })}
        </div>

        <div className="relative text-center px-12 animate-fade-in z-10">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-[var(--border-strong)] shadow-glow animate-[float_6s_ease-in-out_infinite]">
            <Boxes className="w-10 h-10 text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(59, 130, 246,0.5)]" />
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight gradient-text">
            StockSense
          </h1>
          <div className="h-8 mt-3 flex items-center justify-center">
            <p className="text-lg text-[var(--text-secondary)] font-mono overflow-hidden whitespace-nowrap animate-[typewriter_2s_steps(40,end)] border-r-2 border-[var(--brand-primary)] pr-1" style={{ animationFillMode: "forwards" }}>
              Precision Inventory. Zero Guesswork.
            </p>
          </div>

          <div className="mt-12 flex gap-3 justify-center animate-stagger-in">
            {[
              { label: "Real-time Sync", icon: "⚡", delay: "0.2s" },
              { label: "Role-based Access", icon: "🔐", delay: "0.4s" },
              { label: "Audit Trail", icon: "📋", delay: "0.6s" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="bg-[rgba(17,19,24,0.6)] backdrop-blur-sm border border-[var(--border-subtle)] rounded-full px-4 py-2 flex items-center gap-2 text-sm hover:-translate-y-1 hover:border-[var(--border-brand)] hover:shadow-glow transition-all duration-300 cursor-default shadow-lg"
                style={{ animationDelay: chip.delay }}
              >
                <span className="drop-shadow-md">{chip.icon}</span>
                <span className="text-[var(--text-secondary)] font-medium">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle radial gradient focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59, 130, 246,0.03)_0%,transparent_50%)] pointer-events-none" />
        
        {/* Brand watermark */}
        <div className="absolute bottom-[-10%] right-[-5%] text-[300px] font-display font-black text-[var(--text-primary)] opacity-[0.02] pointer-events-none select-none leading-none rotate-[-5deg]">
          SS
        </div>
        <div className="w-full max-w-md animate-slide-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
              <Boxes className="w-5 h-5 text-[var(--text-inverse)]" />
            </div>
            <span className="text-xl font-display font-bold text-[var(--brand-primary)]">StockSense</span>
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text">Welcome back</h2>
          <p className="text-[var(--text-secondary)] mt-1 mb-8">
            Sign in to your StockSense account
          </p>
          <Suspense fallback={<div className="h-64 rounded-lg animate-shimmer" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
