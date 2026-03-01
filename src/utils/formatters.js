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
