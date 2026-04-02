import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, StockStatus } from "@/generated/prisma/client";

// POST /api/test/reset-db — Reset database to clean seed state for testing
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Delete in dependency order
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.report.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stockItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();

    // Re-seed
    const categories = await Promise.all([
      prisma.category.create({ data: { name: "Electronics" } }),
      prisma.category.create({ data: { name: "Office Supplies" } }),
      prisma.category.create({ data: { name: "Furniture" } }),
      prisma.category.create({ data: { name: "Groceries" } }),
    ]);

    const supplier1 = await prisma.supplier.create({
      data: { id: "supplier-001", name: "TechDistrib Inc.", contactInfo: "contact@techdistrib.com | +1-800-555-0101" },
    });
    const supplier2 = await prisma.supplier.create({
      data: { id: "supplier-002", name: "OfficeWorld Supplies", contactInfo: "orders@officeworld.com | +1-800-555-0202" },
    });

    const adminHash = await bcrypt.hash("Admin@123", 12);
    const managerHash = await bcrypt.hash("Manager@123", 12);
    const staffHash = await bcrypt.hash("Staff@123", 12);

    const admin = await prisma.user.create({
      data: { username: "admin", email: "admin@stocksense.com", passwordHash: adminHash, role: Role.ADMIN, phoneNumber: "+91-9000000001" },
    });
    const manager = await prisma.user.create({
      data: { username: "manager", email: "manager@stocksense.com", passwordHash: managerHash, role: Role.MANAGER, phoneNumber: "+91-9000000002" },
    });
    const staff = await prisma.user.create({
      data: { username: "staff", email: "staff@stocksense.com", passwordHash: staffHash, role: Role.STAFF, phoneNumber: "+91-9000000003" },
    });

    const stockItems = [
      { sku: "ELEC-001", name: "Dell Laptop 15", description: "Intel i5, 8GB RAM, 512GB SSD", pricePerUnit: 55000, quantity: 25, reorderPoint: 5, status: StockStatus.IN_STOCK, categoryId: categories[0].id, supplierId: supplier1.id },
      { sku: "ELEC-002", name: "Logitech Wireless Mouse", description: "M330 Silent Plus", pricePerUnit: 1800, quantity: 3, reorderPoint: 10, status: StockStatus.LOW_STOCK, categoryId: categories[0].id, supplierId: supplier1.id },
      { sku: "ELEC-003", name: "Mechanical Keyboard", description: "Cherry MX Blue switches", pricePerUnit: 4500, quantity: 0, reorderPoint: 5, status: StockStatus.OUT_OF_STOCK, categoryId: categories[0].id, supplierId: supplier1.id },
      { sku: "OFFICE-001", name: "A4 Printing Paper (500 sheets)", description: "80 GSM, Copier grade", pricePerUnit: 350, quantity: 200, reorderPoint: 50, status: StockStatus.IN_STOCK, categoryId: categories[1].id, supplierId: supplier2.id },
      { sku: "OFFICE-002", name: "Ballpoint Pen Box (12 pcs)", description: "Blue ink, medium nib", pricePerUnit: 120, quantity: 8, reorderPoint: 20, status: StockStatus.LOW_STOCK, categoryId: categories[1].id, supplierId: supplier2.id },
      { sku: "FURN-001", name: "Ergonomic Office Chair", description: "Lumbar support, adjustable height", pricePerUnit: 12000, quantity: 10, reorderPoint: 3, status: StockStatus.IN_STOCK, categoryId: categories[2].id, supplierId: supplier2.id },
    ];

    for (const item of stockItems) {
      await prisma.stockItem.create({ data: item });
    }

    await prisma.transaction.createMany({
      data: [
        { actionType: "SALE", quantityChanged: -2, previousQty: 27, newQty: 25, details: "Sold to customer order #1042", userId: staff.id, stockItemSku: "ELEC-001" },
        { actionType: "RESTOCK", quantityChanged: 100, previousQty: 100, newQty: 200, details: "Restocked from OfficeWorld", userId: manager.id, stockItemSku: "OFFICE-001" },
        { actionType: "SALE", quantityChanged: -7, previousQty: 10, newQty: 3, details: "Bulk sale to TechCo", userId: staff.id, stockItemSku: "ELEC-002" },
      ],
    });

    await prisma.notification.createMany({
      data: [
        { type: "LOW_STOCK", message: "Logitech Wireless Mouse (ELEC-002) is below reorder point (3 left).", link: "/inventory/ELEC-002", userId: admin.id },
        { type: "OUT_OF_STOCK", message: "Mechanical Keyboard (ELEC-003) is out of stock.", link: "/inventory/ELEC-003", userId: admin.id },
        { type: "LOW_STOCK", message: "Ballpoint Pen Box (OFFICE-002) is below reorder point (8 left).", link: "/inventory/OFFICE-002", userId: manager.id },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Database reset to seed state",
      data: {
        users: 3,
        categories: 4,
        suppliers: 2,
        stockItems: 6,
        transactions: 3,
        notifications: 3,
        credentials: {
          admin: { email: "admin@stocksense.com", password: "Admin@123" },
          manager: { email: "manager@stocksense.com", password: "Manager@123" },
          staff: { email: "staff@stocksense.com", password: "Staff@123" },
        },
      },
    });
  } catch (error) {
    console.error("Reset DB error:", error);
    return NextResponse.json({ success: false, error: "Reset failed" }, { status: 500 });
  }
}
