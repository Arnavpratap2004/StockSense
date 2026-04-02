import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/test/mock-data — Returns current DB state summary for test assertions
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const [users, categories, suppliers, stockItems, transactions, notifications, auditLogs] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, username: true, role: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.supplier.findMany({ select: { id: true, name: true } }),
      prisma.stockItem.findMany({ select: { sku: true, name: true, quantity: true, status: true, reorderPoint: true, pricePerUnit: true } }),
      prisma.transaction.count(),
      prisma.notification.findMany({ select: { id: true, type: true, message: true, isRead: true, userId: true } }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        categories,
        suppliers,
        stockItems,
        transactionCount: transactions,
        notifications,
        auditLogCount: auditLogs,
      },
    });
  } catch (error) {
    console.error("Mock data error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch mock data" }, { status: 500 });
  }
}
