"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, QrCode, Minus, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/utils/stock-status";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

interface StockItem {
  sku: string;
  name: string;
  description: string | null;
  pricePerUnit: number;
  quantity: number;
  reorderPoint: number;
  status: string;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [adjustingQty, setAdjustingQty] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/stock?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  const adjustQuantity = async (sku: string, change: number) => {
    setAdjustingQty(sku);
    try {
      const res = await fetch(`/api/stock/${sku}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantityChange: change,
          actionType: change > 0 ? "RESTOCK" : "SALE",
          details: `Quick ${change > 0 ? "restock" : "sale"} from inventory page`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Quantity updated for ${sku}`);
        fetchItems();
      } else {
        toast.error(data.error || "Failed to update quantity");
      }
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setAdjustingQty(null);
    }
  };

  const getQtyColor = (item: StockItem) => {
    if (item.quantity === 0) return "text-[var(--danger)]";
    if (item.quantity <= item.reorderPoint) return "text-[var(--warning)]";
    return "text-[var(--text-primary)]";
  };

  const statusOptions = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "RESERVED", "BACKORDERED", "DAMAGED"];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="inventory-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="inventory-title">Inventory</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--brand-glow)] text-[var(--brand-primary)] border border-[var(--border-brand)] shadow-[0_0_8px_var(--brand-glow)] transition-all">
            {totalItems} items
          </span>
        </div>
        {["ADMIN", "MANAGER"].includes(userRole) && (
          <Link href="/inventory/new" className={buttonVariants()} data-testid="add-stock-btn">
            <Plus className="w-4 h-4 mr-1" /> Add New Stock
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4" data-testid="inventory-filters">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Search by name, SKU, or description..."
              className="pl-10 h-9 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              data-testid="inventory-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48 h-9 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" data-testid="inventory-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48 h-9 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]" data-testid="inventory-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Active Filter Pills */}
        {(categoryFilter || statusFilter || search) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)] animate-slide-in">
            <span className="text-xs text-[var(--text-muted)] flex items-center mr-1">Active Filters:</span>
            {search && (
              <Badge variant="outline" className="bg-[var(--bg-overlay)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] px-2 py-1 gap-1 cursor-pointer" onClick={() => setSearch("")}>
                Search: {search} <X className="w-3 h-3 ml-1 hover:text-[var(--danger)] transition-colors" />
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="outline" className="bg-[var(--bg-overlay)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] px-2 py-1 gap-1 cursor-pointer" onClick={() => setCategoryFilter("")}>
                Category: {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter} <X className="w-3 h-3 ml-1 hover:text-[var(--danger)] transition-colors" />
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="outline" className="bg-[var(--bg-overlay)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] px-2 py-1 gap-1 cursor-pointer" onClick={() => setStatusFilter("")}>
                Status: {STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label || statusFilter} <X className="w-3 h-3 ml-1 hover:text-[var(--danger)] transition-colors" />
              </Badge>
            )}
            <button 
              className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors ml-auto flex items-center gap-1"
              onClick={() => { setSearch(""); setCategoryFilter(""); setStatusFilter(""); setPage(1); }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton rows={8} cols={8} /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No items found" description="Try adjusting your filters or add new stock." />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden" data-testid="inventory-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="inventory-table">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">SKU</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Name</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Category</th>
                    <th className="text-right p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Quantity</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Status</th>
                    <th className="text-right p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Price</th>
                    <th className="text-right p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Reorder Pt</th>
                    <th className="text-center p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="animate-stagger-in">
                  {items.map((item, index) => {
                    const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                    return (
                      <tr
                        key={item.sku}
                        className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 cursor-pointer h-[52px] relative"
                        data-testid={`inventory-row-${index}`}
                        data-sku={item.sku}
                        onClick={() => router.push(`/inventory/${item.sku}`)}
                      >
                        <td className="p-3 font-mono text-[13px] font-medium text-[var(--brand-primary)] relative" data-testid={`sku-${index}`}>
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                          <span className="pl-2" title="Click to open">{item.sku}</span>
                        </td>
                        <td className="p-3" data-testid={`name-${index}`}>
                          <span className="font-medium text-[var(--text-primary)] group-hover/row:text-[var(--brand-primary)] transition-colors">{item.name}</span>
                        </td>
                        <td className="p-3" data-testid={`category-${index}`}>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-[var(--bg-overlay)] text-[var(--text-secondary)]">
                            {item.category?.name || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right" data-testid={`quantity-${index}`}>
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-[var(--border-default)]"
                              disabled={adjustingQty === item.sku || item.quantity <= 0}
                              onClick={() => adjustQuantity(item.sku, -1)}
                              data-testid={`qty-decrease-${index}`}
                            >
                              {adjustingQty === item.sku ? <Loader2 className="w-3 h-3 animate-spin" /> : <Minus className="w-3 h-3" />}
                            </Button>
                            <span className={`w-10 text-center font-mono font-medium text-[15px] ${getQtyColor(item)}`}>{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-[var(--border-default)]"
                              disabled={adjustingQty === item.sku}
                              onClick={() => adjustQuantity(item.sku, 1)}
                              data-testid={`qty-increase-${index}`}
                            >
                              {adjustingQty === item.sku ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            </Button>
                          </div>
                        </td>
                        <td className="p-3" data-testid={`status-${index}`}>
                          {statusConf && (
                            <Badge variant="outline" className={cn(statusConf.bgColor, statusConf.color, "border text-xs rounded-full px-2.5 py-0.5 shadow-sm")}>
                              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", statusConf.dotColor, ["LOW_STOCK", "OUT_OF_STOCK"].includes(item.status) && "animate-pulse-dot shadow-glow")} />
                              {statusConf.label}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono text-[var(--text-secondary)]" data-testid={`price-${index}`}>{formatCurrency(item.pricePerUnit)}</td>
                        <td className="p-3 text-right font-mono text-[var(--text-muted)]" data-testid={`reorder-${index}`}>{item.reorderPoint}</td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`qr-btn-${index}`}>
                            <QrCode className="w-4 h-4 text-[var(--text-muted)]" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 animate-stagger-in" data-testid="inventory-cards-mobile">
            {items.map((item, index) => {
              const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
              return (
                <div
                  key={item.sku}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--border-brand)] hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                  data-testid={`inventory-card-${index}`}
                  onClick={() => router.push(`/inventory/${item.sku}`)}
                >
                  <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: statusConf?.color.replace("text-[", "").replace("]", "") || "var(--border-subtle)" }} />
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-xs text-[var(--brand-primary)] font-mono">{item.sku}</p>
                    </div>
                    {statusConf && (
                      <Badge variant="outline" className={cn(statusConf.bgColor, statusConf.color, "border text-xs rounded-full shadow-sm")}>
                        <span className={cn("w-1 h-1 rounded-full mr-1 inline-block", statusConf.dotColor, ["LOW_STOCK", "OUT_OF_STOCK"].includes(item.status) && "animate-pulse-dot")} />
                        {statusConf.label}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div><span className="text-[var(--text-muted)]">Qty:</span> <span className={`font-mono font-medium ${getQtyColor(item)}`}>{item.quantity}</span></div>
                    <div><span className="text-[var(--text-muted)]">Price:</span> <span className="font-mono font-medium text-[var(--text-secondary)]">{formatCurrency(item.pricePerUnit)}</span></div>
                    <div><span className="text-[var(--text-muted)]">Reorder:</span> <span className="font-mono font-medium text-[var(--text-secondary)]">{item.reorderPoint}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between" data-testid="inventory-pagination">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)} of {totalItems} items
              </span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20 h-8 bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] text-xs" data-testid="page-size-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="page-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="page-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
