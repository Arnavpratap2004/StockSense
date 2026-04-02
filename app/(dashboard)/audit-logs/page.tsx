"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";

interface AuditLog {
  id: string; action: string; targetEntity: string; targetId: string;
  changedFields: unknown; timestamp: string; user: { id: string; username: string };
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700", UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700", ARCHIVE: "bg-gray-50 text-gray-700",
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

  const getActionColor = (action: string) => {
    for (const [key, val] of Object.entries(actionColors)) {
      if (action.includes(key)) return val;
    }
    return "bg-gray-50 text-gray-700";
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="audit-logs-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="audit-logs-title">Audit Logs</h1>
          <p className="text-muted-foreground">System activity trail</p>
        </div>
        <Button variant="outline" onClick={exportCSV} data-testid="export-audit-csv"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      <Card data-testid="audit-filters">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v ?? ""); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48" data-testid="audit-action-filter"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="ARCHIVE">Archive</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-40" data-testid="audit-start-date" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-40" data-testid="audit-end-date" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div data-testid="loading-spinner"><TableSkeleton /></div>
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs" />
      ) : (
        <>
          <Card data-testid="audit-logs-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="audit-logs-table">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Entity</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition" data-testid={`audit-row-${i}`}>
                      <td className="p-3 text-xs whitespace-nowrap">{formatDate(log.timestamp)}</td>
                      <td className="p-3 font-medium">{log.user.username}</td>
                      <td className="p-3"><Badge variant="outline" className={`${getActionColor(log.action)} text-xs`} data-testid={`audit-action-${i}`}>{log.action}</Badge></td>
                      <td className="p-3">{log.targetEntity}</td>
                      <td className="p-3 font-mono text-xs">{log.targetId}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[300px] truncate">{log.changedFields ? JSON.stringify(log.changedFields).slice(0, 80) + "..." : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center justify-end gap-2" data-testid="audit-pagination">
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="audit-page-prev"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)} data-testid="audit-page-next"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </>
      )}
    </div>
  );
}
