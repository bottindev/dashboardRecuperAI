export const fmt = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtInt = (v) => Number(v || 0).toLocaleString("pt-BR");

export const fmtMonth = (d) => {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
};

export const fmtPct = (v) => Number(v || 0).toFixed(1) + "%";

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function formatRelativeTime(dateInput) {
  if (dateInput == null) return "\u2014";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "\u2014";

  const diffMs = date.getTime() - Date.now();
  const absDiffSec = Math.abs(diffMs / 1000);

  if (absDiffSec < 60) return "agora";

  const absDiffMin = absDiffSec / 60;
  if (absDiffMin < 60) {
    return rtf.format(Math.round(diffMs / 60000), "minute");
  }

  const absDiffHour = absDiffMin / 60;
  if (absDiffHour < 24) {
    return rtf.format(Math.round(diffMs / 3600000), "hour");
  }

  return rtf.format(Math.round(diffMs / 86400000), "day");
}
