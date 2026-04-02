import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReserveStockSchema } from "@/lib/validations/stock";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sku } = await params;
    const body = await req.json();
    const validation = ReserveStockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { quantity, details } = validation.data;

    const item = await prisma.stockItem.findUnique({ where: { sku } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Stock item not found" }, { status: 404 });
    }

    if (item.quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: `Insufficient stock for reservation. Available: ${item.quantity}`,
      }, { status: 400 });
    }

    const newQty = item.quantity - quantity;

    const updatedItem = await prisma.stockItem.update({
      where: { sku },
      data: {
        quantity: newQty,
        status: newQty === 0 ? "RESERVED" : item.status,
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await prisma.transaction.create({
      data: {
        actionType: "RESERVATION",
        quantityChanged: -quantity,
        previousQty: item.quantity,
        newQty,
        details: details || "Stock reserved for order",
        userId: (session.user as { id: string }).id,
        stockItemSku: sku,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "RESERVE_STOCK",
        targetEntity: "StockItem",
        targetId: sku,
        changedFields: {
          before: { quantity: item.quantity },
          after: { quantity: newQty },
          reserved: quantity,
        },
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("PUT /api/stock/[sku]/reserve error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
