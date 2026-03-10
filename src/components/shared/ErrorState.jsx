import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="max-w-md rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Erro ao carregar dados
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
