import { useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const colorMap = {
  sky: { bg: "bg-sky/10", text: "text-sky", fill: "#0EA5E9" },
  violet: { bg: "bg-violet/10", text: "text-violet", fill: "#8B5CF6" },
  emerald: { bg: "bg-emerald/10", text: "text-emerald", fill: "#10B981" },
  amber: { bg: "bg-amber/10", text: "text-amber", fill: "#F59E0B" },
  danger: { bg: "bg-danger/10", text: "text-danger", fill: "#EF4444" },
};

export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  subtitle,
  icon: Icon,
  color = "sky",
  chartData,
  style,
}) {
  const gradientId = useId();
  const c = colorMap[color] || colorMap.sky;

  return (
    <div
      className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {title}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            c.bg
          )}
        >
          <Icon className={cn("h-4 w-4", c.text)} />
        </div>
      </div>

      {/* Value */}
      <div className="mt-2 flex items-baseline gap-1">
        {prefix && (
          <span className="text-sm text-text-muted">{prefix}</span>
        )}
        <span className="text-2xl font-bold tracking-tight font-mono">
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-text-muted">{suffix}</span>
        )}
      </div>

      {/* Sparkline */}
      {chartData && chartData.length > 1 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.fill} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={c.fill}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer: subtitle + trend */}
      <div className="mt-2 flex items-center justify-between">
        {subtitle && (
          <span className="text-[11px] text-text-muted">{subtitle}</span>
        )}
        {trend !== undefined && trend !== null && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
              trend >= 0
                ? "bg-emerald/10 text-emerald"
                : "bg-danger/10 text-danger"
            )}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
