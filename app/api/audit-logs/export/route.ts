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

    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { username: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 5000,
    });

    const headers = ["ID", "Timestamp", "User", "Action", "Target Entity", "Target ID", "Details"];
    const rows = logs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.user.username,
      log.action,
      log.targetEntity,
      log.targetId,
      JSON.stringify(log.changedFields || {}),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/audit-logs/export error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
