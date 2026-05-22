"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "./NotificationBell";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/inventory/new": "Add Stock",
  "/transactions": "Transactions",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/users": "User Management",
  "/audit-logs": "Audit Logs",
  "/account": "My Account",
};

export default function TopBar({ onMenuClick, onSearchClick }: TopBarProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";
  const pathname = usePathname();

  // Derive page title and breadcrumb
  const matchedPath = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(p));
  const pageTitle = matchedPath ? pageTitles[matchedPath] : "StockSense";

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header
      className="sticky top-0 z-30 h-14 glass-strong border-b border-[var(--border-subtle)] flex items-center justify-between px-4 md:px-6 gap-4 relative overflow-hidden"
      data-testid="topbar"
    >
      {/* Animated bottom gradient border */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--border-brand)] to-transparent opacity-30" />
      {/* Left: Menu + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
          data-testid="topbar-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center gap-1.5 text-sm min-w-0 animate-stagger-in">
          <span className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer">StockSense</span>
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] opacity-50 select-none">/</span>
              <span
                className={
                  i === segments.length - 1
                    ? "text-[var(--brand-primary)] font-medium truncate relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[var(--brand-primary)] after:opacity-0 hover:after:opacity-100 after:transition-opacity cursor-default"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate cursor-pointer"
                }
              >
                {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")}
              </span>
            </span>
          ))}
        </div>

        <h1 className="md:hidden font-display font-semibold text-[var(--text-primary)] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Search pill */}
        <button
          className="hidden md:flex items-center gap-2 text-[var(--text-muted)] h-9 w-64 justify-start px-3 text-sm bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-brand)] hover:shadow-[inset_0_0_12px_rgba(59, 130, 246,0.05)] rounded-lg transition-all duration-300 group"
          onClick={onSearchClick}
          data-testid="topbar-search-btn"
        >
          <Search className="w-4 h-4 group-hover:text-[var(--brand-primary)] transition-colors" />
          <span className="text-xs group-hover:text-[var(--text-primary)] transition-colors">Search inventory...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border-default)] bg-[var(--bg-surface)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-muted)] group-hover:border-[var(--border-brand)] group-hover:text-[var(--text-secondary)] transition-colors shadow-sm animate-pulse-dot" style={{ animationDuration: "3s" }}>
            ⌘K
          </kbd>
        </button>

        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onSearchClick}
          data-testid="topbar-search-btn-mobile"
        >
          <Search className="w-4 h-4" />
        </Button>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-[var(--bg-overlay)] transition duration-200 focus:outline-none"
            data-testid="topbar-user-menu"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 blur-[3px] transition-opacity duration-300" />
              <div
                className="relative w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold overflow-hidden"
                data-testid="user-avatar"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-20" />
                <span className="relative z-10">{session?.user?.name?.[0]?.toUpperCase() || "U"}</span>
              </div>
            </div>
            <div className="hidden md:block text-left animate-stagger-in">
              <p className="text-sm font-medium leading-none text-[var(--text-primary)]" data-testid="topbar-username">
                {session?.user?.name || "User"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1" data-testid="topbar-role">
                {userRole}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[var(--bg-elevated)] border-[var(--border-strong)]"
          >
            <DropdownMenuItem
              onClick={() => (window.location.href = "/account")}
              data-testid="menu-account"
              className="hover:bg-[var(--bg-overlay)] cursor-pointer"
            >
              <UserCircle className="w-4 h-4 mr-2 text-[var(--text-secondary)]" />
              My Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[var(--danger)] hover:bg-[var(--danger-bg)] cursor-pointer"
              data-testid="menu-signout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
