import { fmt, fmtInt } from "@/utils/formatters";

export function RoiSummary({ totals }) {
  const items = [
    { label: "Investimento", value: `R$ ${fmt(totals.totalInvestment)}`, color: "text-amber" },
    { label: "Receita Recuperada", value: `R$ ${fmt(totals.totalRecovered)}`, color: "text-sky" },
    { label: "Lucro Gerado", value: `R$ ${fmt(totals.profit)}`, color: "text-emerald" },
    { label: "ROI", value: `${fmtInt(totals.roi)}%`, color: "text-violet" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm border-l-4 border-l-sky">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map(({ label, value, color }) => (
          <div key={label} className="text-center lg:text-left">
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {label}
            </div>
            <div className={`mt-1 text-2xl font-bold font-mono tracking-tight ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
