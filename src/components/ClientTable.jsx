import { COLORS } from "../utils/colors";
import { fmt, fmtInt, fmtMonth } from "../utils/formatters";

const HEADERS = [
  "Cliente",
  "Atendimentos",
  "Conversões",
  "Taxa Conv.",
  "Receita Recup.",
  "Investimento",
  "Lucro",
  "ROI",
  "Ticket Médio",
];

export function ClientTable({ metrics, clients }) {
  const sortedMonths = [...new Set(metrics.map((m) => m.month))].sort();
  const latestMonth = sortedMonths.at(-1) ?? null;
  const latest = metrics.filter((m) => m.month === latestMonth);

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h3
          style={{ margin: 0, fontSize: 15, fontWeight: 600, color: COLORS.text }}
        >
          📋 Performance por Cliente
          {latestMonth && ` — ${fmtMonth(latestMonth)}`}
        </h3>
      </div>

      {latest.length === 0 ? (
        <div
          style={{
            padding: "32px 22px",
            textAlign: "center",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: COLORS.textMuted,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latest.map((m) => {
                const client = clients.find((c) => c.id === m.client_id);
                const convRate = Number(m.conversion_rate);
                const roi = Number(m.roi_percent);
                return (
                  <tr
                    key={m.id}
                    style={{ borderBottom: `1px solid ${COLORS.border}08` }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.text,
                        fontWeight: 600,
                      }}
                    >
                      {client?.name ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.text,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {fmtInt(m.total_conversations)}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}
                    >
                      {fmtInt(m.converted_conversations)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background:
                            convRate >= 25 ? COLORS.accentDim : COLORS.orangeDim,
                          color: convRate >= 25 ? COLORS.accent : COLORS.orange,
                          padding: "3px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {convRate.toFixed(1)}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}
                    >
                      R$ {fmt(m.total_recovered_value)}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      R$ {fmt(m.service_investment)}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                      }}
                    >
                      R$ {fmt(m.profit)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background:
                            roi >= 500 ? COLORS.accentDim : COLORS.blueDim,
                          color: roi >= 500 ? COLORS.accent : COLORS.blue,
                          padding: "3px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {fmtInt(roi)}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.text,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      R$ {fmt(m.avg_ticket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
