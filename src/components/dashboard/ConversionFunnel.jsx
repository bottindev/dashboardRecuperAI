import { fmtInt } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const steps = [
  { key: "total", label: "Total Atendimentos", color: "bg-sky" },
  { key: "negotiating", label: "Em Negociacao", color: "bg-sky/70" },
  { key: "converted", label: "Convertidos", color: "bg-emerald" },
];

export function ConversionFunnel({ totals }) {
  const data = [
    { ...steps[0], value: totals.totalConversations },
    {
      ...steps[1],
      value: totals.totalConversations - totals.totalCancelled,
    },
    { ...steps[2], value: totals.totalConverted },
  ];

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">
        Funil de Conversao
      </h3>
      <div className="space-y-3 py-4">
        {data.map((step, i) => {
          const pct = (step.value / max) * 100;
          return (
            <div key={step.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">{step.label}</span>
                <span className="font-mono font-semibold text-foreground">
                  {fmtInt(step.value)}
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className={cn("h-full rounded-md transition-all duration-700", step.color)}
                  style={{
                    width: `${pct}%`,
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
