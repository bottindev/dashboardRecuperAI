import { fmt, fmtInt } from "@/utils/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function ReportContent({ metrics, clients, monthLabel }) {
  const totalRecovered = metrics.reduce(
    (a, m) => a + Number(m.total_recovered_value || 0),
    0
  );
  const totalInvestment = metrics.reduce(
    (a, m) => a + Number(m.service_investment || 0),
    0
  );
  const totalConversations = metrics.reduce(
    (a, m) => a + Number(m.total_conversations || 0),
    0
  );
  const totalConverted = metrics.reduce(
    (a, m) => a + Number(m.converted_conversations || 0),
    0
  );
  const profit = totalRecovered - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const convRate =
    totalConversations > 0
      ? (totalConverted / totalConversations) * 100
      : 0;

  // Build chart data by month
  const months = [...new Set(metrics.map((m) => m.month))].sort();
  const chartData = months.map((month) => {
    const rows = metrics.filter((m) => m.month === month);
    const sum = (key) => rows.reduce((a, b) => a + Number(b[key] || 0), 0);
    const label = new Date(month + "T12:00:00").toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    return { month: label, receita: sum("total_recovered_value") };
  });

  const kpis = [
    { label: "Receita Recuperada", value: `R$ ${fmt(totalRecovered)}`, color: "text-sky-600" },
    { label: "Lucro", value: `R$ ${fmt(profit)}`, color: "text-emerald-600" },
    { label: "ROI", value: `${fmtInt(roi)}%`, color: "text-violet-600" },
    { label: "Taxa Conversao", value: `${convRate.toFixed(1)}%`, color: "text-amber-600" },
  ];

  return (
    <div className="print-content space-y-8">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">
          RecuperAI — Relatorio Mensal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{monthLabel}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4 text-center"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className={`mt-1 text-xl font-bold font-mono ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Evolucao da Receita
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                }
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#0EA5E9"
                fill="#0EA5E9"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <h3 className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Performance por Cliente
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left font-medium">Cliente</th>
              <th className="px-4 py-2 text-right font-medium">Atend.</th>
              <th className="px-4 py-2 text-right font-medium">Conv.</th>
              <th className="px-4 py-2 text-right font-medium">Receita</th>
              <th className="px-4 py-2 text-right font-medium">ROI</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id} className="border-b border-border/50">
                <td className="px-4 py-2 font-medium">
                  {m.client_name || "—"}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {fmtInt(m.total_conversations)}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {fmtInt(m.converted_conversations)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-sky-600">
                  R$ {fmt(m.total_recovered_value)}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {fmtInt(m.roi_percent)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
