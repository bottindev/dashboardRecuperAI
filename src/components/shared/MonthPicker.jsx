const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getDefaults() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

export function MonthPicker({ value, onChange }) {
  const defaults = getDefaults();
  const month = value?.month ?? defaults.month;
  const year = value?.year ?? defaults.year;

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 3; y--) {
    years.push(y);
  }

  const handleChange = (key, val) => {
    const next = { month, year, [key]: Number(val) };
    const dateStr = `${next.year}-${String(next.month + 1).padStart(2, "0")}-01`;
    onChange({ ...next, dateStr });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => handleChange("month", e.target.value)}
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {MONTHS.map((m, i) => (
          <option key={i} value={i}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => handleChange("year", e.target.value)}
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
