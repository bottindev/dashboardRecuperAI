import { DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fmt, fmtInt } from "@/utils/formatters";

export function CompanyKpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="MRR"
        value={fmt(kpis.mrr)}
        prefix="R$"
        icon={DollarSign}
        color="sky"
        subtitle="Receita mensal recorrente"
      />
      <KpiCard
        title="Clientes Ativos"
        value={fmtInt(kpis.activeClients)}
        icon={Users}
        color="violet"
        subtitle="Com status ativo"
      />
      <KpiCard
        title="Receita Total"
        value={fmt(kpis.receitaTotal)}
        prefix="R$"
        icon={TrendingUp}
        color="emerald"
        subtitle="Ultimo mes"
        trend={kpis.trendReceita}
      />
      <KpiCard
        title="LTV Medio"
        value={fmt(kpis.ltvMedio)}
        prefix="R$"
        icon={Target}
        color="amber"
        subtitle="Por cliente ativo"
      />
    </div>
  );
}
