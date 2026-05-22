"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    username: session?.user?.name || "",
    email: session?.user?.email || "",
    phoneNumber: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const userId = (session?.user as { id?: string })?.id;
      if (!userId) return;
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        update();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (data: ChangePasswordInput) => {
    toast.info("Password change would be processed via a dedicated API endpoint.");
    reset();
  };

  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_0_3px_var(--brand-glow)] transition-all duration-150";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="account-page">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="account-title">My Account</h1>
        <p className="text-[var(--text-secondary)] text-sm">Manage your profile and security</p>
      </div>

      {/* Profile Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 md:p-8 flex items-center gap-6 relative overflow-hidden group hover:border-[var(--border-strong)] transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)] rounded-full blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shadow-[0_0_20px_rgba(59, 130, 246,0.3)] shrink-0">
          <span className="text-3xl font-display font-bold text-white">
            {profileData.username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">{profileData.username || "User"}</h2>
          <p className="text-[var(--text-secondary)] mt-1 font-mono">{profileData.email}</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest bg-[var(--bg-overlay)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            {(session?.user as { role?: string })?.role || "Member"}
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden group hover:border-[var(--border-brand)] transition-colors duration-300 relative" data-testid="profile-card">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--brand-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-6 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.01)]">
          <h2 className="text-base font-display font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--brand-primary)]" /> Profile Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="acc-username" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Username</Label>
            <Input id="acc-username" value={profileData.username} onChange={(e) => setProfileData((d) => ({ ...d, username: e.target.value }))} data-testid="account-username" className={inputClasses} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc-email" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Email</Label>
            <Input id="acc-email" type="email" value={profileData.email} onChange={(e) => setProfileData((d) => ({ ...d, email: e.target.value }))} data-testid="account-email" className={inputClasses} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc-phone" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Phone Number</Label>
            <Input id="acc-phone" value={profileData.phoneNumber} onChange={(e) => setProfileData((d) => ({ ...d, phoneNumber: e.target.value }))} data-testid="account-phone" className={inputClasses} />
          </div>
          <div className="pt-2">
            <Button onClick={saveProfile} disabled={profileSaving} data-testid="save-profile-btn" className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:shadow-[0_0_15px_rgba(59, 130, 246,0.3)] hover:-translate-y-0.5 border-none text-white font-medium transition-all duration-300">
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden group hover:border-[var(--border-strong)] transition-colors duration-300 relative" data-testid="password-card">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--text-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-6 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.01)]">
          <h2 className="text-base font-display font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--text-muted)]" /> Change Password
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(changePassword)} className="space-y-4" data-testid="password-form">
            <div className="space-y-1">
              <Label htmlFor="currentPassword" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Current Password</Label>
              <Input id="currentPassword" type="password" data-testid="current-password" {...register("currentPassword")} className={inputClasses} />
              {errors.currentPassword && <p className="text-sm text-[var(--danger)]">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">New Password</Label>
              <Input id="newPassword" type="password" data-testid="new-password" {...register("newPassword")} className={inputClasses} />
              {errors.newPassword && <p className="text-sm text-[var(--danger)]">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" data-testid="confirm-password" {...register("confirmPassword")} className={inputClasses} />
              {errors.confirmPassword && <p className="text-sm text-[var(--danger)]">{errors.confirmPassword.message}</p>}
            </div>
            <div className="pt-2">
              <Button type="submit" variant="outline" disabled={isSubmitting} data-testid="change-password-btn" className="border-[var(--border-default)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
