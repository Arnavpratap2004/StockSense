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
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 animate-scale-in"
          data-testid="login-error"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="admin@stocksense.com"
            className="pl-10 h-11"
            data-testid="login-email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500" data-testid="login-email-error">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 h-11"
            data-testid="login-password"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            onClick={() => setShowPassword(!showPassword)}
            data-testid="toggle-password"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500" data-testid="login-password-error">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-[#1E3A5F] hover:bg-[#152C4A] text-white font-medium"
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

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">Demo Credentials</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { role: "Admin", email: "Arnav@stocksense.com", pass: "Admin@123" },
            { role: "Manager", email: "manager@stocksense.com", pass: "Manager@123" },
            { role: "Staff", email: "staff@stocksense.com", pass: "Staff@123" },
          ].map((demo) => (
            <button
              key={demo.role}
              type="button"
              className="text-xs border rounded-lg py-2 px-1 hover:bg-muted transition text-center"
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
              <span className="font-medium">{demo.role}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
