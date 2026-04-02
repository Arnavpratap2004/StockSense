import { PrismaClient, Role, StockStatus } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const needsSsl = connectionString?.includes('sslmode=require') || connectionString?.includes('prisma.io');
const pool = new pg.Pool({ connectionString, ssl: needsSsl ? { rejectUnauthorized: false } : undefined });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ──────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: { name: "Electronics" },
    }),
    prisma.category.upsert({
      where: { name: "Office Supplies" },
      update: {},
      create: { name: "Office Supplies" },
    }),
    prisma.category.upsert({
      where: { name: "Furniture" },
      update: {},
      create: { name: "Furniture" },
    }),
    prisma.category.upsert({
      where: { name: "Groceries" },
      update: {},
      create: { name: "Groceries" },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ── Suppliers ───────────────────────────────────────────────
  const supplier1 = await prisma.supplier.upsert({
    where: { id: "supplier-001" },
    update: {},
    create: {
      id: "supplier-001",
      name: "TechDistrib Inc.",
      contactInfo: "contact@techdistrib.com | +1-800-555-0101",
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: "supplier-002" },
    update: {},
    create: {
      id: "supplier-002",
      name: "OfficeWorld Supplies",
      contactInfo: "orders@officeworld.com | +1-800-555-0202",
    },
  });

  console.log("✅ Created 2 suppliers");

  // ── Users ───────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const managerHash = await bcrypt.hash("Manager@123", 12);
  const staffHash = await bcrypt.hash("Staff@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@stocksense.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@stocksense.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
      phoneNumber: "+91-9000000001",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@stocksense.com" },
    update: {},
    create: {
      username: "manager",
      email: "manager@stocksense.com",
      passwordHash: managerHash,
      role: Role.MANAGER,
      phoneNumber: "+91-9000000002",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@stocksense.com" },
    update: {},
    create: {
      username: "staff",
      email: "staff@stocksense.com",
      passwordHash: staffHash,
      role: Role.STAFF,
      phoneNumber: "+91-9000000003",
    },
  });

  console.log("✅ Created 3 users (admin / manager / staff)");

  // ── Stock Items ─────────────────────────────────────────────
  const stockItems = [
    {
      sku: "ELEC-001",
      name: "Dell Laptop 15",
      description: "Intel i5, 8GB RAM, 512GB SSD",
      pricePerUnit: 55000,
      quantity: 25,
      reorderPoint: 5,
      status: StockStatus.IN_STOCK,
      categoryId: categories[0].id,
      supplierId: supplier1.id,
    },
    {
      sku: "ELEC-002",
      name: "Logitech Wireless Mouse",
      description: "M330 Silent Plus",
      pricePerUnit: 1800,
      quantity: 3,
      reorderPoint: 10,
      status: StockStatus.LOW_STOCK,
      categoryId: categories[0].id,
      supplierId: supplier1.id,
    },
    {
      sku: "ELEC-003",
      name: "Mechanical Keyboard",
      description: "Cherry MX Blue switches",
      pricePerUnit: 4500,
      quantity: 0,
      reorderPoint: 5,
      status: StockStatus.OUT_OF_STOCK,
      categoryId: categories[0].id,
      supplierId: supplier1.id,
    },
    {
      sku: "OFFICE-001",
      name: "A4 Printing Paper (500 sheets)",
      description: "80 GSM, Copier grade",
      pricePerUnit: 350,
      quantity: 200,
      reorderPoint: 50,
      status: StockStatus.IN_STOCK,
      categoryId: categories[1].id,
      supplierId: supplier2.id,
    },
    {
      sku: "OFFICE-002",
      name: "Ballpoint Pen Box (12 pcs)",
      description: "Blue ink, medium nib",
      pricePerUnit: 120,
      quantity: 8,
      reorderPoint: 20,
      status: StockStatus.LOW_STOCK,
      categoryId: categories[1].id,
      supplierId: supplier2.id,
    },
    {
      sku: "FURN-001",
      name: "Ergonomic Office Chair",
      description: "Lumbar support, adjustable height",
      pricePerUnit: 12000,
      quantity: 10,
      reorderPoint: 3,
      status: StockStatus.IN_STOCK,
      categoryId: categories[2].id,
      supplierId: supplier2.id,
    },
  ];

  for (const item of stockItems) {
    await prisma.stockItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }

  console.log(`✅ Created ${stockItems.length} stock items`);

  // ── Sample Transactions ─────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      {
        actionType: "SALE",
        quantityChanged: -2,
        previousQty: 27,
        newQty: 25,
        details: "Sold to customer order #1042",
        userId: staff.id,
        stockItemSku: "ELEC-001",
      },
      {
        actionType: "RESTOCK",
        quantityChanged: 100,
        previousQty: 100,
        newQty: 200,
        details: "Restocked from OfficeWorld — Invoice #OW-9921",
        userId: manager.id,
        stockItemSku: "OFFICE-001",
      },
      {
        actionType: "SALE",
        quantityChanged: -7,
        previousQty: 10,
        newQty: 3,
        details: "Bulk sale to TechCo",
        userId: staff.id,
        stockItemSku: "ELEC-002",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created sample transactions");

  // ── Sample Notifications ────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        type: "LOW_STOCK",
        message: "Logitech Wireless Mouse (ELEC-002) is below reorder point (3 left).",
        link: "/inventory/ELEC-002",
        userId: admin.id,
      },
      {
        type: "OUT_OF_STOCK",
        message: "Mechanical Keyboard (ELEC-003) is out of stock.",
        link: "/inventory/ELEC-003",
        userId: admin.id,
      },
      {
        type: "LOW_STOCK",
        message: "Ballpoint Pen Box (OFFICE-002) is below reorder point (8 left).",
        link: "/inventory/OFFICE-002",
        userId: manager.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created sample notifications");

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────");
  console.log("Login credentials:");
  console.log("  ADMIN:   admin@stocksense.com   / Admin@123");
  console.log("  MANAGER: manager@stocksense.com / Manager@123");
  console.log("  STAFF:   staff@stocksense.com   / Staff@123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
