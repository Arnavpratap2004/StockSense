import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/users": ["ADMIN"],
  "/audit-logs": ["ADMIN"],
  "/reports": ["ADMIN", "MANAGER"],
  "/inventory/new": ["ADMIN", "MANAGER"],
};

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inventory",
  "/transactions",
  "/notifications",
  "/account",
  "/reports",
  "/users",
  "/audit-logs",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const needsProtection = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!needsProtection) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;

  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    }
  }

  if (pathname.startsWith("/api/users") && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (pathname.startsWith("/api/audit-logs") && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
