import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSKUs, lowStockItems, outOfStockItems, transactionsToday] =
      await Promise.all([
        prisma.stockItem.count({ where: { status: { not: "ARCHIVED" } } }),
        prisma.stockItem.count({ where: { status: "LOW_STOCK" } }),
        prisma.stockItem.count({ where: { status: "OUT_OF_STOCK" } }),
        prisma.transaction.count({ where: { timestamp: { gte: today } } }),
      ]);

    // Stock by category
    const categories = await prisma.category.findMany({
      include: {
        stockItems: {
          where: { status: { not: "ARCHIVED" } },
          select: { quantity: true },
        },
      },
    });

    const stockByCategory = categories.map((c: { name: string; stockItems: { quantity: number }[] }) => ({
      category: c.name,
      count: c.stockItems.length,
      totalQty: c.stockItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
    }));

    // Transaction trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    });

    const trendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      trendMap[key] = 0;
    }
    for (const t of transactions) {
      const key = new Date(t.timestamp).toISOString().split("T")[0];
      if (trendMap[key] !== undefined) trendMap[key]++;
    }

    const transactionTrend = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        stockItem: { select: { sku: true, name: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSKUs,
        lowStockItems,
        outOfStockItems,
        transactionsToday,
        stockByCategory,
        transactionTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
