// Stock status types (mirrors Prisma enum but safe for client components)
export type StockStatusType =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "RESERVED"
  | "BACKORDERED"
  | "DAMAGED"
  | "ARCHIVED";

export function deriveStatus(
  quantity: number,
  reorderPoint: number
): StockStatusType {
  if (quantity === 0) return "OUT_OF_STOCK";
  if (quantity > 0 && quantity < reorderPoint) return "LOW_STOCK";
  return "IN_STOCK";
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  IN_STOCK: {
    label: "In Stock",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  LOW_STOCK: {
    label: "Low Stock",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    dotColor: "bg-amber-500",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    dotColor: "bg-red-500",
  },
  RESERVED: {
    label: "Reserved",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  BACKORDERED: {
    label: "Backordered",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    dotColor: "bg-orange-500",
  },
  DAMAGED: {
    label: "Damaged",
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200",
    dotColor: "bg-gray-500",
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-slate-500",
    bgColor: "bg-slate-50 border-slate-200",
    dotColor: "bg-slate-400",
  },
};

export const ACTION_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  SALE: { label: "Sale", color: "text-blue-700", bgColor: "bg-blue-50" },
  RESTOCK: { label: "Restock", color: "text-emerald-700", bgColor: "bg-emerald-50" },
  RETURN: { label: "Return", color: "text-purple-700", bgColor: "bg-purple-50" },
  ADJUSTMENT: { label: "Adjustment", color: "text-gray-700", bgColor: "bg-gray-50" },
  RESERVATION: { label: "Reservation", color: "text-indigo-700", bgColor: "bg-indigo-50" },
  RESERVATION_CANCEL: { label: "Cancel Reserve", color: "text-orange-700", bgColor: "bg-orange-50" },
  DAMAGE_WRITE_OFF: { label: "Damage Write-off", color: "text-red-700", bgColor: "bg-red-50" },
  ARCHIVE: { label: "Archive", color: "text-slate-700", bgColor: "bg-slate-50" },
};
