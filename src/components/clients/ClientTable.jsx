import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, UserX } from "lucide-react";
import { fmt } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

export function ClientTable({ clients, onEdit, onDeactivate }) {
  const navigate = useNavigate();

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhum cliente cadastrado.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Investimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer even:bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/clientes/${c.id}`)}
              >
                <TableCell className="font-medium">{c.nome_negocio}</TableCell>
                <TableCell className="text-right font-mono">
                  {c.investimento_mensal ? `R$ ${fmt(c.investimento_mensal)}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      c.status === "ativo"
                        ? "bg-emerald/10 text-emerald"
                        : "bg-amber/10 text-amber"
                    }
                  >
                    {c.status || "ativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.whatsapp_relatorio || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {c.status !== "inativo" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDeactivate(c)}
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
