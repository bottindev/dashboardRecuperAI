import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fmtMonth, fmt } from "@/utils/formatters";

export function CompanyTrendChart({ data }) {
  const chartData = data.map((d) => ({
    ...d,
    label: fmtMonth(d.month),
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-foreground">
        Receita Mensal
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gReceitaCompany" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gMrrCompany" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value, name) => [`R$ ${fmt(value)}`, name]}
            />
            <Area
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#gReceitaCompany)"
            />
            <Area
              type="monotone"
              dataKey="mrr"
              name="MRR"
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="url(#gMrrCompany)"
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
