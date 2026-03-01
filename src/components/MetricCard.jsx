import { COLORS } from "../utils/colors";

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  color = COLORS.accent,
  icon,
  sublabel,
  trend,
}) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0.7,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, opacity: 0.7 }}>{icon}</span>
        <span
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 4,
        }}
      >
        {prefix && (
          <span style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500 }}>
            {prefix}
          </span>
        )}
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
      {sublabel && (
        <span style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
          {sublabel}
        </span>
      )}
      {trend !== undefined && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: trend >= 0 ? COLORS.accentDim : COLORS.redDim,
            color: trend >= 0 ? COLORS.accent : COLORS.red,
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            width: "fit-content",
          }}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
