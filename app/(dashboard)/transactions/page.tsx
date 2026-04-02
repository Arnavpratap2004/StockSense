"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { ACTION_TYPE_CONFIG } from "@/lib/utils/stock-status";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";

interface Transaction {
  id: string; timestamp: string; actionType: string; quantityChanged: number;
  previousQty: number; newQty: number; details: string | null;
  user: { id: string; username: string }; stockItem: { sku: string; name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [skuSearch, setSkuSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSku = useDebounce(skuSearch, 300);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedSku) params.set("sku", debouncedSku);
    if (actionType && actionType !== "all") params.set("actionType", actionType);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSku, actionType, startDate, endDate]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const exportCSV = () => {
    const headers = ["ID", "Timestamp", "SKU", "Item", "Action", "Qty Change", "Prev", "New", "User", "Details"];
    const rows = transactions.map((t) => [t.id, t.timestamp, t.stockItem.sku, t.stockItem.name, t.actionType, t.quantityChanged, t.previousQty, t.newQty, t.user.username, t.details || ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  const actionTypes = ["SALE", "RESTOCK", "RETURN", "ADJUSTMENT", "RESERVATION", "DAMAGE_WRITE_OFF"];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="transactions-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="transactions-title">Transactions</h1>
          <p className="text-muted-foreground">Complete transaction history</p>
        </div>
        <Button variant="outline" onClick={exportCSV} data-testid="export-csv-btn">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <Card data-testid="transaction-filters">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by SKU..." className="pl-10" value={skuSearch} onChange={(e) => { setSkuSearch(e.target.value); setPage(1); }} data-testid="transaction-search" />
            </div>
            <Select value={actionType} onValueChange={(v) => { setActionType(v ?? ""); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48" data-testid="transaction-action-filter"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((a) => (<SelectItem key={a} value={a}>{ACTION_TYPE_CONFIG[a]?.label || a}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-40" data-testid="transaction-start-date" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-40" data-testid="transaction-end-date" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton rows={10} cols={8} /></div>
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions found" description="Try adjusting your filters." />
      ) : (
        <>
          <Card data-testid="transactions-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="transactions-table">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Change</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Prev→New</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => {
                    const ac = ACTION_TYPE_CONFIG[t.actionType];
                    return (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition" data-testid={`tx-row-${i}`}>
                        <td className="p-3 text-xs whitespace-nowrap">{formatDate(t.timestamp)}</td>
                        <td className="p-3 font-mono text-xs" data-testid={`tx-sku-${i}`}>{t.stockItem.sku}</td>
                        <td className="p-3 font-medium">{t.stockItem.name}</td>
                        <td className="p-3"><Badge variant="outline" className={`${ac?.bgColor} ${ac?.color} text-xs`} data-testid={`tx-action-${i}`}>{ac?.label || t.actionType}</Badge></td>
                        <td className={`p-3 text-right font-medium ${t.quantityChanged >= 0 ? "text-emerald-600" : "text-red-600"}`} data-testid={`tx-change-${i}`}>{t.quantityChanged > 0 ? "+" : ""}{t.quantityChanged}</td>
                        <td className="p-3 text-right text-muted-foreground">{t.previousQty}→{t.newQty}</td>
                        <td className="p-3">{t.user.username}</td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{t.details || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center justify-between" data-testid="transactions-pagination">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-20 h-8" data-testid="tx-page-size"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="tx-page-prev"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="tx-page-next"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
