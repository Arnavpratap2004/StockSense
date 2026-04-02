"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, XCircle, ArrowLeftRight, Plus, BarChart3, Bell } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ACTION_TYPE_CONFIG } from "@/lib/utils/stock-status";
import { StatsSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import type { DashboardStats } from "@/types/stock";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to StockSense</p>
        </div>
        <StatsSkeleton />
        <div data-testid="loading-spinner"><TableSkeleton rows={5} cols={4} /></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total SKUs", value: stats.totalSKUs, icon: Package, color: "from-[#1E3A5F] to-[#2A4F7F]", iconColor: "text-blue-100", testId: "stat-total-skus" },
    { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertTriangle, color: "from-amber-500 to-amber-600", iconColor: "text-amber-100", testId: "stat-low-stock" },
    { label: "Out of Stock", value: stats.outOfStockItems, icon: XCircle, color: "from-red-500 to-red-600", iconColor: "text-red-100", testId: "stat-out-of-stock" },
    { label: "Transactions Today", value: stats.transactionsToday, icon: ArrowLeftRight, color: "from-[#2DD4BF] to-emerald-500", iconColor: "text-emerald-100", testId: "stat-transactions-today" },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to StockSense</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/new" className={buttonVariants({ size: "sm" }) + " bg-[#1E3A5F] hover:bg-[#152C4A]"} data-testid="quick-add-stock">
            <Plus className="w-4 h-4 mr-1" /> Add Stock
          </Link>
          <Link href="/reports" className={buttonVariants({ size: "sm", variant: "outline" })} data-testid="quick-reports">
            <BarChart3 className="w-4 h-4 mr-1" /> Reports
          </Link>
          <Link href="/notifications" className={buttonVariants({ size: "sm", variant: "outline" })} data-testid="quick-alerts">
            <Bell className="w-4 h-4 mr-1" /> Alerts
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-cards">
        {statCards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow" data-testid={card.testId}>
            <CardContent className={`p-5 bg-gradient-to-br ${card.color} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">{card.label}</p>
                  <p className="text-3xl font-bold mt-1" data-testid={`${card.testId}-value`}>{card.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md" data-testid="chart-stock-by-category">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="totalQty" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="Total Quantity" />
                  <Bar dataKey="count" fill="#2DD4BF" radius={[4, 4, 0, 0]} name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md" data-testid="chart-transaction-trend">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Volume (30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.transactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} interval={4} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="#2DD4BF" fill="url(#colorTrend)" strokeWidth={2} name="Transactions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-md" data-testid="recent-transactions">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })} data-testid="view-all-transactions">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="recent-transactions-table">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                  <th className="pb-3 font-medium text-muted-foreground">Qty Change</th>
                  <th className="pb-3 font-medium text-muted-foreground">User</th>
                  <th className="pb-3 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((t, index) => {
                  const config = ACTION_TYPE_CONFIG[t.actionType] || { label: t.actionType, color: "text-gray-700", bgColor: "bg-gray-50" };
                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition" data-testid={`transaction-row-${index}`}>
                      <td className="py-3">
                        <Link href={`/inventory/${t.stockItemSku}`} className="hover:underline font-medium" data-testid={`transaction-item-${index}`}>
                          {t.stockItem?.name || t.stockItemSku}
                        </Link>
                        <span className="text-xs text-muted-foreground ml-1">({t.stockItemSku})</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${config.color} ${config.bgColor}`} data-testid={`transaction-action-${index}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3" data-testid={`transaction-qty-${index}`}>
                        <span className={t.quantityChanged >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {t.quantityChanged > 0 ? "+" : ""}{t.quantityChanged}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{t.user?.username}</td>
                      <td className="py-3 text-muted-foreground text-xs">{formatDate(t.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
