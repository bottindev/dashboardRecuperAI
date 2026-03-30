import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

function validateEnvPlugin() {
  return {
    name: "validate-env",
    config(_, { command, mode }) {
      if (command === "build") {
        const env = loadEnv(mode, process.cwd(), "VITE_");
        const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_KEY"];
        const missing = required.filter(
          (key) => !env[key] && !process.env[key]
        );
        if (missing.length > 0) {
          throw new Error(
            `Build failed: missing required environment variables: ${missing.join(", ")}\nSet these in your .env file or Vercel environment settings.`
          );
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), validateEnvPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          exceljs: ["exceljs"],
        },
      },
    },
  },
});
