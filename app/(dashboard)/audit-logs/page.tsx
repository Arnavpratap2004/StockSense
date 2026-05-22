"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";

interface AuditLog {
  id: string; action: string; targetEntity: string; targetId: string;
  changedFields: unknown; timestamp: string; user: { id: string; username: string };
}

const actionColors: Record<string, { color: string; bg: string }> = {
  CREATE: { color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]" },
  UPDATE: { color: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.1)]" },
  DELETE: { color: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]" },
  ARCHIVE: { color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-overlay)]" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (actionFilter && actionFilter !== "all") params.set("action", actionFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    try {
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) { setLogs(data.data); setTotalPages(data.pagination.totalPages); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [page, actionFilter, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    window.open("/api/audit-logs/export", "_blank");
  };

  const getActionStyle = (action: string) => {
    for (const [key, val] of Object.entries(actionColors)) {
      if (action.includes(key)) return val;
    }
    return actionColors.ARCHIVE;
  };

  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]";

  return (
    <div className="space-y-6 animate-fade-in" data-testid="audit-logs-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="audit-logs-title">Audit Logs</h1>
          <p className="text-[var(--text-secondary)] text-sm">System activity trail</p>
        </div>
        <Button variant="outline" onClick={exportCSV} data-testid="export-audit-csv" className="border-[var(--border-default)] group hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all duration-300">
          <Download className="w-4 h-4 mr-1 group-hover:animate-bounce transition-colors" /> Export CSV
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4" data-testid="audit-filters">
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v ?? ""); setPage(1); }}>
            <SelectTrigger className={`w-full md:w-48 h-9 ${inputClasses}`} data-testid="audit-action-filter"><SelectValue placeholder="All Actions" /></SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="ARCHIVE">Archive</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`w-full md:w-40 h-9 ${inputClasses}`} data-testid="audit-start-date" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`w-full md:w-40 h-9 ${inputClasses}`} data-testid="audit-end-date" />
        </div>
      </div>

      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton /></div>
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs" />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden" data-testid="audit-logs-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="audit-logs-table">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Timestamp</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">User</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Action</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Entity</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Target ID</th>
                    <th className="text-left p-3 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">Details</th>
                  </tr>
                </thead>
                <tbody className="animate-stagger-in">
                  {logs.map((log, i) => {
                    const style = getActionStyle(log.action);
                    return (
                      <tr key={log.id} className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 relative" data-testid={`audit-row-${i}`}>
                        <td className="p-3 text-xs font-mono whitespace-nowrap text-[var(--text-secondary)] relative">
                          <div className={cn("absolute left-0 top-0 bottom-0 w-[2px] opacity-30 group-hover/row:opacity-100 transition-opacity duration-300", style.bg.replace('bg-[', 'bg-').replace(']', ''))} style={{ backgroundColor: style.color.replace('text-[', '').replace(']', '') }} />
                          <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[2px] border-[var(--bg-surface)] z-10 hidden md:block" style={{ backgroundColor: style.color.replace('text-[', '').replace(']', '') }} />
                          <span className="md:pl-4 pl-2">{formatDate(log.timestamp)}</span>
                        </td>
                        <td className="p-3 font-medium text-[var(--text-primary)]">{log.user.username}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={cn(style.bg, style.color, "text-xs rounded-full border border-[currentColor] border-opacity-20 shadow-sm transition-transform duration-300 group-hover/row:scale-105")} data-testid={`audit-action-${i}`}>
                            <Activity className="w-3 h-3 mr-1 opacity-70" />
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">{log.targetEntity}</td>
                        <td className="p-3 font-mono text-xs text-[var(--brand-primary)]">{log.targetId}</td>
                        <td className="p-3 text-xs text-[var(--text-muted)] max-w-[300px] truncate font-mono">{log.changedFields ? JSON.stringify(log.changedFields).slice(0, 80) + "..." : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2" data-testid="audit-pagination">
            <span className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="audit-page-prev"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-[var(--border-default)]" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="audit-page-next"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </>
      )}
    </div>
  );
}
