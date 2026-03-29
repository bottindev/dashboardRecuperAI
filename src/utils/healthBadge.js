/**
 * Health badge computation and configuration.
 * Shared between ClientOverviewCard (HomePage) and ClientHeader (Detail page).
 */

export function computeHealth(c) {
  if (c.contrato_status === "cancelado") {
    return { status: "red", reason: "Contrato cancelado" };
  }
  if ((c.total_conversas || 0) === 0) {
    return { status: "red", reason: "Sem conversas" };
  }
  const roi =
    (c.receita_gerada_bot || 0) / Math.max(c.valor_mensalidade || 1, 1);
  if ((c.taxa_conversao || 0) < 10) {
    return {
      status: "yellow",
      reason: `Baixa conversao (${(c.taxa_conversao || 0).toFixed(1)}%)`,
    };
  }
  if (roi < 1) {
    return { status: "yellow", reason: `ROI abaixo de 1x (${roi.toFixed(1)}x)` };
  }
  return {
    status: "green",
    reason: `ROI ${roi.toFixed(1)}x | Conversao ${(c.taxa_conversao || 0).toFixed(1)}%`,
  };
}

export const HEALTH_CONFIG = {
  green: {
    label: "Saudavel",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600",
  },
  yellow: {
    label: "Atencao",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600",
  },
  red: {
    label: "Critico",
    dotClass: "bg-red-500",
    textClass: "text-red-600",
  },
};
