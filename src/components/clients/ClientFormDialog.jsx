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

const SEGMENTS = [
  { value: "salao", label: "Salao de Beleza" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "servico", label: "Servico" },
  { value: "marketing", label: "Marketing" },
  { value: "consultoria", label: "Consultoria" },
];

const EMPTY_FORM = {
  nome_negocio: "",
  segment: "servico",
  investimento_mensal: "",
  valor_setup: "",
  data_inicio: new Date().toISOString().slice(0, 10),
  whatsapp_relatorio: "",
  status: "ativo",
};

export function ClientFormDialog({ open, onOpenChange, client, onSubmit }) {
  const isEdit = !!client;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        nome_negocio: client.nome_negocio || "",
        segment: client.segment || "servico",
        investimento_mensal: client.investimento_mensal ?? "",
        valor_setup: client.valor_setup ?? "",
        data_inicio: client.data_inicio || "",
        whatsapp_relatorio: client.whatsapp_relatorio || "",
        status: client.status || "ativo",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [client, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome_negocio.trim()) return;

    setSaving(true);
    try {
      const data = {
        nome_negocio: form.nome_negocio.trim(),
        segment: form.segment,
        investimento_mensal: form.investimento_mensal
          ? Number(form.investimento_mensal)
          : null,
        valor_setup: form.valor_setup ? Number(form.valor_setup) : null,
        data_inicio: form.data_inicio || null,
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
              <Label htmlFor="segment">Segmento</Label>
              <select
                id="segment"
                value={form.segment}
                onChange={set("segment")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="setup">Valor Setup (R$)</Label>
                <Input
                  id="setup"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_setup}
                  onChange={set("valor_setup")}
                  placeholder="Ex: 2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investimento">Mensalidade (R$)</Label>
                <Input
                  id="investimento"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.investimento_mensal}
                  onChange={set("investimento_mensal")}
                  placeholder="Ex: 500"
                />
              </div>
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Inicio Contrato</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={form.data_inicio}
                  onChange={set("data_inicio")}
                />
              </div>
            )}

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
