import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StockCreateSchema } from "@/lib/validations/stock";
import { deriveStatus } from "@/lib/utils/stock-status";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    // Don't show archived by default
    if (!status) {
      where.status = { not: "ARCHIVED" };
    }

    const [items, totalItems] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stockItem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/stock error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = StockCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const data = validation.data;

    // Check SKU uniqueness
    const existing = await prisma.stockItem.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: `SKU "${data.sku}" already exists`,
      }, { status: 409 });
    }

    const status = deriveStatus(data.quantity, data.reorderPoint);

    const item = await prisma.stockItem.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        pricePerUnit: data.pricePerUnit,
        quantity: data.quantity,
        reorderPoint: data.reorderPoint,
        status,
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_STOCK",
        targetEntity: "StockItem",
        targetId: item.sku,
        changedFields: { after: data },
        userId: (session.user as { id: string }).id,
      },
    });

    // Initial transaction
    if (data.quantity > 0) {
      await prisma.transaction.create({
        data: {
          actionType: "RESTOCK",
          quantityChanged: data.quantity,
          previousQty: 0,
          newQty: data.quantity,
          details: "Initial stock registration",
          userId: (session.user as { id: string }).id,
          stockItemSku: item.sku,
        },
      });
    }

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/stock error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
