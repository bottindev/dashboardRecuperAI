import { COLORS } from "../utils/colors";

export function ClientSelector({ clients, selected, onSelect }) {
  const btnStyle = (active) => ({
    padding: "8px 18px",
    borderRadius: 10,
    border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
    background: active ? COLORS.accentDim : "transparent",
    color: active ? COLORS.accent : COLORS.textMuted,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => onSelect("all")} style={btnStyle(selected === "all")}>
        Todos
      </button>
      {clients.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          style={btnStyle(selected === c.id)}
        >
          {c.name}
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: c.status === "active" ? COLORS.accentDim : COLORS.redDim,
              color: c.status === "active" ? COLORS.accent : COLORS.red,
            }}
          >
            {c.status === "active" ? "ativo" : c.status}
          </span>
        </button>
      ))}
    </div>
  );
}
