import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";
import { Boxes } from "lucide-react";

export const metadata = {
  title: "Login — StockSense",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E3A5F] via-[#2A4F7F] to-[#1E3A5F] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#2DD4BF] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#2DD4BF] rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white px-12 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Boxes className="w-10 h-10 text-[#2DD4BF]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">StockSense</h1>
          <p className="text-lg text-white/70 mt-3 max-w-md">
            Stock Maintenance System — Track, manage, and optimize your inventory with precision.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-left max-w-sm mx-auto">
            {[
              { label: "Real-time Tracking", value: "24/7" },
              { label: "Smart Alerts", value: "Auto" },
              { label: "Full Reports", value: "PDF/XLS" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-[#2DD4BF]">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md animate-slide-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <Boxes className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <span className="text-xl font-bold text-[#1E3A5F]">StockSense</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="text-muted-foreground mt-1 mb-8">
            Sign in to your account to continue
          </p>
          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

