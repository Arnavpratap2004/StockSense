"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

  const roleBadgeColor: Record<string, string> = { ADMIN: "bg-red-50 text-red-700 border-red-200", MANAGER: "bg-blue-50 text-blue-700 border-blue-200", STAFF: "bg-gray-50 text-gray-700 border-gray-200" };

  if (loading) return <div data-testid="loading-spinner"><TableSkeleton /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="users-title">User Management</h1>
          <p className="text-muted-foreground">{users.length} users</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-[#1E3A5F] hover:bg-[#152C4A]" data-testid="add-user-btn">
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {users.length === 0 ? <EmptyState title="No users" /> : (
        <Card data-testid="users-table-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="users-table">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Username</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition" data-testid={`user-row-${i}`} data-user-id={u.id}>
                    <td className="p-3 font-medium" data-testid={`user-name-${i}`}>{u.username}</td>
                    <td className="p-3 text-muted-foreground" data-testid={`user-email-${i}`}>{u.email}</td>
                    <td className="p-3">
                      <Select value={u.role} onValueChange={(v) => { if (v) updateRole(u.id, v); }}>
                        <SelectTrigger className="w-32 h-8" data-testid={`user-role-${i}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-muted-foreground">{u.phoneNumber || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => setDeleteId(u.id)} data-testid={`delete-user-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-testid="add-user-modal">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} data-testid="new-user-username" /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} data-testid="new-user-email" /></div>
            <div className="space-y-1"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} data-testid="new-user-password" /></div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => { if (v) setForm((f) => ({ ...f, role: v })); }}>
                <SelectTrigger data-testid="new-user-role"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="MANAGER">Manager</SelectItem><SelectItem value="STAFF">Staff</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Phone (optional)</Label><Input value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} data-testid="new-user-phone" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} data-testid="cancel-add-user">Cancel</Button>
            <Button onClick={addUser} disabled={saving} className="bg-[#1E3A5F]" data-testid="confirm-add-user">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete User" description="This action cannot be undone." confirmLabel="Delete" variant="destructive" onConfirm={deleteUser} loading={deleting} />
    </div>
  );
}
