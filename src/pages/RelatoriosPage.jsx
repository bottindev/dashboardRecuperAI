import { useState, useMemo } from "react";
import { Printer, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReportData } from "@/hooks/queries/useReportData";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { ReportContent } from "@/components/reports/ReportContent";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getDefaultMonth() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return { month: now.getMonth(), year: now.getFullYear() };
}

export default function RelatoriosPage() {
  const { clients, metrics, isPending, isError, error, refetch } = useReportData();
  const [monthVal, setMonthVal] = useState(getDefaultMonth);
  const [selectedClient, setSelectedClient] = useState("all");

  const monthStr = `${monthVal.year}-${String(monthVal.month + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTHS_PT[monthVal.month]} ${monthVal.year}`;

  const filtered = useMemo(() => {
    let data = metrics.filter((m) => m.month?.startsWith(monthStr));
    if (selectedClient !== "all") {
      data = data.filter((m) => m.client_id === selectedClient);
    }
    return data;
  }, [metrics, monthStr, selectedClient]);

  const handlePDF = () => {
    window.print();
  };

  const handleExcel = async () => {
    try {
      const { exportToExcel } = await import("@/services/exportExcel");
      await exportToExcel(filtered, clients, monthLabel);
      toast.success("Excel exportado com sucesso!");
    } catch (e) {
      toast.error("Erro ao exportar Excel: " + e.message);
    }
  };

  if (isPending) return <LoadingSkeleton />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Controls - hidden on print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MonthPicker value={monthVal} onChange={setMonthVal} />
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePDF}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExcel}>
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
            Excel
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileText} message="Nenhum dado encontrado para o periodo." />
        </div>
      ) : (
        <ReportContent
          metrics={filtered}
          clients={clients}
          monthLabel={monthLabel}
        />
      )}
    </div>
  );
}
