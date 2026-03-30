import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
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
  investimento: { label: "Investimento", color: "#F59E0B" },
};

export function RevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Receita vs Investimento
        </h3>
        <EmptyState icon={BarChart3} message="Sem dados para o periodo." className="py-8" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Receita vs Investimento
      </h3>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
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
          <Bar
            dataKey="receita"
            fill="#0EA5E9"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="investimento"
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
