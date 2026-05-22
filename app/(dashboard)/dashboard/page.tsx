"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/lib/button-variants";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, XCircle, Activity, Plus, BarChart3, Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ACTION_TYPE_CONFIG } from "@/lib/utils/stock-status";
import { StatsSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import type { DashboardStats } from "@/types/stock";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-mono font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--text-secondary)] mb-1">
        {label ? new Date(label).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-mono font-medium text-[var(--brand-primary)]">
          {p.value} transactions
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Welcome back to StockSense</p>
        </div>
        <StatsSkeleton />
        <div data-testid="loading-spinner"><TableSkeleton rows={5} cols={4} /></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total SKUs", value: stats.totalSKUs, icon: Package, color: "var(--brand-primary)", bg: "rgba(59, 130, 246,0.1)", testId: "stat-total-skus" },
    { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertTriangle, color: "var(--warning)", bg: "rgba(245,158,11,0.1)", testId: "stat-low-stock" },
    { label: "Out of Stock", value: stats.outOfStockItems, icon: XCircle, color: "var(--danger)", bg: "rgba(239,68,68,0.1)", testId: "stat-out-of-stock" },
    { label: "Transactions Today", value: stats.transactionsToday, icon: Activity, color: "var(--info)", bg: "rgba(59,130,246,0.1)", testId: "stat-transactions-today" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8" data-testid="dashboard-page">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-strong)] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--brand-secondary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]" data-testid="dashboard-title">
              {greeting}, <span className="gradient-text">{session?.user?.name || "User"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 max-w-xl">
              Here&apos;s what&apos;s happening with your inventory today. You have <strong className="text-[var(--brand-primary)] font-mono">{stats.lowStockItems} items</strong> running low and need your attention.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/inventory/new" className={buttonVariants({ size: "sm", className: "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] border-none shadow-[0_0_15px_rgba(59, 130, 246,0.2)] hover:shadow-[0_0_20px_rgba(59, 130, 246,0.4)]" })} data-testid="quick-add-stock">
              <Plus className="w-4 h-4 mr-1" /> Add Stock
            </Link>
            <Link href="/reports" className={buttonVariants({ size: "sm", variant: "outline", className: "glass hover:bg-[var(--bg-overlay)]" })} data-testid="quick-reports">
              <BarChart3 className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform" /> Reports
            </Link>
            <Link href="/notifications" className={buttonVariants({ size: "sm", variant: "outline", className: "glass hover:bg-[var(--bg-overlay)] group" })} data-testid="quick-alerts">
              <Bell className="w-4 h-4 mr-1 group-hover:animate-[shake_2s_ease-in-out_infinite] origin-top" /> Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger-in" data-testid="stats-cards">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="group card-hover-glow bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-brand)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            data-testid={card.testId}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: card.color }} />
            
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              
              {/* Mini Sparkline mock */}
              <svg className="w-12 h-6 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={index % 2 === 0 ? "M0 15 L10 10 L20 12 L30 5 L40 8" : "M0 5 L10 12 L20 8 L30 15 L40 10"} stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-display font-bold text-[var(--text-primary)] leading-none" data-testid={`${card.testId}-value`}>
                {card.value}
              </p>
            </div>
            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mt-2 font-medium">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stock by Category — 60% */}
        <div className="lg:col-span-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-0 overflow-hidden group hover:border-[var(--border-strong)] transition-colors" data-testid="chart-stock-by-category">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">Inventory Distribution</h3>
          </div>
          <div className="h-64 p-6 pt-4 relative">
            <div className="absolute inset-0 grid-dots opacity-[0.15] pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stockByCategory}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalQty" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} name="Total Quantity" opacity={0.9} />
                <Bar dataKey="count" fill="var(--brand-secondary)" radius={[4, 4, 0, 0]} name="Items" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Volume — 40% */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-0 overflow-hidden group hover:border-[var(--border-strong)] transition-colors" data-testid="chart-transaction-trend">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">Transaction Volume</h3>
          </div>
          <div className="h-64 p-6 pt-4 relative">
            <div className="absolute inset-0 grid-dots opacity-[0.15] pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.transactionTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} />
                <Tooltip content={<TrendTooltip />} />
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="var(--brand-primary)" fill="url(#colorTrend)" strokeWidth={2} name="Transactions" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden" data-testid="recent-transactions">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
          <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm", className: "hover:bg-[var(--bg-overlay)]" })} data-testid="view-all-transactions">View All →</Link>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full text-sm" data-testid="recent-transactions-table">
            <thead>
              <tr className="border-b border-[var(--border-strong)] bg-[rgba(255,255,255,0.01)]">
                <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)]">Item</th>
                <th className="text-left py-3 px-2 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)]">Action</th>
                <th className="text-left py-3 px-2 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)]">Qty Change</th>
                <th className="text-left py-3 px-2 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)]">User</th>
                <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)]">Time</th>
              </tr>
            </thead>
            <tbody className="animate-stagger-in">
              {stats.recentTransactions.map((t, index) => {
                const config = ACTION_TYPE_CONFIG[t.actionType] || { label: t.actionType, color: "text-[var(--text-secondary)]", bgColor: "bg-[var(--bg-overlay)]" };
                return (
                  <tr 
                    key={t.id} 
                    className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 relative" 
                    data-testid={`transaction-row-${index}`}
                  >
                    <td className="py-3.5 px-6 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                      <Link href={`/inventory/${t.stockItemSku}`} className="group-hover/row:text-[var(--brand-primary)] transition-colors font-medium text-[var(--text-primary)]" data-testid={`transaction-item-${index}`}>
                        {t.stockItem?.name || t.stockItemSku}
                      </Link>
                      <span className="text-xs text-[var(--text-muted)] ml-1.5 font-mono">({t.stockItemSku})</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${config.color} ${config.bgColor} border border-[currentColor] border-opacity-20 shadow-sm`} data-testid={`transaction-action-${index}`}>
                        {config.icon && <span className="text-[10px] group-hover/row:animate-pulse">{config.icon}</span>}
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono font-medium" data-testid={`transaction-qty-${index}`}>
                      <span className={cn(
                        "inline-flex items-center gap-1",
                        t.quantityChanged >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                      )}>
                        {t.quantityChanged > 0 ? "+" : ""}{t.quantityChanged}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-[var(--text-secondary)]">{t.user?.username}</td>
                    <td className="py-3.5 px-6 text-[var(--text-muted)] text-xs font-mono text-right">{formatDate(t.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
