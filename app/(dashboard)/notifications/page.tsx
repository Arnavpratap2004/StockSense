"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, CheckCircle, Info, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";

interface Notification {
  id: string; type: string; message: string; link: string | null; isRead: boolean; createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    fetchNotifications();
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PUT" })));
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LOW_STOCK": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "OUT_OF_STOCK": return <XCircle className="w-5 h-5 text-red-500" />;
      case "RESTOCK": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  if (loading) return <div data-testid="loading-spinner"><TableSkeleton /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="notifications-title">Notifications</h1>
          <p className="text-muted-foreground">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={markAllRead} data-testid="mark-all-read-btn">Mark All Read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon={<Bell className="w-8 h-8 text-muted-foreground" />} />
      ) : (
        <>
          {unread.length > 0 && (
            <div data-testid="unread-section">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Unread ({unread.length})</h2>
              <div className="space-y-2">
                {unread.map((n, i) => (
                  <Card
                    key={n.id}
                    className="cursor-pointer hover:shadow-md transition border-l-4 border-l-blue-500"
                    onClick={() => { markAsRead(n.id); if (n.link) router.push(n.link); }}
                    data-testid={`unread-notification-${i}`}
                    data-notification-id={n.id}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      {getIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div data-testid="read-section">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Read ({read.length})</h2>
              <div className="space-y-2">
                {read.map((n, i) => (
                  <Card
                    key={n.id}
                    className="cursor-pointer hover:shadow-sm transition opacity-60"
                    onClick={() => { if (n.link) router.push(n.link); }}
                    data-testid={`read-notification-${i}`}
                    data-notification-id={n.id}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      {getIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
