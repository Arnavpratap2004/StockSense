"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Search } from "lucide-react";
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

export default function TopBar({ onMenuClick, onSearchClick }: TopBarProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "STAFF";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 gap-4" data-testid="topbar">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          data-testid="topbar-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2 text-muted-foreground h-9 w-64 justify-start px-3 text-sm"
          onClick={onSearchClick}
          data-testid="topbar-search-btn"
        >
          <Search className="w-4 h-4" />
          <span>Search inventory...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-muted transition"
            data-testid="topbar-user-menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2DD4BF] flex items-center justify-center text-white text-xs font-bold" data-testid="user-avatar">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none" data-testid="topbar-username">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5" data-testid="topbar-role">
                {userRole.toLowerCase()}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => window.location.href = '/account'} data-testid="menu-account">
              My Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-600"
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
