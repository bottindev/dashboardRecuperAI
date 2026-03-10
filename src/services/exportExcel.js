import * as XLSX from "xlsx";
import { fmt, fmtInt } from "@/utils/formatters";

export function exportToExcel(metrics, clients, monthLabel) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const totalRecovered = metrics.reduce(
    (a, m) => a + Number(m.total_recovered_value || 0),
    0
  );
  const totalInvestment = metrics.reduce(
    (a, m) => a + Number(m.service_investment || 0),
    0
  );
  const totalConversations = metrics.reduce(
    (a, m) => a + Number(m.total_conversations || 0),
    0
  );
  const totalConverted = metrics.reduce(
    (a, m) => a + Number(m.converted_conversations || 0),
    0
  );

  const resumo = [
    ["RecuperAI - Relatorio", monthLabel],
    [],
    ["Metrica", "Valor"],
    ["Receita Recuperada", `R$ ${fmt(totalRecovered)}`],
    ["Investimento Total", `R$ ${fmt(totalInvestment)}`],
    ["Lucro", `R$ ${fmt(totalRecovered - totalInvestment)}`],
    [
      "ROI",
      totalInvestment > 0
        ? `${fmtInt(((totalRecovered - totalInvestment) / totalInvestment) * 100)}%`
        : "N/A",
    ],
    ["Total Atendimentos", fmtInt(totalConversations)],
    ["Conversoes", fmtInt(totalConverted)],
    [
      "Taxa de Conversao",
      totalConversations > 0
        ? `${((totalConverted / totalConversations) * 100).toFixed(1)}%`
        : "N/A",
    ],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, ws1, "Resumo");

  // Sheet 2: Metricas por Mes
  const metricRows = metrics.map((m) => ({
    Cliente: m.client_name || "—",
    Mes: m.month,
    Atendimentos: Number(m.total_conversations || 0),
    Conversoes: Number(m.converted_conversations || 0),
    "Taxa (%)": Number(m.conversion_rate || 0).toFixed(1),
    "Receita (R$)": Number(m.total_recovered_value || 0),
    "Investimento (R$)": Number(m.service_investment || 0),
    "Lucro (R$)": Number(m.profit || 0),
    "ROI (%)": Number(m.roi_percent || 0).toFixed(0),
    "Ticket Medio (R$)": Number(m.avg_ticket || 0).toFixed(2),
  }));
  const ws2 = XLSX.utils.json_to_sheet(metricRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Metricas Mensais");

  // Sheet 3: Clientes
  const clientRows = clients.map((c) => ({
    Nome: c.nome_negocio || c.name || "—",
    Status: c.status || "ativo",
    "Investimento Mensal (R$)": c.investimento_mensal || 0,
    "WhatsApp Relatorio": c.whatsapp_relatorio || "—",
  }));
  const ws3 = XLSX.utils.json_to_sheet(clientRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Clientes");

  const filename = `RecuperAI_Relatorio_${monthLabel.replace(/\s/g, "_")}.xlsx`;
  XLSX.writeFile(wb, filename);
}
