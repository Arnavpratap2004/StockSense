"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, QrCode, Minus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
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

  const statusOptions = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "RESERVED", "BACKORDERED", "DAMAGED"];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="inventory-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="inventory-title">Inventory</h1>
          <p className="text-muted-foreground">{totalItems} items total</p>
        </div>
        {["ADMIN", "MANAGER"].includes(userRole) && (
          <Link href="/inventory/new" className={buttonVariants() + " bg-[#1E3A5F] hover:bg-[#152C4A]"} data-testid="add-stock-btn">
            <Plus className="w-4 h-4 mr-1" /> Add New Stock
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card data-testid="inventory-filters">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or description..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                data-testid="inventory-search"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48" data-testid="inventory-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48" data-testid="inventory-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton rows={8} cols={8} /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No items found" description="Try adjusting your filters or add new stock." />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block" data-testid="inventory-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="inventory-table">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Reorder Pt</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                    return (
                      <tr
                        key={item.sku}
                        className="border-b last:border-0 hover:bg-muted/30 transition cursor-pointer"
                        data-testid={`inventory-row-${index}`}
                        data-sku={item.sku}
                        onClick={() => router.push(`/inventory/${item.sku}`)}
                      >
                        <td className="p-3 font-mono text-xs font-medium" data-testid={`sku-${index}`}>{item.sku}</td>
                        <td className="p-3 font-medium" data-testid={`name-${index}`}>{item.name}</td>
                        <td className="p-3 text-muted-foreground" data-testid={`category-${index}`}>{item.category?.name || "—"}</td>
                        <td className="p-3 text-right" data-testid={`quantity-${index}`}>
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={adjustingQty === item.sku || item.quantity <= 0}
                              onClick={() => adjustQuantity(item.sku, -1)}
                              data-testid={`qty-decrease-${index}`}
                            >
                              {adjustingQty === item.sku ? <Loader2 className="w-3 h-3 animate-spin" /> : <Minus className="w-3 h-3" />}
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
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
                            <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} border text-xs`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor} mr-1.5`} />
                              {statusConf.label}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right" data-testid={`price-${index}`}>{formatCurrency(item.pricePerUnit)}</td>
                        <td className="p-3 text-right text-muted-foreground" data-testid={`reorder-${index}`}>{item.reorderPoint}</td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`qr-btn-${index}`}>
                            <QrCode className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3" data-testid="inventory-cards-mobile">
            {items.map((item, index) => {
              const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
              return (
                <Card key={item.sku} className="cursor-pointer hover:shadow-md transition" data-testid={`inventory-card-${index}`} onClick={() => router.push(`/inventory/${item.sku}`)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </div>
                      {statusConf && (
                        <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} border text-xs`}>
                          {statusConf.label}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                      <div><span className="text-muted-foreground">Qty:</span> <span className="font-medium">{item.quantity}</span></div>
                      <div><span className="text-muted-foreground">Price:</span> <span className="font-medium">{formatCurrency(item.pricePerUnit)}</span></div>
                      <div><span className="text-muted-foreground">Reorder:</span> <span className="font-medium">{item.reorderPoint}</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between" data-testid="inventory-pagination">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20 h-8" data-testid="page-size-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="page-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="page-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
