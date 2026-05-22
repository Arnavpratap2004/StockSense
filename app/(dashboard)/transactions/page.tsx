"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
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
  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]";

  return (
    <div className="space-y-6 animate-fade-in" data-testid="transactions-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="transactions-title">Transactions</h1>
          <p className="text-[var(--text-secondary)] text-sm">Complete transaction history</p>
        </div>
        <Button variant="outline" onClick={exportCSV} data-testid="export-csv-btn" className="border-[var(--border-default)] group hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all duration-300">
          <Download className="w-4 h-4 mr-1 group-hover:animate-bounce transition-colors" /> Export CSV
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4" data-testid="transaction-filters">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input placeholder="Search by SKU..." className={`pl-10 h-9 ${inputClasses}`} value={skuSearch} onChange={(e) => { setSkuSearch(e.target.value); setPage(1); }} data-testid="transaction-search" />
          </div>
          <Select value={actionType} onValueChange={(v) => { setActionType(v ?? ""); setPage(1); }}>
            <SelectTrigger className={`w-full md:w-48 h-9 ${inputClasses}`} data-testid="transaction-action-filter"><SelectValue placeholder="All Actions" /></SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map((a) => (<SelectItem key={a} value={a}>{ACTION_TYPE_CONFIG[a]?.label || a}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`w-full md:w-40 h-9 ${inputClasses}`} data-testid="transaction-start-date" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`w-full md:w-40 h-9 ${inputClasses}`} data-testid="transaction-end-date" />
        </div>
      </div>

      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton rows={10} cols={8} /></div>
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions found" description="Try adjusting your filters." />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden" data-testid="transactions-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="transactions-table">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Timestamp</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">SKU</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Item</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Action</th>
                    <th className="text-right p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Change</th>
                    <th className="text-right p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Prev→New</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">User</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Details</th>
                  </tr>
                </thead>
                <tbody className="animate-stagger-in">
                  {transactions.map((t, i) => {
                    const ac = ACTION_TYPE_CONFIG[t.actionType];
                    const isPositive = t.quantityChanged >= 0;
                    return (
                      <tr key={t.id} className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 relative" data-testid={`tx-row-${i}`}>
                        <td className="p-3 text-xs font-mono whitespace-nowrap text-[var(--text-secondary)] relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                          <span className="pl-2">{formatDate(t.timestamp)}</span>
                        </td>
                        <td className="p-3 font-mono text-[13px] text-[var(--brand-primary)]" data-testid={`tx-sku-${i}`}>{t.stockItem.sku}</td>
                        <td className="p-3 font-medium text-[var(--text-primary)] group-hover/row:text-[var(--brand-primary)] transition-colors">{t.stockItem.name}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={cn(ac?.bgColor, ac?.color, "text-xs rounded-full border border-[currentColor] border-opacity-20 shadow-sm transition-transform duration-300")} data-testid={`tx-action-${i}`}>
                            {ac?.icon && <span className="mr-1 group-hover/row:animate-pulse">{ac.icon}</span>}
                            {ac?.label || t.actionType}
                          </Badge>
                        </td>
                        <td className={cn("p-3 text-right font-mono font-medium flex items-center justify-end gap-1", isPositive ? "text-[#22C55E]" : "text-[#EF4444]")} data-testid={`tx-change-${i}`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 transition-transform" /> : <ArrowDownRight className="w-3 h-3 group-hover/row:translate-y-0.5 group-hover/row:translate-x-0.5 transition-transform" />}
                          {isPositive ? "+" : ""}{t.quantityChanged}
                        </td>
                        <td className="p-3 text-right font-mono text-[var(--text-muted)]">{t.previousQty}→{t.newQty}</td>
                        <td className="p-3 text-[var(--text-secondary)]">{t.user.username}</td>
                        <td className="p-3 text-[var(--text-muted)] text-xs max-w-[200px] truncate">{t.details || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between" data-testid="transactions-pagination">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className={`w-20 h-8 text-xs ${inputClasses}`} data-testid="tx-page-size"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]"><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="tx-page-prev"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="tx-page-next"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
