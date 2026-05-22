"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, { icon: string; color: string; bg: string }> = {
  LOW_STOCK: { icon: "⚠", color: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.15)]" },
  OUT_OF_STOCK: { icon: "✕", color: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.15)]" },
  RESTOCK: { icon: "✓", color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.15)]" },
  DEFAULT: { icon: "ℹ", color: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.15)]" },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.slice(0, 5));
          setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getTypeConfig = (type: string) => typeIcons[type] || typeIcons.DEFAULT;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-overlay)] transition relative"
        data-testid="notification-bell"
      >
        <Bell className={cn("w-[18px] h-[18px] text-[var(--text-secondary)] transition-transform duration-300 group-hover:text-[var(--text-primary)]", unreadCount > 0 && "animate-[shake_2s_ease-in-out_infinite]")} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[var(--brand-primary)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-[0_0_8px_var(--brand-primary)]"
            data-testid="notification-badge"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[var(--bg-elevated)] border-[var(--border-strong)] shadow-lg"
        data-testid="notification-dropdown"
      >
        <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
          <p className="font-display font-semibold text-sm text-[var(--text-primary)]">Notifications</p>
        </div>
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-[var(--text-muted)] text-sm" data-testid="notification-empty">
            No notifications
          </div>
        ) : (
          notifications.map((n, index) => {
            const config = getTypeConfig(n.type);
            return (
              <DropdownMenuItem
                key={n.id}
                className="group/item flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-[var(--bg-overlay)] focus:bg-[var(--bg-overlay)] animate-stagger-in relative overflow-hidden"
                data-testid={`notification-item-${index}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                data-notification-id={n.id}
                data-notification-read={n.isRead}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                  if (n.link) router.push(n.link);
                }}
              >
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`text-xs ${config.color}`}>{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-2 shrink-0 shadow-[0_0_8px_var(--brand-primary)] animate-pulse-dot" data-testid="notification-unread-dot" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
        <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
            onClick={() => router.push("/notifications")}
            data-testid="notification-view-all"
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
