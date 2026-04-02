import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuantityUpdateSchema } from "@/lib/validations/stock";
import { deriveStatus } from "@/lib/utils/stock-status";
import { sendEmail } from "@/lib/email/mailer";
import { lowStockEmailTemplate } from "@/lib/email/templates/low-stock";

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
    const validation = QuantityUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { quantityChange, actionType, details } = validation.data;

    const item = await prisma.stockItem.findUnique({ where: { sku } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Stock item not found" }, { status: 404 });
    }

    const newQty = item.quantity + quantityChange;

    // Prevent negative stock
    if (newQty < 0) {
      return NextResponse.json({
        success: false,
        error: `Insufficient stock. Current quantity: ${item.quantity}, attempted change: ${quantityChange}`,
      }, { status: 400 });
    }

    const previousStatus = item.status;
    const newStatus = deriveStatus(newQty, item.reorderPoint);

    // Update stock item
    const updatedItem = await prisma.stockItem.update({
      where: { sku },
      data: {
        quantity: newQty,
        status: newStatus,
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        actionType,
        quantityChanged: quantityChange,
        previousQty: item.quantity,
        newQty,
        details: details || null,
        userId: (session.user as { id: string }).id,
        stockItemSku: sku,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_QTY",
        targetEntity: "StockItem",
        targetId: sku,
        changedFields: {
          before: { quantity: item.quantity, status: previousStatus },
          after: { quantity: newQty, status: newStatus },
          change: quantityChange,
          actionType,
        },
        userId: (session.user as { id: string }).id,
      },
    });

    // Low stock / Out of stock alerts
    if (
      (newStatus === "LOW_STOCK" || newStatus === "OUT_OF_STOCK") &&
      previousStatus !== newStatus
    ) {
      // Create notifications for all MANAGER and ADMIN users
      const managers = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "MANAGER"] } },
        select: { id: true, email: true },
      });

      await prisma.notification.createMany({
        data: managers.map((m) => ({
          type: newStatus,
          message: `${item.name} (${sku}) is ${
            newStatus === "OUT_OF_STOCK" ? "out of stock" : "below reorder point"
          } (${newQty} remaining).`,
          link: `/inventory/${sku}`,
          userId: m.id,
        })),
      });

      // Send email to ADMIN users
      const admins = managers.filter(async (m) => {
        const user = await prisma.user.findUnique({ where: { id: m.id }, select: { role: true } });
        return user?.role === "ADMIN";
      });

      const adminEmails = admins.map((a) => a.email);
      if (adminEmails.length > 0) {
        try {
          await sendEmail({
            to: adminEmails,
            subject: `⚠️ ${newStatus === "OUT_OF_STOCK" ? "Out of Stock" : "Low Stock"}: ${item.name} (${sku})`,
            html: lowStockEmailTemplate({
              itemName: item.name,
              sku,
              currentQty: newQty,
              reorderPoint: item.reorderPoint,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send low stock email:", emailError);
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("PUT /api/stock/[sku]/quantity error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
