"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, CheckCircle, Info, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";

interface Notification {
  id: string; type: string; message: string; link: string | null; isRead: boolean; createdAt: string;
}

const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  LOW_STOCK: { icon: AlertTriangle, color: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.15)]" },
  OUT_OF_STOCK: { icon: XCircle, color: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.15)]" },
  RESTOCK: { icon: CheckCircle, color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.15)]" },
  DEFAULT: { icon: Info, color: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.15)]" },
};

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

  const getConfig = (type: string) => typeConfig[type] || typeConfig.DEFAULT;

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  if (loading) return <div data-testid="loading-spinner"><TableSkeleton /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="notifications-title">Notifications</h1>
          <p className="text-[var(--text-secondary)] text-sm">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={markAllRead} data-testid="mark-all-read-btn" className="border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--border-brand)] transition-all duration-300 group">
            <CheckCircle className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon={<Bell className="w-8 h-8 text-[var(--text-muted)]" />} />
      ) : (
        <>
          {unread.length > 0 && (
            <div data-testid="unread-section">
              <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                Unread ({unread.length})
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </h2>
              <div className="space-y-3 animate-stagger-in">
                {unread.map((n, i) => {
                  const config = getConfig(n.type);
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.id}
                      className="group bg-[rgba(59, 130, 246,0.02)] border border-[var(--border-subtle)] border-l-[3px] border-l-[var(--brand-primary)] rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-[var(--bg-overlay)] hover:border-y-[var(--border-brand)] hover:border-r-[var(--border-brand)] hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                      onClick={() => { markAsRead(n.id); if (n.link) router.push(n.link); }}
                      data-testid={`unread-notification-${i}`}
                      data-notification-id={n.id}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)] rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                      <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-snug">{n.message}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 font-mono">{timeAgo(n.createdAt)}</p>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)] mt-1.5 shrink-0 animate-pulse-dot shadow-glow" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div data-testid="read-section">
              <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                Read ({read.length})
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </h2>
              <div className="space-y-3 animate-stagger-in" style={{ animationDelay: "0.2s" }}>
                {read.map((n, i) => {
                  const config = getConfig(n.type);
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.id}
                      className="group bg-transparent border border-[var(--border-subtle)] rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-[var(--bg-overlay)] hover:border-[var(--border-strong)] transition-all duration-300 opacity-60 hover:opacity-100"
                      onClick={() => { if (n.link) router.push(n.link); }}
                      data-testid={`read-notification-${i}`}
                      data-notification-id={n.id}
                    >
                      <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[15px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-snug">{n.message}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 font-mono">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
