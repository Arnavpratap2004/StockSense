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

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LOW_STOCK": return "⚠️";
      case "OUT_OF_STOCK": return "🔴";
      case "RESTOCK": return "✅";
      default: return "ℹ️";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition relative"
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in"
            data-testid="notification-badge"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" data-testid="notification-dropdown">
        <div className="px-3 py-2 border-b">
          <p className="font-semibold text-sm">Notifications</p>
        </div>
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-muted-foreground text-sm" data-testid="notification-empty">
            No notifications
          </div>
        ) : (
          notifications.map((n, index) => (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
              data-testid={`notification-item-${index}`}
              data-notification-id={n.id}
              data-notification-read={n.isRead}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id);
                if (n.link) router.push(n.link);
              }}
            >
              <span className="text-lg mt-0.5">{getNotificationIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" data-testid="notification-unread-dot" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <div className="px-3 py-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
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
