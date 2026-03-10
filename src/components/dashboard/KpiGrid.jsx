import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Receipt,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { fmt, fmtInt } from "@/utils/formatters";

export function KpiGrid({ totals, chartData }) {
  // Build sparkline data for each KPI from monthly chartData
  const sparkReceita = chartData.map((d) => ({ v: d.receita }));
  const sparkConversoes = chartData.map((d) => ({ v: d.conversoes }));
  const sparkAtendimentos = chartData.map((d) => ({ v: d.atendimentos }));
  const sparkLucro = chartData.map((d) => ({ v: d.lucro }));

  const kpis = [
    {
      title: "Receita Recuperada",
      icon: DollarSign,
      color: "sky",
      prefix: "R$",
      value: fmt(totals.totalRecovered),
      subtitle: totals.latestMonth
        ? new Date(totals.latestMonth + "T12:00:00").toLocaleDateString("pt-BR", { month: "long" })
        : "—",
      trend: totals.trendRecovered,
      chartData: sparkReceita,
    },
    {
      title: "ROI",
      icon: TrendingUp,
      color: "violet",
      value: fmtInt(totals.roi),
      suffix: "%",
      subtitle: "Retorno s/ investimento",
    },
    {
      title: "Conversoes",
      icon: CheckCircle,
      color: "emerald",
      value: fmtInt(totals.totalConverted),
      subtitle: `Taxa: ${totals.convRate.toFixed(1)}%`,
      chartData: sparkConversoes,
    },
    {
      title: "Ticket Medio",
      icon: Receipt,
      color: "amber",
      prefix: "R$",
      value: fmt(totals.avgTicket),
      subtitle: "Valor medio por recuperacao",
    },
    {
      title: "Atendimentos",
      icon: MessageCircle,
      color: "sky",
      value: fmtInt(totals.totalConversations),
      subtitle: "Total de conversas",
      trend: totals.trendConversations,
      chartData: sparkAtendimentos,
    },
    {
      title: "Lucro Gerado",
      icon: Wallet,
      color: "emerald",
      prefix: "R$",
      value: fmt(totals.profit),
      subtitle: "Receita - Investimento",
      chartData: sparkLucro,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, i) => (
        <KpiCard
          key={kpi.title}
          {...kpi}
          style={{
            animation: "fadeInUp 0.4s ease both",
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}
