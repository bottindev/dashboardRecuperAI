import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { fmt, fmtInt, fmtMonth } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { key: "name", label: "Cliente", align: "left" },
  { key: "total_conversations", label: "Atend.", align: "right" },
  { key: "converted_conversations", label: "Conv.", align: "right" },
  { key: "conversion_rate", label: "Taxa", align: "right" },
  { key: "total_recovered_value", label: "Receita", align: "right" },
  { key: "service_investment", label: "Investim.", align: "right" },
  { key: "profit", label: "Lucro", align: "right" },
  { key: "roi_percent", label: "ROI", align: "right" },
  { key: "avg_ticket", label: "Ticket", align: "right" },
];

export function PerformanceTable({ metrics, clients }) {
  const [sortKey, setSortKey] = useState("total_recovered_value");
  const [sortDesc, setSortDesc] = useState(true);

  const sortedMonths = [...new Set(metrics.map((m) => m.month))].sort();
  const latestMonth = sortedMonths.at(-1) ?? null;
  const latest = metrics.filter((m) => m.month === latestMonth);

  const rows = useMemo(() => {
    const mapped = latest.map((m) => ({
      ...m,
      name: clients.find((c) => c.id === m.client_id)?.name ?? "—",
    }));
    return mapped.sort((a, b) => {
      const va = Number(a[sortKey]) || 0;
      const vb = Number(b[sortKey]) || 0;
      if (sortKey === "name") {
        return sortDesc
          ? (b.name || "").localeCompare(a.name || "")
          : (a.name || "").localeCompare(b.name || "");
      }
      return sortDesc ? vb - va : va - vb;
    });
  }, [latest, clients, sortKey, sortDesc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Performance por Cliente
          {latestMonth && (
            <span className="ml-2 text-xs font-normal text-text-muted">
              {fmtMonth(latestMonth)}
            </span>
          )}
        </h3>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-text-muted">
          Nenhum dado disponivel para o periodo selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "cursor-pointer select-none whitespace-nowrap text-[11px] uppercase tracking-wider hover:text-foreground",
                      col.align === "right" && "text-right"
                    )}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => {
                const convRate = Number(m.conversion_rate || 0);
                const roi = Number(m.roi_percent || 0);
                return (
                  <TableRow key={m.id} className="even:bg-muted/30">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {fmtInt(m.total_conversations)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald">
                      {fmtInt(m.converted_conversations)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono text-[11px]",
                          convRate >= 25
                            ? "bg-emerald/10 text-emerald"
                            : "bg-amber/10 text-amber"
                        )}
                      >
                        {convRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sky">
                      R$ {fmt(m.total_recovered_value)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-text-muted">
                      R$ {fmt(m.service_investment)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald">
                      R$ {fmt(m.profit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono text-[11px] font-bold",
                          roi >= 500
                            ? "bg-emerald/10 text-emerald"
                            : "bg-sky/10 text-sky"
                        )}
                      >
                        {fmtInt(roi)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {fmt(m.avg_ticket)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
