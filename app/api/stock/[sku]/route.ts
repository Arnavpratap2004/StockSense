import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StockUpdateSchema } from "@/lib/validations/stock";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sku } = await params;

    const item = await prisma.stockItem.findUnique({
      where: { sku },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true, contactInfo: true } },
        transactions: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Stock item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/stock/[sku] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { sku } = await params;
    const body = await req.json();
    const validation = StockUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const existing = await prisma.stockItem.findUnique({ where: { sku } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stock item not found" }, { status: 404 });
    }

    const data = validation.data;

    const item = await prisma.stockItem.update({
      where: { sku },
      data,
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_STOCK",
        targetEntity: "StockItem",
        targetId: sku,
        changedFields: { before: existing, after: data },
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("PUT /api/stock/[sku] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { sku } = await params;

    const existing = await prisma.stockItem.findUnique({ where: { sku } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stock item not found" }, { status: 404 });
    }

    await prisma.stockItem.update({
      where: { sku },
      data: { status: "ARCHIVED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "ARCHIVE_STOCK",
        targetEntity: "StockItem",
        targetId: sku,
        changedFields: { before: { status: existing.status }, after: { status: "ARCHIVED" } },
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({ success: true, message: "Stock item archived" });
  } catch (error) {
    console.error("DELETE /api/stock/[sku] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
