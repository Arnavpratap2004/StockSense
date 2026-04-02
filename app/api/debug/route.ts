import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check environment variables
  checks.envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.substring(0, 20)}...)` : "❌ MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "❌ MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "❌ MISSING",
  };

  // 2. Check database connection
  try {
    const userCount = await prisma.user.count();
    checks.database = {
      status: "✅ Connected",
      userCount,
    };

    // 3. Check if demo users exist
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true, username: true },
      });
      checks.users = users;
    } else {
      checks.users = "❌ No users found — you need to run `npx prisma db seed`";
    }
  } catch (error: unknown) {
    checks.database = {
      status: "❌ Connection Failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return NextResponse.json(checks, { status: 200 });
}
