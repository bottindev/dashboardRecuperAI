import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientFormDialog({ open, onOpenChange, client, onSubmit }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    nome_negocio: "",
    investimento_mensal: "",
    whatsapp_relatorio: "",
    status: "ativo",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        nome_negocio: client.nome_negocio || "",
        investimento_mensal: client.investimento_mensal ?? "",
        whatsapp_relatorio: client.whatsapp_relatorio || "",
        status: client.status || "ativo",
      });
    } else {
      setForm({
        nome_negocio: "",
        investimento_mensal: "",
        whatsapp_relatorio: "",
        status: "ativo",
      });
    }
  }, [client, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome_negocio.trim()) return;

    setSaving(true);
    try {
      const data = {
        nome_negocio: form.nome_negocio.trim(),
        investimento_mensal: form.investimento_mensal
          ? Number(form.investimento_mensal)
          : null,
        whatsapp_relatorio: form.whatsapp_relatorio.trim() || null,
        status: form.status,
      };
      await onSubmit(data);
      onOpenChange(false);
    } catch {
      // Error handled by parent via toast
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Atualize os dados do cliente."
                : "Preencha os dados do novo cliente."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Negocio *</Label>
              <Input
                id="nome"
                value={form.nome_negocio}
                onChange={set("nome_negocio")}
                placeholder="Ex: Soul Bela Estetica"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investimento">Investimento Mensal (R$)</Label>
              <Input
                id="investimento"
                type="number"
                step="0.01"
                min="0"
                value={form.investimento_mensal}
                onChange={set("investimento_mensal")}
                placeholder="Ex: 497.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Relatorio</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp_relatorio}
                onChange={set("whatsapp_relatorio")}
                placeholder="Ex: 5511999999999"
              />
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={set("status")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !form.nome_negocio.trim()}>
              {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
