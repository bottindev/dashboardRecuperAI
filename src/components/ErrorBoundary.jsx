import { Component } from "react";
import { COLORS } from "../utils/colors";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Erro inesperado." };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Erro capturado:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: COLORS.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            padding: 40,
          }}
        >
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.red}44`,
              borderRadius: 16,
              padding: "32px 36px",
              maxWidth: 480,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h2
              style={{ margin: "0 0 10px", color: COLORS.red, fontSize: 18 }}
            >
              Algo deu errado
            </h2>
            <p
              style={{
                color: COLORS.textMuted,
                fontSize: 13,
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: COLORS.accentDim,
                color: COLORS.accent,
                border: `1px solid ${COLORS.accent}44`,
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
