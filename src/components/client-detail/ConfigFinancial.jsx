import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTRATO_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "trial", label: "Trial" },
  { value: "cancelado", label: "Cancelado" },
  { value: "inadimplente", label: "Inadimplente" },
];

export function ConfigFinancial({ config, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="cfg-investimento">Investimento Mensal (R$)</Label>
        <Input
          id="cfg-investimento"
          type="number"
          step="0.01"
          min="0"
          value={config.investimento_mensal ?? ""}
          onChange={(e) =>
            onChange(
              "investimento_mensal",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          placeholder="Ex: 497.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-contrato">Status do Contrato</Label>
        <Select
          value={config.contrato_status ?? "ativo"}
          onValueChange={(val) => onChange("contrato_status", val)}
        >
          <SelectTrigger id="cfg-contrato" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTRATO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="cfg-pagamento">Formas de Pagamento</Label>
        <Input
          id="cfg-pagamento"
          value={config.formas_pagamento ?? ""}
          onChange={(e) => onChange("formas_pagamento", e.target.value)}
          placeholder="Ex: Pix, Cartao, Dinheiro"
        />
      </div>
    </div>
  );
}
