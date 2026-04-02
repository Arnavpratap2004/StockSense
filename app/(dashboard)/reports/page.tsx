"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText, Package, TrendingUp, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Category { id: string; name: string; }

const reportTypes = [
  { type: "LOW_STOCK", label: "Low Stock Report", icon: Package, description: "Items below reorder point", color: "from-amber-500 to-orange-500" },
  { type: "TRANSACTION_HISTORY", label: "Transaction History", icon: FileText, description: "Full transaction log", color: "from-blue-500 to-indigo-500" },
  { type: "STOCK_LEVELS", label: "Stock Levels", icon: BarChart3, description: "Current stock overview", color: "from-emerald-500 to-teal-500" },
  { type: "SALES_SUMMARY", label: "Sales Summary", icon: TrendingUp, description: "Revenue analysis", color: "from-purple-500 to-pink-500" },
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
      headStyles: { fillColor: [30, 58, 95] },
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

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      <div>
        <h1 className="text-2xl font-bold" data-testid="reports-title">Reports</h1>
        <p className="text-muted-foreground">Generate and export inventory reports</p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="report-type-cards">
        {reportTypes.map((rt) => (
          <Card
            key={rt.type}
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedType === rt.type ? "ring-2 ring-[#1E3A5F] shadow-lg" : ""}`}
            onClick={() => setSelectedType(rt.type)}
            data-testid={`report-type-${rt.type.toLowerCase()}`}
            data-selected={selectedType === rt.type}
          >
            <CardContent className={`p-5 bg-gradient-to-br ${rt.color} text-white rounded-xl`}>
              <rt.icon className="w-8 h-8 mb-2 opacity-80" />
              <p className="font-semibold">{rt.label}</p>
              <p className="text-xs text-white/70 mt-1">{rt.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Generate */}
      <Card data-testid="report-filters">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="report-start-date" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="report-end-date" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm text-muted-foreground">Category</label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : (v ?? ""))}>
                <SelectTrigger data-testid="report-category-filter"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Button onClick={generateReport} disabled={generating || !selectedType} className="bg-[#1E3A5F] hover:bg-[#152C4A]" data-testid="generate-report-btn">
              {generating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" data-testid="loading-spinner" /> Generating...</> : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <Card data-testid="report-preview">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Report Preview ({reportData.length} rows)</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportPDF} data-testid="export-pdf-btn"><Download className="w-4 h-4 mr-1" /> PDF</Button>
                <Button variant="outline" onClick={exportExcel} data-testid="export-excel-btn"><Download className="w-4 h-4 mr-1" /> Excel</Button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm" data-testid="report-preview-table">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b bg-muted/50">
                    {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                      <th key={key} className="text-left p-2 font-medium text-muted-foreground text-xs">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b last:border-0" data-testid={`report-row-${i}`}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-2 text-xs">{typeof val === "number" && val > 100 ? formatCurrency(val) : String(val ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <Card data-testid="saved-reports">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Previously Generated Reports</h3>
            <div className="space-y-2">
              {savedReports.slice(0, 10).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition" data-testid={`saved-report-${i}`}>
                  <div>
                    <p className="font-medium text-sm">{reportTypes.find((rt) => rt.type === r.reportType)?.label || r.reportType}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.generatedDate)} · by {r.user?.username || "Unknown"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
