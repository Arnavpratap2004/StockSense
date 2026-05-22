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
    color: "text-[#22C55E]",
    bgColor: "bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]",
    dotColor: "bg-[#22C55E]",
  },
  LOW_STOCK: {
    label: "Low Stock",
    color: "text-[#F59E0B]",
    bgColor: "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
    dotColor: "bg-[#F59E0B] animate-pulse-dot",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    color: "text-[#EF4444]",
    bgColor: "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]",
    dotColor: "bg-[#EF4444]",
  },
  RESERVED: {
    label: "Reserved",
    color: "text-[#3B82F6]",
    bgColor: "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]",
    dotColor: "bg-[#3B82F6]",
  },
  BACKORDERED: {
    label: "Backordered",
    color: "text-[#FB923C]",
    bgColor: "bg-[rgba(251,146,60,0.1)] border-[rgba(251,146,60,0.2)]",
    dotColor: "bg-[#FB923C]",
  },
  DAMAGED: {
    label: "Damaged",
    color: "text-[var(--text-muted)]",
    bgColor: "bg-[var(--bg-overlay)] border-[var(--border-default)]",
    dotColor: "bg-[var(--text-muted)]",
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-[var(--text-muted)]",
    bgColor: "bg-[var(--bg-overlay)] border-[var(--border-default)]",
    dotColor: "bg-[var(--text-muted)]",
  },
};

export const ACTION_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon?: string }
> = {
  SALE: { label: "Sale", color: "text-[#EF4444]", bgColor: "bg-[rgba(239,68,68,0.1)]", icon: "↓" },
  RESTOCK: { label: "Restock", color: "text-[#22C55E]", bgColor: "bg-[rgba(34,197,94,0.1)]", icon: "↑" },
  RETURN: { label: "Return", color: "text-[#3B82F6]", bgColor: "bg-[rgba(59,130,246,0.1)]", icon: "↩" },
  ADJUSTMENT: { label: "Adjustment", color: "text-[#F59E0B]", bgColor: "bg-[rgba(245,158,11,0.1)]", icon: "↔" },
  RESERVATION: { label: "Reservation", color: "text-[#A78BFA]", bgColor: "bg-[rgba(139,92,246,0.1)]", icon: "🔒" },
  RESERVATION_CANCEL: { label: "Cancel Reserve", color: "text-[#FB923C]", bgColor: "bg-[rgba(251,146,60,0.1)]", icon: "↩" },
  DAMAGE_WRITE_OFF: { label: "Damage Write-off", color: "text-[var(--text-muted)]", bgColor: "bg-[var(--bg-overlay)]", icon: "⚠" },
  ARCHIVE: { label: "Archive", color: "text-[var(--text-muted)]", bgColor: "bg-[var(--bg-overlay)]", icon: "📦" },
};
