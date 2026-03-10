import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const PAGE_TITLES = {
  "/": "Home",
  "/clientes": "Clientes",
  "/relatorios": "Relatorios",
  "/configuracoes": "Configuracoes",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Dynamic document.title
  useEffect(() => {
    const base = "RecuperAI";
    const page =
      PAGE_TITLES[pathname] ||
      (pathname.startsWith("/clientes/") ? "Cliente" : "Home");
    document.title = `${base} | ${page}`;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-200",
          collapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        <footer className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
          RecuperAI Dashboard &middot; Dados em tempo real
        </footer>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
