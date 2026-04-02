import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportGenerateSchema } from "@/lib/validations/report";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { generatedDate: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = ReportGenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, startDate, endDate, category, sku } = validation.data;
    let dataContent: unknown;

    switch (type) {
      case "LOW_STOCK": {
        const items = await prisma.stockItem.findMany({
          where: {
            status: { in: ["LOW_STOCK", "OUT_OF_STOCK"] },
            ...(category ? { categoryId: category } : {}),
          },
          include: {
            category: { select: { name: true } },
            supplier: { select: { name: true } },
          },
          orderBy: { quantity: "asc" },
        });
        dataContent = items.map((i) => ({
          sku: i.sku,
          name: i.name,
          category: i.category?.name || "N/A",
          supplier: i.supplier?.name || "N/A",
          quantity: i.quantity,
          reorderPoint: i.reorderPoint,
          status: i.status,
          pricePerUnit: i.pricePerUnit,
        }));
        break;
      }

      case "TRANSACTION_HISTORY": {
        const where: Record<string, unknown> = {};
        if (startDate) where.timestamp = { gte: new Date(startDate) };
        if (endDate) {
          where.timestamp = {
            ...(where.timestamp as Record<string, unknown> || {}),
            lte: new Date(endDate + "T23:59:59.999Z"),
          };
        }
        if (sku) where.stockItemSku = sku;

        const transactions = await prisma.transaction.findMany({
          where,
          include: {
            user: { select: { username: true } },
            stockItem: { select: { name: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 500,
        });
        dataContent = transactions.map((t) => ({
          id: t.id,
          timestamp: t.timestamp,
          sku: t.stockItemSku,
          itemName: t.stockItem.name,
          actionType: t.actionType,
          quantityChanged: t.quantityChanged,
          previousQty: t.previousQty,
          newQty: t.newQty,
          user: t.user.username,
          details: t.details,
        }));
        break;
      }

      case "STOCK_LEVELS": {
        const items = await prisma.stockItem.findMany({
          where: {
            status: { not: "ARCHIVED" },
            ...(category ? { categoryId: category } : {}),
          },
          include: {
            category: { select: { name: true } },
          },
          orderBy: { name: "asc" },
        });
        dataContent = items.map((i) => ({
          sku: i.sku,
          name: i.name,
          category: i.category?.name || "N/A",
          quantity: i.quantity,
          reorderPoint: i.reorderPoint,
          status: i.status,
          pricePerUnit: i.pricePerUnit,
          totalValue: i.quantity * i.pricePerUnit,
        }));
        break;
      }

      case "SALES_SUMMARY": {
        const where: Record<string, unknown> = { actionType: "SALE" };
        if (startDate) where.timestamp = { gte: new Date(startDate) };
        if (endDate) {
          where.timestamp = {
            ...(where.timestamp as Record<string, unknown> || {}),
            lte: new Date(endDate + "T23:59:59.999Z"),
          };
        }

        const sales = await prisma.transaction.findMany({
          where,
          include: {
            stockItem: { select: { name: true, pricePerUnit: true } },
          },
          orderBy: { timestamp: "desc" },
        });

        const summary: Record<string, { sku: string; name: string; totalQty: number; totalValue: number; count: number }> = {};
        for (const s of sales) {
          if (!summary[s.stockItemSku]) {
            summary[s.stockItemSku] = {
              sku: s.stockItemSku,
              name: s.stockItem.name,
              totalQty: 0,
              totalValue: 0,
              count: 0,
            };
          }
          summary[s.stockItemSku].totalQty += Math.abs(s.quantityChanged);
          summary[s.stockItemSku].totalValue += Math.abs(s.quantityChanged) * s.stockItem.pricePerUnit;
          summary[s.stockItemSku].count += 1;
        }
        dataContent = Object.values(summary).sort((a, b) => b.totalValue - a.totalValue);
        break;
      }
    }

    const report = await prisma.report.create({
      data: {
        reportType: type,
        dataContent: dataContent as object,
        filterParams: { startDate, endDate, category, sku },
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...report, dataContent },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
