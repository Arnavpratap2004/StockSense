"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Users,
  Shield,
  UserCircle,
  LogOut,
  X,
  Boxes,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navGroups = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-dashboard" },
      { href: "/inventory", label: "Inventory", icon: Package, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-inventory" },
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-transactions" },
      { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"], testId: "nav-reports" },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-notifications" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"], testId: "nav-users" },
      { href: "/audit-logs", label: "Audit Logs", icon: Shield, roles: ["ADMIN"], testId: "nav-audit-logs" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/account", label: "My Account", icon: UserCircle, roles: ["ADMIN", "MANAGER", "STAFF"], testId: "nav-account" },
    ],
  },
];

const roleChipColors: Record<string, string> = {
  ADMIN: "bg-[var(--brand-glow)] text-[var(--brand-primary)] border-[var(--border-brand)]",
  MANAGER: "bg-[var(--info-bg)] text-[var(--info)] border-[rgba(59,130,246,0.2)]",
  STAFF: "bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-default)]",
};

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  const NavItem = ({ item }: { item: typeof navGroups[0]["items"][0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

    const linkContent = (
      <Link
        href={item.href}
        onClick={onClose}
        data-testid={item.testId}
        data-active={isActive}
        className={cn(
          "relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden group",
          isActive
            ? "text-[var(--brand-primary)] bg-[linear-gradient(90deg,var(--brand-glow)_0%,transparent_100%)] shadow-[inset_2px_0_0_0_var(--brand-primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]",
          collapsed && "justify-center px-0 shadow-none"
        )}
      >
        {/* Shimmer sweep animation on hover */}
        {!isActive && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        )}
        
        <item.icon
          className={cn(
            "w-[18px] h-[18px] shrink-0 transition-transform duration-300",
            isActive ? "text-[var(--brand-primary)] scale-110" : "opacity-70 group-hover:scale-110 group-hover:text-[var(--brand-primary)]"
          )}
          strokeWidth={1.5}
        />
        {!collapsed && (
          <span className="flex-1 truncate relative">
            {item.label}
          </span>
        )}
        
        {/* Active indicator dot */}
        {isActive && !collapsed && (
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] shadow-[0_0_8px_var(--brand-primary)] animate-pulse-dot" />
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          collapsed ? "w-16" : "w-60",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-between h-14 px-4 bg-[var(--bg-surface)] z-10">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" data-testid="sidebar-logo">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] p-[1px] flex items-center justify-center group-hover:shadow-glow transition-all duration-300 shrink-0">
              <div className="absolute inset-0 bg-[var(--bg-surface)] rounded-[7px] opacity-20 group-hover:opacity-0 transition-opacity" />
              <Boxes className="w-4 h-4 text-[var(--text-inverse)] relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]">
                  StockSense
                </span>
                <span className="block text-[10px] text-[var(--text-muted)] -mt-0.5 tracking-widest uppercase">
                  SMS
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]"
            onClick={onClose}
            data-testid="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        {/* Animated bottom border for logo */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-30 animate-gradient-shift" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" data-testid="sidebar-nav">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-3 mt-5 mb-2 first:mt-0 font-medium relative flex items-center">
                  <span>{group.label}</span>
                  <span className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-[var(--border-strong)] to-transparent opacity-50" />
                </p>
              )}
              {collapsed && <div className="mt-4 first:mt-0 mb-1 mx-auto w-6 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent opacity-50" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          <div className={cn("pt-2", !collapsed && "mt-4")}>
            {collapsed && <div className="mx-auto w-6 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent opacity-50 mb-2" />}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "group flex items-center gap-3 w-full h-10 px-3 rounded-lg text-sm font-medium transition-all duration-300 text-[var(--text-secondary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] hover:shadow-[inset_2px_0_0_0_var(--danger)]",
                collapsed && "justify-center px-0 shadow-none hover:shadow-none"
              )}
              data-testid="nav-logout"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0 opacity-70 group-hover:opacity-100 group-hover:animate-shake" strokeWidth={1.5} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>

        {/* Collapse toggle — desktop only */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-10 border-t border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* User info */}
        <div className="p-3 bg-[var(--bg-elevated)] bg-opacity-30 border-t border-[var(--border-subtle)] backdrop-blur-sm" data-testid="sidebar-user-info">
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-50 blur-[2px] animate-pulse-dot" />
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-xs font-bold text-[var(--text-inverse)] shrink-0 border border-[var(--border-brand)]">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-[var(--bg-surface)] rounded-full" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate" data-testid="sidebar-username">
                  {session?.user?.name || "User"}
                </p>
                <span
                  className={cn(
                    "inline-flex text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize mt-0.5",
                    roleChipColors[userRole] || roleChipColors.STAFF
                  )}
                  data-testid="sidebar-role"
                >
                  {userRole.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
