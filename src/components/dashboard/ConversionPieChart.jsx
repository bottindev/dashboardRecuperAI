import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { fmtInt } from "@/utils/formatters";

const chartConfig = {
  convertidos: { label: "Convertidos", color: "#10B981" },
  cancelados: { label: "Cancelados", color: "#EF4444" },
  outros: { label: "Outros", color: "#9CA3AF" },
};

const CHART_COLORS = ["#10B981", "#EF4444", "#9CA3AF"];

export function ConversionPieChart({ totals }) {
  const others =
    totals.totalConversations - totals.totalConverted - totals.totalCancelled;

  const data = [
    { name: "convertidos", value: totals.totalConverted },
    { name: "cancelados", value: totals.totalCancelled },
    { name: "outros", value: Math.max(0, others) },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">
        Distribuicao de Conversas
      </h3>
      <ChartContainer config={chartConfig} className="mx-auto h-64 w-full max-w-xs">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => fmtInt(value)}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i]} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy - 4}
                      className="fill-foreground text-2xl font-bold font-mono"
                    >
                      {totals.convRate.toFixed(1)}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy + 16}
                      className="fill-muted-foreground text-[10px]"
                    >
                      taxa conv.
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
