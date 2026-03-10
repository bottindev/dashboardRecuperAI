import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClientesPage() {
  const { clients, loading, error, reload, create, update, deactivate } =
    useClients();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmClient, setConfirmClient] = useState(null);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingClient) {
        await update(editingClient.id, data);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await create(data);
        toast.success("Cliente criado com sucesso!");
      }
    } catch (e) {
      toast.error(e.message || "Erro ao salvar cliente.");
      throw e;
    }
  };

  const handleDeactivate = (client) => {
    setConfirmClient(client);
  };

  const confirmDeactivate = async () => {
    if (!confirmClient) return;
    try {
      await deactivate(confirmClient.id);
      toast.success(`${confirmClient.nome_negocio} desativado.`);
    } catch (e) {
      toast.error(e.message || "Erro ao desativar cliente.");
    } finally {
      setConfirmClient(null);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <ClientTable
        clients={clients}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSubmit={handleSubmit}
      />

      {/* Confirmation dialog for deactivation */}
      <Dialog
        open={!!confirmClient}
        onOpenChange={(open) => !open && setConfirmClient(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar{" "}
              <strong>{confirmClient?.nome_negocio}</strong>? O cliente sera
              marcado como inativo, mas seus dados serao preservados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClient(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
