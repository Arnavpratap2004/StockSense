import { z } from "zod";

export const StockCreateSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be 50 characters or less")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().optional(),
  pricePerUnit: z
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  reorderPoint: z
    .number({ error: "Reorder point must be a number" })
    .int("Reorder point must be a whole number")
    .min(1, "Reorder point must be at least 1"),
});

export const StockUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional().nullable(),
  pricePerUnit: z.number().positive().optional(),
  reorderPoint: z.number().int().min(1).optional(),
});

export const QuantityUpdateSchema = z.object({
  quantityChange: z.number().int("Must be a whole number").refine((v) => v !== 0, "Change cannot be zero"),
  actionType: z.enum(["SALE", "RESTOCK", "RETURN", "ADJUSTMENT"]),
  details: z.string().max(500).optional(),
});

export const ReserveStockSchema = z.object({
  quantity: z.number().int().positive("Reserve quantity must be positive"),
  details: z.string().max(500).optional(),
});

export const DamageStockSchema = z.object({
  quantity: z.number().int().positive("Damage quantity must be positive"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type StockCreateInput = z.infer<typeof StockCreateSchema>;
export type StockUpdateInput = z.infer<typeof StockUpdateSchema>;
export type QuantityUpdateInput = z.infer<typeof QuantityUpdateSchema>;
export type ReserveStockInput = z.infer<typeof ReserveStockSchema>;
export type DamageStockInput = z.infer<typeof DamageStockSchema>;
