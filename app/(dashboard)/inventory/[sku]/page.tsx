"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit2, Save, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { STATUS_CONFIG, ACTION_TYPE_CONFIG } from "@/lib/utils/stock-status";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StockDetail {
  sku: string;
  name: string;
  description: string | null;
  pricePerUnit: number;
  quantity: number;
  reorderPoint: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string; contactInfo?: string } | null;
  transactions: Array<{
    id: string;
    timestamp: string;
    actionType: string;
    quantityChanged: number;
    previousQty: number;
    newQty: number;
    details: string | null;
    user: { id: string; username: string; email: string };
  }>;
}

export default function StockDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = use(params);
  const [item, setItem] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "", pricePerUnit: 0, reorderPoint: 0 });
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 10;
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stock/${sku}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItem(data.data);
          setEditData({
            name: data.data.name,
            description: data.data.description || "",
            pricePerUnit: data.data.pricePerUnit,
            reorderPoint: data.data.reorderPoint,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sku]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stock/${sku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item updated");
        setItem((prev) => prev ? { ...prev, ...editData } : prev);
        setEditing(false);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20" data-testid="loading-spinner"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" /></div>;
  }
  if (!item) {
    return <div className="text-center py-20" data-testid="item-not-found"><p className="text-[var(--text-muted)]">Stock item not found</p></div>;
  }

  const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
  const statusFlow = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "BACKORDERED"];
  const paginatedTx = item.transactions.slice((txPage - 1) * txPerPage, txPage * txPerPage);
  const txTotalPages = Math.ceil(item.transactions.length / txPerPage);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="stock-detail-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg-overlay)] transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-mono text-[var(--brand-primary)]" data-testid="detail-sku">{item.sku}</p>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] truncate" data-testid="detail-item-name">{item.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {statusConf && (
            <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} border text-xs rounded-full px-3 py-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor} mr-1.5 inline-block`} />
              {statusConf.label}
            </Badge>
          )}
          {item.supplier && (
            <span className="text-xs px-2 py-1 rounded-md bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {item.supplier.name}
            </span>
          )}
        </div>
        {["ADMIN", "MANAGER"].includes(userRole) && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)} data-testid="edit-btn" className="border-[var(--border-default)]">
            <Edit2 className="w-4 h-4 mr-1" /> Edit
          </Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button onClick={saveEdit} disabled={saving} data-testid="save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} data-testid="cancel-edit-btn" className="border-[var(--border-default)]">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6" data-testid="item-details-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Status</p>
              {statusConf && (
                <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} border`} data-testid="detail-status">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor} mr-1.5 inline-block`} />
                  {statusConf.label}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Quantity</p>
              <p className="text-[28px] font-mono font-bold text-[var(--text-primary)] leading-none" data-testid="detail-quantity">{item.quantity}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Price</p>
              {editing ? (
                <Input type="number" value={editData.pricePerUnit} onChange={(e) => setEditData((d) => ({ ...d, pricePerUnit: Number(e.target.value) }))} data-testid="edit-price" className="bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" />
              ) : (
                <p className="text-xl font-mono font-semibold text-[var(--text-primary)]" data-testid="detail-price">{formatCurrency(item.pricePerUnit)}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Reorder Point</p>
              {editing ? (
                <Input type="number" value={editData.reorderPoint} onChange={(e) => setEditData((d) => ({ ...d, reorderPoint: Number(e.target.value) }))} data-testid="edit-reorder" className="bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" />
              ) : (
                <p className="text-xl font-mono font-semibold text-[var(--text-primary)]" data-testid="detail-reorder">{item.reorderPoint}</p>
              )}
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Name</p>
            {editing ? (
              <Input value={editData.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} data-testid="edit-name" className="bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" />
            ) : (
              <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Description</p>
            {editing ? (
              <Input value={editData.description} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} data-testid="edit-description" className="bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" />
            ) : (
              <p className="text-[var(--text-secondary)]">{item.description || "No description"}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Category</p><p className="font-medium text-[var(--text-primary)]" data-testid="detail-category">{item.category?.name || "—"}</p></div>
            <div><p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Supplier</p><p className="font-medium text-[var(--text-primary)]" data-testid="detail-supplier">{item.supplier?.name || "—"}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-4">
            <div><p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Created</p><p className="text-sm font-mono text-[var(--text-secondary)]">{formatDate(item.createdAt)}</p></div>
            <div><p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Updated</p><p className="text-sm font-mono text-[var(--text-secondary)]">{formatDate(item.updatedAt)}</p></div>
          </div>
        </div>

        {/* Status Flow */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6" data-testid="status-flow-card">
          <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-4">Status Flow</h3>
          <div className="space-y-2">
            {statusFlow.map((s, i) => {
              const conf = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
              const isCurrent = item.status === s;
              return (
                <div key={s} data-testid={`flow-${s}`}>
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition ${isCurrent ? `${conf.bgColor} border` : "bg-[var(--bg-elevated)]"}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${isCurrent ? conf.dotColor : "bg-[var(--text-muted)] opacity-30"}`} />
                    <span className={`text-sm ${isCurrent ? "font-semibold " + conf.color : "text-[var(--text-muted)]"}`}>{conf.label}</span>
                  </div>
                  {i < statusFlow.length - 1 && <div className="ml-[18px] h-4 w-0.5 bg-[var(--border-subtle)]" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl" data-testid="transaction-history-card">
        <div className="p-6 pb-0">
          <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">Transaction History</h3>
        </div>
        <div className="p-6 pt-4">
          {item.transactions.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8" data-testid="no-transactions">No transactions yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="detail-transactions-table">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Time</th>
                      <th className="text-left pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Action</th>
                      <th className="text-right pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Change</th>
                      <th className="text-right pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Prev</th>
                      <th className="text-right pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">New</th>
                      <th className="text-left pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">User</th>
                      <th className="text-left pb-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTx.map((tx, i) => {
                      const ac = ACTION_TYPE_CONFIG[tx.actionType];
                      return (
                        <tr key={tx.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-100" data-testid={`detail-tx-row-${i}`}>
                          <td className="py-3 pr-3 text-xs font-mono text-[var(--text-secondary)]">{formatDate(tx.timestamp)}</td>
                          <td className="py-3">
                            <Badge variant="outline" className={`${ac?.bgColor} ${ac?.color} text-xs rounded-full`}>
                              {ac?.icon && <span className="mr-1">{ac.icon}</span>}
                              {ac?.label || tx.actionType}
                            </Badge>
                          </td>
                          <td className={`py-3 text-right font-mono font-medium ${tx.quantityChanged >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{tx.quantityChanged > 0 ? "+" : ""}{tx.quantityChanged}</td>
                          <td className="py-3 text-right font-mono text-[var(--text-muted)]">{tx.previousQty}</td>
                          <td className="py-3 text-right font-mono font-medium text-[var(--text-primary)]">{tx.newQty}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{tx.user.username}</td>
                          <td className="py-3 text-[var(--text-muted)] text-xs max-w-[200px] truncate">{tx.details || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {txTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4" data-testid="detail-tx-pagination">
                  <span className="text-sm text-[var(--text-muted)]">Page {txPage} of {txTotalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={txPage <= 1} onClick={() => setTxPage(txPage - 1)} data-testid="detail-tx-prev"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={txPage >= txTotalPages} onClick={() => setTxPage(txPage + 1)} data-testid="detail-tx-next"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
