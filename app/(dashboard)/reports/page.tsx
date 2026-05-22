"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText, Package, TrendingUp, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Category { id: string; name: string; }

const reportTypes = [
  { type: "LOW_STOCK", label: "Low Stock Report", icon: Package, description: "Items below reorder point", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { type: "TRANSACTION_HISTORY", label: "Transaction History", icon: FileText, description: "Full transaction log", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { type: "STOCK_LEVELS", label: "Stock Levels", icon: BarChart3, description: "Current stock overview", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  { type: "SALES_SUMMARY", label: "Sales Summary", icon: TrendingUp, description: "Revenue analysis", color: "#A78BFA", bg: "rgba(139,92,246,0.1)" },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [reportData, setReportData] = useState<Record<string, unknown>[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<Array<{ id: string; reportType: string; generatedDate: string; user?: { username: string } }>>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data); });
    fetch("/api/reports").then((r) => r.json()).then((d) => { if (d.success) setSavedReports(d.data); });
  }, []);

  const generateReport = async () => {
    if (!selectedType) { toast.error("Select a report type"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, startDate, endDate, category: categoryFilter }),
      });
      const data = await res.json();
      if (data.success) {
        setReportData(data.data.dataContent as Record<string, unknown>[]);
        toast.success("Report generated!");
        fetch("/api/reports").then((r) => r.json()).then((d) => { if (d.success) setSavedReports(d.data); });
      } else {
        toast.error(data.error);
      }
    } catch { toast.error("Failed to generate"); } finally { setGenerating(false); }
  };

  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`StockSense — ${reportTypes.find((r) => r.type === selectedType)?.label || "Report"}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    const keys = reportData.length > 0 ? Object.keys(reportData[0]) : [];
    autoTable(doc, {
      head: [keys],
      body: reportData.map((row) => keys.map((k) => String(row[k] ?? ""))),
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`stocksense-report-${selectedType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportExcel = () => {
    if (!reportData) return;
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `stocksense-report-${selectedType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const inputClasses = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]";

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]" data-testid="reports-title">Reports</h1>
        <p className="text-[var(--text-secondary)] text-sm">Generate and export inventory reports</p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger-in" data-testid="report-type-cards">
        {reportTypes.map((rt) => (
          <button
            key={rt.type}
            className={`group text-left bg-[var(--bg-surface)] border rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${
              selectedType === rt.type
                ? "border-[var(--brand-primary)] shadow-[0_0_20px_rgba(59, 130, 246,0.15)] ring-1 ring-[var(--brand-primary)]"
                : "border-[var(--border-subtle)] hover:border-[var(--border-brand)] hover:shadow-lg"
            }`}
            onClick={() => setSelectedType(rt.type)}
            data-testid={`report-type-${rt.type.toLowerCase()}`}
            data-selected={selectedType === rt.type}
          >
            {selectedType === rt.type && (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] to-transparent opacity-5 pointer-events-none" />
            )}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 ${selectedType === rt.type ? "scale-110 shadow-sm" : "group-hover:scale-110"}`} style={{ backgroundColor: rt.bg }}>
              <rt.icon className="w-6 h-6" style={{ color: rt.color }} />
            </div>
            <p className={`font-display font-semibold transition-colors ${selectedType === rt.type ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]"}`}>{rt.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{rt.description}</p>
          </button>
        ))}
      </div>

      {/* Filters + Generate */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4" data-testid="report-filters">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="report-start-date" className={`h-9 ${inputClasses}`} />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="report-end-date" className={`h-9 ${inputClasses}`} />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Category</label>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : (v ?? ""))}>
              <SelectTrigger data-testid="report-category-filter" className={`h-9 ${inputClasses}`}><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-strong)]"><SelectItem value="all">All</SelectItem>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <Button 
            onClick={generateReport} 
            disabled={generating || !selectedType} 
            data-testid="generate-report-btn" 
            className={`h-9 transition-all duration-300 ${generating || !selectedType ? "" : "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:shadow-[0_0_15px_rgba(59, 130, 246,0.3)] hover:-translate-y-0.5 border-none text-white font-medium"}`}
          >
            {generating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" data-testid="loading-spinner" /> Generating...</> : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl animate-slide-in overflow-hidden" data-testid="report-preview">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">Report Preview <span className="text-[var(--text-muted)] font-normal ml-1">({reportData.length} rows)</span></h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportPDF} data-testid="export-pdf-btn" className="border-[rgba(239,68,68,0.3)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--danger)] group"><Download className="w-4 h-4 mr-1 group-hover:-translate-y-0.5 transition-transform" /> PDF</Button>
              <Button variant="outline" onClick={exportExcel} data-testid="export-excel-btn" className="border-[rgba(34,197,94,0.3)] text-[var(--success)] hover:bg-[rgba(34,197,94,0.1)] hover:text-[var(--success)] group"><Download className="w-4 h-4 mr-1 group-hover:-translate-y-0.5 transition-transform" /> Excel</Button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 p-6 pt-4">
            <table className="w-full text-sm" data-testid="report-preview-table">
              <thead className="sticky top-0 bg-[var(--bg-elevated)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="text-left p-2 text-[11px] uppercase tracking-widest font-medium text-[var(--text-muted)]">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="animate-stagger-in">
                {reportData.slice(0, 50).map((row, i) => (
                  <tr key={i} className="group/row border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors duration-200 relative" data-testid={`report-row-${i}`}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-3 text-xs text-[var(--text-secondary)] font-mono relative">
                        {j === 0 && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />}
                        {typeof val === "number" && val > 100 ? formatCurrency(val) : String(val ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6" data-testid="saved-reports">
          <h3 className="text-base font-display font-semibold text-[var(--text-primary)] mb-4">Previously Generated Reports</h3>
          <div className="space-y-2 animate-stagger-in">
            {savedReports.slice(0, 10).map((r, i) => (
              <div key={r.id} className="group flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-brand)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden" data-testid={`saved-report-${i}`}>
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="pl-2">
                  <p className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">{reportTypes.find((rt) => rt.type === r.reportType)?.label || r.reportType}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{formatDate(r.generatedDate)} · by {r.user?.username || "Unknown"}</p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); toast.info("Report downloading..."); }}>
                  <Download className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
