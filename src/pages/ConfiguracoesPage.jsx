import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Moon,
  Sun,
  RefreshCw,
  Database,
  Workflow,
  MessageCircle,
  Calendar,
} from "lucide-react";

const REFRESH_OPTIONS = [
  { value: "1", label: "1 minuto" },
  { value: "5", label: "5 minutos" },
  { value: "15", label: "15 minutos" },
  { value: "off", label: "Desativado" },
];

const INTEGRATIONS = [
  {
    name: "Supabase",
    icon: Database,
    description: "Banco de dados e API REST",
    check: () => !!import.meta.env.VITE_SUPABASE_URL,
  },
  {
    name: "n8n",
    icon: Workflow,
    description: "Automacao de workflows",
    check: () => true,
  },
  {
    name: "Evolution API",
    icon: MessageCircle,
    description: "WhatsApp Business",
    check: () => true,
  },
  {
    name: "Google Calendar",
    icon: Calendar,
    description: "Agendamento de servicos",
    check: () => true,
  },
];

export default function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuracoes</h2>
        <p className="text-sm text-muted-foreground">
          Preferencias do dashboard e status das integracoes
        </p>
      </div>

      {/* Appearance + Refresh */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Dark mode toggle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Sun className="h-4 w-4 text-amber" />
              )}
              Aparencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm text-muted-foreground">
                Modo escuro
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh interval */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="h-4 w-4 text-primary" />
              Auto-refresh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Intervalo</Label>
              <Select
                defaultValue={settings.refreshInterval}
                onValueChange={(val) => updateSetting("refreshInterval", val)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFRESH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration status */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Integracoes</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((integration) => {
            const Icon = integration.icon;
            const connected = integration.check();
            return (
              <Card key={integration.name}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {integration.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {integration.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      connected
                        ? "bg-emerald/10 text-emerald"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {connected ? "Online" : "Offline"}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
