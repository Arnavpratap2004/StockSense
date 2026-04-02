// Plain string types mirroring Prisma enums — safe for client components
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "RESERVED" | "BACKORDERED" | "DAMAGED" | "ARCHIVED";
export type ActionType = "SALE" | "RESTOCK" | "RETURN" | "ADJUSTMENT" | "RESERVATION" | "RESERVATION_CANCEL" | "DAMAGE_WRITE_OFF" | "ARCHIVE";
export type ReportType = "LOW_STOCK" | "TRANSACTION_HISTORY" | "STOCK_LEVELS" | "SALES_SUMMARY";
export type Role = "ADMIN" | "MANAGER" | "STAFF";

export interface StockItemWithRelations {
  sku: string;
  name: string;
  description: string | null;
  pricePerUnit: number;
  quantity: number;
  reorderPoint: number;
  status: StockStatus;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  supplierId: string | null;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

export interface TransactionWithRelations {
  id: string;
  timestamp: Date;
  actionType: ActionType;
  quantityChanged: number;
  previousQty: number;
  newQty: number;
  details: string | null;
  userId: string;
  stockItemSku: string;
  user?: { id: string; username: string; email: string };
  stockItem?: { sku: string; name: string };
}

export interface DashboardStats {
  totalSKUs: number;
  lowStockItems: number;
  outOfStockItems: number;
  transactionsToday: number;
  stockByCategory: { category: string; count: number; totalQty: number }[];
  transactionTrend: { date: string; count: number }[];
  recentTransactions: TransactionWithRelations[];
}
