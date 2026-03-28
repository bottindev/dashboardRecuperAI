import { DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fmt, fmtInt, fmtPct } from "@/utils/formatters";

function computeDelta(data, key) {
  if (!data || data.length < 2) return undefined;
  const curr = data[data.length - 1][key];
  const prev = data[data.length - 2][key];
  return prev > 0 ? ((curr - prev) / prev) * 100 : undefined;
}

export function CompanyKpiGrid({ overview, trendData }) {
  const taxaConversao =
    (overview.total_convertidos_global /
      Math.max(overview.total_conversas_global, 1)) *
    100;

  const mrrSparkline = trendData
    ? trendData.map((d) => ({ v: d.receita }))
    : undefined;

  const mrrDelta = computeDelta(trendData, "receita");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="MRR"
        value={fmt(overview.mrr)}
        prefix="R$"
        icon={DollarSign}
        color="sky"
        subtitle="Receita mensal recorrente"
        chartData={mrrSparkline}
        trend={mrrDelta}
      />
      <KpiCard
        title="Clientes Ativos"
        value={fmtInt(overview.total_clientes_ativos)}
        icon={Users}
        color="violet"
        subtitle="Com status ativo"
      />
      <KpiCard
        title="Leads"
        value={fmtInt(overview.leads_pipeline)}
        icon={Target}
        color="emerald"
        subtitle="No pipeline"
      />
      <KpiCard
        title="Taxa de Conversao"
        value={fmtPct(taxaConversao)}
        icon={TrendingUp}
        color="amber"
        subtitle="Conversas em agendamentos"
      />
    </div>
  );
}
