"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <div className="flex items-center justify-center py-20" data-testid="loading-spinner"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }
  if (!item) {
    return <div className="text-center py-20" data-testid="item-not-found"><p className="text-muted-foreground">Stock item not found</p></div>;
  }

  const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
  const statusFlow = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "BACKORDERED"];
  const paginatedTx = item.transactions.slice((txPage - 1) * txPerPage, txPage * txPerPage);
  const txTotalPages = Math.ceil(item.transactions.length / txPerPage);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="stock-detail-page">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" data-testid="detail-item-name">{item.name}</h1>
          <p className="text-muted-foreground font-mono" data-testid="detail-sku">{item.sku}</p>
        </div>
        {["ADMIN", "MANAGER"].includes(userRole) && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)} data-testid="edit-btn">
            <Edit2 className="w-4 h-4 mr-1" /> Edit
          </Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button onClick={saveEdit} disabled={saving} className="bg-[#1E3A5F]" data-testid="save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} data-testid="cancel-edit-btn">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <Card className="lg:col-span-2" data-testid="item-details-card">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {statusConf && (
                  <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} border mt-1`} data-testid="detail-status">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor} mr-1.5`} />
                    {statusConf.label}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-2xl font-bold" data-testid="detail-quantity">{item.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                {editing ? (
                  <Input type="number" value={editData.pricePerUnit} onChange={(e) => setEditData((d) => ({ ...d, pricePerUnit: Number(e.target.value) }))} data-testid="edit-price" />
                ) : (
                  <p className="text-lg font-semibold" data-testid="detail-price">{formatCurrency(item.pricePerUnit)}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Point</p>
                {editing ? (
                  <Input type="number" value={editData.reorderPoint} onChange={(e) => setEditData((d) => ({ ...d, reorderPoint: Number(e.target.value) }))} data-testid="edit-reorder" />
                ) : (
                  <p className="text-lg font-semibold" data-testid="detail-reorder">{item.reorderPoint}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              {editing ? (
                <Input value={editData.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} data-testid="edit-name" />
              ) : (
                <p className="font-medium">{item.name}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              {editing ? (
                <Input value={editData.description} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} data-testid="edit-description" />
              ) : (
                <p>{item.description || "No description"}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Category</p><p className="font-medium" data-testid="detail-category">{item.category?.name || "—"}</p></div>
              <div><p className="text-sm text-muted-foreground">Supplier</p><p className="font-medium" data-testid="detail-supplier">{item.supplier?.name || "—"}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Status Flow */}
        <Card data-testid="status-flow-card">
          <CardHeader><CardTitle className="text-sm">Status Flow</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {statusFlow.map((s, i) => {
              const conf = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
              const isCurrent = item.status === s;
              return (
                <div key={s} data-testid={`flow-${s}`}>
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${isCurrent ? conf.bgColor + " border" : "bg-muted/30"}`}>
                    <span className={`w-3 h-3 rounded-full ${isCurrent ? conf.dotColor : "bg-gray-300"}`} />
                    <span className={`text-sm ${isCurrent ? "font-semibold " + conf.color : "text-muted-foreground"}`}>{conf.label}</span>
                  </div>
                  {i < statusFlow.length - 1 && <div className="ml-1.5 h-4 w-0.5 bg-border ml-3.5" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card data-testid="transaction-history-card">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {item.transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" data-testid="no-transactions">No transactions yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="detail-transactions-table">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Change</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Prev</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">New</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTx.map((tx, i) => {
                      const ac = ACTION_TYPE_CONFIG[tx.actionType];
                      return (
                        <tr key={tx.id} className="border-b last:border-0" data-testid={`detail-tx-row-${i}`}>
                          <td className="p-3 text-xs">{formatDate(tx.timestamp)}</td>
                          <td className="p-3"><Badge variant="outline" className={`${ac?.bgColor} ${ac?.color} text-xs`}>{ac?.label || tx.actionType}</Badge></td>
                          <td className={`p-3 text-right font-medium ${tx.quantityChanged >= 0 ? "text-emerald-600" : "text-red-600"}`}>{tx.quantityChanged > 0 ? "+" : ""}{tx.quantityChanged}</td>
                          <td className="p-3 text-right text-muted-foreground">{tx.previousQty}</td>
                          <td className="p-3 text-right font-medium">{tx.newQty}</td>
                          <td className="p-3">{tx.user.username}</td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{tx.details || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {txTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4" data-testid="detail-tx-pagination">
                  <span className="text-sm text-muted-foreground">Page {txPage} of {txTotalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={txPage <= 1} onClick={() => setTxPage(txPage - 1)} data-testid="detail-tx-prev"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={txPage >= txTotalPages} onClick={() => setTxPage(txPage + 1)} data-testid="detail-tx-next"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
