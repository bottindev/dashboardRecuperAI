import { useLocation } from "react-router-dom";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AlertBell } from "@/components/alerts/AlertBell";

const pageTitles = {
  "/": "Home",
  "/clientes": "Clientes",
  "/relatorios": "Relatorios",
  "/configuracoes": "Configuracoes",
};

export function Topbar({ onMenuClick, children }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const title = pageTitles[pathname] || (pathname.startsWith("/clientes/") ? "Cliente" : "Home");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/80 backdrop-blur-lg px-4 dark:bg-card/80 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <AlertBell />
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {children}
        <button
          onClick={signOut}
          title="Sair"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
