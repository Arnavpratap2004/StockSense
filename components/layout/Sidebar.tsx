"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Users,
  ScrollText,
  UserCircle,
  X,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-dashboard" },
  { href: "/inventory", label: "Inventory", icon: Package, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-inventory" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-transactions" },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"], testId: "nav-reports" },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-notifications" },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"], testId: "nav-users" },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["ADMIN"], testId: "nav-audit-logs" },
  { href: "/account", label: "Account", icon: UserCircle, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-account" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" data-testid="sidebar-logo">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-4.5 h-4.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">StockSense</span>
              <span className="block text-[10px] text-sidebar-foreground/60 -mt-0.5 tracking-wide uppercase">SMS</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
            data-testid="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" data-testid="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                data-testid={item.testId}
                data-active={isActive}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5", isActive && "drop-shadow-sm")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border" data-testid="sidebar-user-info">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate" data-testid="sidebar-username">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 capitalize" data-testid="sidebar-role">
                {userRole.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
