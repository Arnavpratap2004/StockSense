"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="login-form">
      {error && (
        <div
          className="bg-[var(--danger-bg)] border-l-4 border-l-[var(--danger)] border-[rgba(239,68,68,0.3)] text-[var(--danger)] text-sm rounded-lg px-4 py-3 animate-slide-in shadow-lg"
          data-testid="login-error"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
          Email
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors duration-300" />
          <Input
            id="email"
            type="email"
            placeholder="admin@stocksense.com"
            className="pl-10 h-11 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_12px_rgba(59, 130, 246,0.2)] transition-all duration-300"
            data-testid="login-email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-[var(--danger)]" data-testid="login-email-error">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors duration-300" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 h-11 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_12px_rgba(59, 130, 246,0.2)] transition-all duration-300"
            data-testid="login-password"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            data-testid="toggle-password"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-[var(--danger)]" data-testid="login-password-error">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:brightness-110 text-[var(--text-inverse)] font-bold text-sm shadow-[0_0_15px_rgba(59, 130, 246,0.3)] hover:shadow-[0_0_25px_rgba(59, 130, 246,0.5)] hover:-translate-y-0.5 transition-all duration-300"
        disabled={isSubmitting}
        data-testid="login-btn"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" data-testid="loading-spinner" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-muted)] text-center mb-3">Demo Credentials</p>
        <div className="grid grid-cols-3 gap-2">
            {[
              { role: "Admin", email: "admin@stocksense.com", pass: "Admin@123", color: "bg-[#22C55E]" },
              { role: "Manager", email: "manager@stocksense.com", pass: "Manager@123", color: "bg-[#3B82F6]" },
              { role: "Staff", email: "staff@stocksense.com", pass: "Staff@123", color: "bg-[#8B92A5]" },
            ].map((demo) => (
              <button
                key={demo.role}
                type="button"
                className="group relative text-xs border border-[var(--border-default)] rounded-lg py-2 px-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-overlay)] hover:border-[var(--border-brand)] hover:shadow-glow hover:-translate-y-1 transition-all duration-300 text-center text-[var(--text-secondary)] overflow-hidden"
                data-testid={`demo-${demo.role.toLowerCase()}-btn`}
                onClick={() => {
                  const emailInput = document.getElementById("email") as HTMLInputElement;
                  const passwordInput = document.getElementById("password") as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLInputElement.prototype, 'value'
                    )?.set;
                    nativeInputValueSetter?.call(emailInput, demo.email);
                    nativeInputValueSetter?.call(passwordInput, demo.pass);
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
              >
                <div className={`absolute top-0 left-0 w-full h-[2px] ${demo.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <span className="font-medium text-[var(--text-primary)] relative z-10">{demo.role}</span>
              </button>
          ))}
        </div>
      </div>
    </form>
  );
}
