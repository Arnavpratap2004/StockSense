"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockCreateSchema, type StockCreateInput } from "@/lib/validations/stock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Category { id: string; name: string; }
interface Supplier { id: string; name: string; }

export default function NewStockPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [skuAvailable, setSkuAvailable] = useState<boolean | null>(null);
  const [checkingSku, setCheckingSku] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockCreateInput>({
    resolver: zodResolver(StockCreateSchema),
    defaultValues: { quantity: 0, reorderPoint: 10 },
  });

  const watchedValues = watch();

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]).then(([catData, supData]) => {
      if (catData.success) setCategories(catData.data);
      if (supData.success) setSuppliers(supData.data);
    });
  }, []);

  const checkSku = async (sku: string) => {
    if (!sku || sku.length < 2) { setSkuAvailable(null); return; }
    setCheckingSku(true);
    try {
      const res = await fetch(`/api/stock/${sku}`);
      setSkuAvailable(res.status === 404);
    } catch {
      setSkuAvailable(null);
    } finally {
      setCheckingSku(false);
    }
  };

  const onSubmit = async (data: StockCreateInput) => {
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Stock item created successfully!");
        router.push("/inventory");
      } else {
        toast.error(result.error || "Failed to create stock item");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_0_3px_var(--brand-glow)] transition-all duration-150";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" data-testid="new-stock-page">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg-overlay)] transition text-[var(--text-secondary)]" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="new-stock-title">Add New Stock</h1>
          <p className="text-[var(--text-secondary)] text-sm">Register a new item in the inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="stock-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">SKU *</Label>
                  <div className="relative">
                    <Input
                      id="sku"
                      placeholder="e.g. ELEC-004"
                      data-testid="stock-sku"
                      {...register("sku")}
                      onBlur={(e) => checkSku(e.target.value)}
                      className={`${inputClasses} ${skuAvailable === false ? "border-[var(--danger)]" : skuAvailable === true ? "border-[var(--success)]" : ""}`}
                    />
                    {checkingSku && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[var(--text-muted)]" />}
                    {skuAvailable === true && !checkingSku && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--success)]" />}
                    {skuAvailable === false && !checkingSku && <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--danger)]" />}
                  </div>
                  {skuAvailable === false && <p className="text-sm text-[var(--danger)]" data-testid="sku-taken-error">SKU already exists</p>}
                  {skuAvailable === true && <p className="text-sm text-[var(--success)]" data-testid="sku-available">SKU is available ✓</p>}
                  {errors.sku && <p className="text-sm text-[var(--danger)]" data-testid="sku-error">{errors.sku.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Product Name *</Label>
                  <Input id="name" placeholder="e.g. Dell Laptop 15" data-testid="stock-name" {...register("name")} className={inputClasses} />
                  {errors.name && <p className="text-sm text-[var(--danger)]" data-testid="name-error">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Description</Label>
                <Textarea id="description" placeholder="Product description..." rows={3} data-testid="stock-description" {...register("description")} className={inputClasses + " resize-none"} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Category *</Label>
                  <Select onValueChange={(v) => { if (v) setValue("categoryId", String(v)); }}>
                    <SelectTrigger data-testid="stock-category" className={inputClasses}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-[var(--danger)]" data-testid="category-error">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Supplier</Label>
                  <Select onValueChange={(v) => { if (v) setValue("supplierId", String(v)); }}>
                    <SelectTrigger data-testid="stock-supplier" className={inputClasses}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Price Per Unit (₹) *</Label>
                  <Input id="pricePerUnit" type="number" step="0.01" placeholder="0.00" data-testid="stock-price" {...register("pricePerUnit", { valueAsNumber: true })} className={inputClasses} />
                  {errors.pricePerUnit && <p className="text-sm text-[var(--danger)]" data-testid="price-error">{errors.pricePerUnit.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Initial Quantity *</Label>
                  <Input id="quantity" type="number" placeholder="0" data-testid="stock-quantity" {...register("quantity", { valueAsNumber: true })} className={inputClasses} />
                  {errors.quantity && <p className="text-sm text-[var(--danger)]" data-testid="quantity-error">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderPoint" className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Reorder Point *</Label>
                  <Input id="reorderPoint" type="number" placeholder="10" data-testid="stock-reorder" {...register("reorderPoint", { valueAsNumber: true })} className={inputClasses} />
                  {errors.reorderPoint && <p className="text-sm text-[var(--danger)]" data-testid="reorder-error">{errors.reorderPoint.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting || skuAvailable === false} data-testid="stock-submit-btn" className="h-10 px-6">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" data-testid="loading-spinner" /> Creating...</> : "Create Stock Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 lg:sticky lg:top-20 h-fit" data-testid="stock-preview">
          <p className="text-[10px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold mb-4">Preview</p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-[var(--text-muted)] text-xs">SKU</span>
              <p className="font-mono font-medium text-[var(--brand-primary)]" data-testid="preview-sku">{watchedValues.sku || "—"}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">Name</span>
              <p className="font-medium text-[var(--text-primary)]" data-testid="preview-name">{watchedValues.name || "—"}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">Description</span>
              <p className="text-[var(--text-secondary)]" data-testid="preview-description">{watchedValues.description || "—"}</p>
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[var(--text-muted)] text-xs">Price</span>
                <p className="font-mono font-medium text-[var(--text-primary)]" data-testid="preview-price">{watchedValues.pricePerUnit ? formatCurrency(watchedValues.pricePerUnit) : "—"}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Quantity</span>
                <p className="font-mono font-medium text-[var(--text-primary)]" data-testid="preview-qty">{watchedValues.quantity ?? "—"}</p>
              </div>
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">Reorder Point</span>
              <p className="font-mono font-medium text-[var(--text-primary)]" data-testid="preview-reorder">{watchedValues.reorderPoint ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
