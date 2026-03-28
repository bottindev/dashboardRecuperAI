import { CircleCheck } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatters";

export function AlertDropdown({ alerts }) {
  const hasAlerts = alerts.length > 0;
  const visible = alerts.slice(0, 5);
  const hasMore = alerts.length > 5;

  return (
    <div className="w-80 rounded-lg border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
        {hasAlerts && (
          <span className="text-xs text-muted-foreground">
            {alerts.length} {alerts.length === 1 ? "erro" : "erros"}
          </span>
        )}
      </div>

      {/* List */}
      {hasAlerts ? (
        <ul className="max-h-80 overflow-y-auto">
          {visible.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start justify-between gap-2 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {alert.config_clientes?.nome_negocio ?? "Desconhecido"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {alert.workflow_name}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(alert.created_at)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <CircleCheck className="h-6 w-6" />
          <p className="text-sm">Nenhum alerta</p>
        </div>
      )}

      {/* Footer */}
      {hasMore && (
        <div className="border-t border-border px-4 py-2 text-center">
          <span className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Ver todos
          </span>
        </div>
      )}
    </div>
  );
}
