import { BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/EmptyState";

const chartConfig = {
  receita: { label: "Receita", color: "#0EA5E9" },
  lucro: { label: "Lucro", color: "#10B981" },
};

export function RevenueAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Evolucao da Receita
        </h3>
        <EmptyState icon={BarChart3} message="Sem dados para o periodo." className="py-8" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Evolucao da Receita
      </h3>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-[11px]"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-[11px]"
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="receita"
            stroke="#0EA5E9"
            strokeWidth={2}
            fill="url(#fillReceita)"
          />
          <Area
            type="monotone"
            dataKey="lucro"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#fillLucro)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

