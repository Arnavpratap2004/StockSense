"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="account-page">
      <div>
        <h1 className="text-2xl font-bold" data-testid="account-title">My Account</h1>
        <p className="text-muted-foreground">Manage your profile and security</p>
      </div>

      {/* Profile */}
      <Card data-testid="profile-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="acc-username">Username</Label>
            <Input id="acc-username" value={profileData.username} onChange={(e) => setProfileData((d) => ({ ...d, username: e.target.value }))} data-testid="account-username" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc-email">Email</Label>
            <Input id="acc-email" type="email" value={profileData.email} onChange={(e) => setProfileData((d) => ({ ...d, email: e.target.value }))} data-testid="account-email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc-phone">Phone Number</Label>
            <Input id="acc-phone" value={profileData.phoneNumber} onChange={(e) => setProfileData((d) => ({ ...d, phoneNumber: e.target.value }))} data-testid="account-phone" />
          </div>
          <Button onClick={saveProfile} disabled={profileSaving} className="bg-[#1E3A5F] hover:bg-[#152C4A]" data-testid="save-profile-btn">
            {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card data-testid="password-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(changePassword)} className="space-y-4" data-testid="password-form">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" data-testid="current-password" {...register("currentPassword")} />
              {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" data-testid="new-password" {...register("newPassword")} />
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" data-testid="confirm-password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" variant="outline" disabled={isSubmitting} data-testid="change-password-btn">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
