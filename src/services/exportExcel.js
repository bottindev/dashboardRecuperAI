import ExcelJS from "exceljs";
import { fmt, fmtInt } from "@/utils/formatters";

export async function exportToExcel(metrics, clients, monthLabel) {
  const wb = new ExcelJS.Workbook();

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

  const ws1 = wb.addWorksheet("Resumo");
  const resumoData = [
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
  for (const row of resumoData) {
    ws1.addRow(row);
  }

  // Sheet 2: Metricas por Mes
  const ws2 = wb.addWorksheet("Metricas Mensais");
  ws2.columns = [
    { header: "Cliente", key: "cliente", width: 25 },
    { header: "Mes", key: "mes", width: 12 },
    { header: "Atendimentos", key: "atendimentos", width: 14 },
    { header: "Conversoes", key: "conversoes", width: 12 },
    { header: "Taxa (%)", key: "taxa", width: 10 },
    { header: "Receita (R$)", key: "receita", width: 14 },
    { header: "Investimento (R$)", key: "investimento", width: 16 },
    { header: "Lucro (R$)", key: "lucro", width: 12 },
    { header: "ROI (%)", key: "roi", width: 10 },
    { header: "Ticket Medio (R$)", key: "ticket", width: 16 },
  ];
  for (const m of metrics) {
    ws2.addRow({
      cliente: m.client_name || "\u2014",
      mes: m.month,
      atendimentos: Number(m.total_conversations || 0),
      conversoes: Number(m.converted_conversations || 0),
      taxa: Number(m.conversion_rate || 0).toFixed(1),
      receita: Number(m.total_recovered_value || 0),
      investimento: Number(m.service_investment || 0),
      lucro: Number(m.profit || 0),
      roi: Number(m.roi_percent || 0).toFixed(0),
      ticket: Number(m.avg_ticket || 0).toFixed(2),
    });
  }

  // Sheet 3: Clientes
  const ws3 = wb.addWorksheet("Clientes");
  ws3.columns = [
    { header: "Nome", key: "nome", width: 30 },
    { header: "Status", key: "status", width: 12 },
    { header: "Investimento Mensal (R$)", key: "investimento", width: 22 },
    { header: "WhatsApp Relatorio", key: "whatsapp", width: 20 },
  ];
  for (const c of clients) {
    ws3.addRow({
      nome: c.nome_negocio || c.name || "\u2014",
      status: c.status || "ativo",
      investimento: c.investimento_mensal || 0,
      whatsapp: c.whatsapp_relatorio || "\u2014",
    });
  }

  const filename = `RecuperAI_Relatorio_${monthLabel.replace(/\s/g, "_")}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
