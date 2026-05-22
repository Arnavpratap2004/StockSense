"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";

interface User {
  id: string; username: string; email: string; role: string; phoneNumber: string | null; createdAt: string;
}

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-[var(--brand-glow)] text-[var(--brand-primary)] border-[var(--border-brand)]",
  MANAGER: "bg-[var(--info-bg)] text-[var(--info)] border-[rgba(59,130,246,0.2)]",
  STAFF: "bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-default)]",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "STAFF", phoneNumber: "" });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast.success("User created"); setAddOpen(false); setForm({ username: "", email: "", password: "", role: "STAFF", phoneNumber: "" }); fetchUsers(); }
      else toast.error(data.error);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await res.json();
      if (data.success) { toast.success("Role updated"); fetchUsers(); }
      else toast.error(data.error);
    } catch { toast.error("Failed"); }
  };

  const deleteUser = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("User deleted"); setDeleteId(null); fetchUsers(); }
      else toast.error(data.error);
    } catch { toast.error("Failed"); } finally { setDeleting(false); }
  };

  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_0_3px_var(--brand-glow)]";

  if (loading) return <div data-testid="loading-spinner"><TableSkeleton /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="users-title">User Management</h1>
          <p className="text-[var(--text-secondary)] text-sm">{users.length} users</p>
        </div>
        <Button onClick={() => setAddOpen(true)} data-testid="add-user-btn" className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:shadow-[0_0_15px_rgba(59, 130, 246,0.3)] hover:-translate-y-0.5 border-none text-white transition-all duration-300">
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {users.length === 0 ? <EmptyState title="No users" /> : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden" data-testid="users-table-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="users-table">
              <thead>
                <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                  <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Username</th>
                  <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Email</th>
                  <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Role</th>
                  <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Phone</th>
                  <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Created</th>
                  <th className="text-center p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody className="animate-stagger-in">
                {users.map((u, i) => (
                  <tr key={u.id} className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 relative" data-testid={`user-row-${i}`} data-user-id={u.id}>
                    <td className="p-3 font-medium text-[var(--text-primary)] relative" data-testid={`user-name-${i}`}>
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                      <span className="pl-2 group-hover/row:text-[var(--brand-primary)] transition-colors">{u.username}</span>
                    </td>
                    <td className="p-3 text-[var(--text-secondary)]" data-testid={`user-email-${i}`}>{u.email}</td>
                    <td className="p-3">
                      <Select value={u.role} onValueChange={(v) => { if (v) updateRole(u.id, v); }}>
                        <SelectTrigger className="w-32 h-8 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" data-testid={`user-role-${i}`}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-[var(--text-secondary)]">{u.phoneNumber || "—"}</td>
                    <td className="p-3 text-[var(--text-muted)] text-xs font-mono">{formatDate(u.createdAt)}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--danger)] hover:bg-[var(--danger-bg)]" onClick={() => setDeleteId(u.id)} data-testid={`delete-user-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]" data-testid="add-user-modal">
          <DialogHeader><DialogTitle className="text-[var(--text-primary)] font-display">Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Username</Label><Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} data-testid="new-user-username" className={inputClasses} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} data-testid="new-user-email" className={inputClasses} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Password</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} data-testid="new-user-password" className={inputClasses} /></div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Role</Label>
              <Select value={form.role} onValueChange={(v) => { if (v) setForm((f) => ({ ...f, role: v })); }}>
                <SelectTrigger data-testid="new-user-role" className={inputClasses}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]"><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="MANAGER">Manager</SelectItem><SelectItem value="STAFF">Staff</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Phone (optional)</Label><Input value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} data-testid="new-user-phone" className={inputClasses} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} data-testid="cancel-add-user" className="border-[var(--border-default)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors">Cancel</Button>
            <Button onClick={addUser} disabled={saving} data-testid="confirm-add-user" className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:shadow-[0_0_15px_rgba(59, 130, 246,0.3)] hover:-translate-y-0.5 border-none text-white transition-all duration-300">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete User" description="This action cannot be undone." confirmLabel="Delete" variant="destructive" onConfirm={deleteUser} loading={deleting} />
    </div>
  );
}
