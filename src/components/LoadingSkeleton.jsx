import { COLORS } from "../utils/colors";

function Bone({ width = "100%", height = 20, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${COLORS.border} 25%, ${COLORS.cardHover} 50%, ${COLORS.border} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header skeleton */}
      <div
        style={{
          padding: "24px 32px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Bone width={40} height={40} radius={12} />
          <Bone width={160} height={22} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Bone width={110} height={30} radius={8} />
          <Bone width={80} height={30} radius={8} />
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Filter skeleton */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[80, 100, 110, 90].map((w, i) => (
            <Bone key={i} width={w} height={36} radius={10} />
          ))}
        </div>

        {/* Cards skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Bone width="60%" height={12} />
              <Bone width="80%" height={28} />
              <Bone width="45%" height={10} />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <Bone width="40%" height={14} style={{ marginBottom: 16 }} />
              <Bone width="100%" height={220} radius={10} />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}` }}>
            <Bone width={240} height={16} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "16px 22px",
                borderBottom: `1px solid ${COLORS.border}08`,
                display: "flex",
                gap: 20,
              }}
            >
              <Bone width="15%" height={14} />
              <Bone width="10%" height={14} />
              <Bone width="10%" height={14} />
              <Bone width="10%" height={14} />
              <Bone width="12%" height={14} />
              <Bone width="12%" height={14} />
              <Bone width="10%" height={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
