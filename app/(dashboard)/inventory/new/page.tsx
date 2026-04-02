"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockCreateSchema, type StockCreateInput } from "@/lib/validations/stock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";

interface Category { id: string; name: string; }
interface Supplier { id: string; name: string; }

export default function NewStockPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [skuAvailable, setSkuAvailable] = useState<boolean | null>(null);
  const [checkingSku, setCheckingSku] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" data-testid="new-stock-page">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" data-testid="new-stock-title">Add New Stock</h1>
          <p className="text-muted-foreground">Register a new item in the inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="stock-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      placeholder="e.g. ELEC-004"
                      data-testid="stock-sku"
                      {...register("sku")}
                      onBlur={(e) => checkSku(e.target.value)}
                      className={skuAvailable === false ? "border-red-500" : skuAvailable === true ? "border-green-500" : ""}
                    />
                    {checkingSku && <p className="text-xs text-muted-foreground">Checking availability...</p>}
                    {skuAvailable === false && <p className="text-sm text-red-500" data-testid="sku-taken-error">SKU already exists</p>}
                    {skuAvailable === true && <p className="text-sm text-green-600" data-testid="sku-available">SKU is available ✓</p>}
                    {errors.sku && <p className="text-sm text-red-500" data-testid="sku-error">{errors.sku.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" placeholder="e.g. Dell Laptop 15" data-testid="stock-name" {...register("name")} />
                    {errors.name && <p className="text-sm text-red-500" data-testid="name-error">{errors.name.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Product description..." rows={3} data-testid="stock-description" {...register("description")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select onValueChange={(v) => { if (v) setValue("categoryId", String(v)); }}>
                      <SelectTrigger data-testid="stock-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-red-500" data-testid="category-error">{errors.categoryId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select onValueChange={(v) => { if (v) setValue("supplierId", String(v)); }}>
                      <SelectTrigger data-testid="stock-supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price Per Unit (₹) *</Label>
                    <Input id="pricePerUnit" type="number" step="0.01" placeholder="0.00" data-testid="stock-price" {...register("pricePerUnit", { valueAsNumber: true })} />
                    {errors.pricePerUnit && <p className="text-sm text-red-500" data-testid="price-error">{errors.pricePerUnit.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Initial Quantity *</Label>
                    <Input id="quantity" type="number" placeholder="0" data-testid="stock-quantity" {...register("quantity", { valueAsNumber: true })} />
                    {errors.quantity && <p className="text-sm text-red-500" data-testid="quantity-error">{errors.quantity.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reorderPoint">Reorder Point *</Label>
                    <Input id="reorderPoint" type="number" placeholder="10" data-testid="stock-reorder" {...register("reorderPoint", { valueAsNumber: true })} />
                    {errors.reorderPoint && <p className="text-sm text-red-500" data-testid="reorder-error">{errors.reorderPoint.message}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-[#1E3A5F] hover:bg-[#152C4A]" disabled={isSubmitting || skuAvailable === false} data-testid="stock-submit-btn">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" data-testid="loading-spinner" /> Creating...</> : "Create Stock Item"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} data-testid="preview-toggle">
                    <Eye className="w-4 h-4 mr-1" /> {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <Card className="animate-slide-in" data-testid="stock-preview">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">SKU:</span> <span className="font-mono font-medium" data-testid="preview-sku">{watchedValues.sku || "—"}</span></div>
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium" data-testid="preview-name">{watchedValues.name || "—"}</span></div>
              <div><span className="text-muted-foreground">Description:</span> <span data-testid="preview-description">{watchedValues.description || "—"}</span></div>
              <div><span className="text-muted-foreground">Price:</span> <span className="font-medium" data-testid="preview-price">{watchedValues.pricePerUnit ? formatCurrency(watchedValues.pricePerUnit) : "—"}</span></div>
              <div><span className="text-muted-foreground">Quantity:</span> <span className="font-medium" data-testid="preview-qty">{watchedValues.quantity ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Reorder Point:</span> <span className="font-medium" data-testid="preview-reorder">{watchedValues.reorderPoint ?? "—"}</span></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
