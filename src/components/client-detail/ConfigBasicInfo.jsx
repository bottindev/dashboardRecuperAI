import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "trial", label: "Trial" },
];

export function ConfigBasicInfo({ config, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="cfg-nome">Nome do Negocio</Label>
        <Input
          id="cfg-nome"
          value={config.nome_negocio ?? ""}
          onChange={(e) => onChange("nome_negocio", e.target.value)}
          placeholder="Ex: Soul Bela Estetica"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-status">Status</Label>
        <Select
          value={config.status ?? "ativo"}
          onValueChange={(val) => onChange("status", val)}
        >
          <SelectTrigger id="cfg-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-cidade">Cidade</Label>
        <Input
          id="cfg-cidade"
          value={config.cidade ?? ""}
          onChange={(e) => onChange("cidade", e.target.value)}
          placeholder="Ex: Sao Paulo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-tipo">Tipo de Negocio</Label>
        <Input
          id="cfg-tipo"
          value={config.tipo_negocio ?? ""}
          onChange={(e) => onChange("tipo_negocio", e.target.value)}
          placeholder="Ex: Estetica"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="cfg-desc">Descricao</Label>
        <textarea
          id="cfg-desc"
          rows={3}
          value={config.descricao ?? ""}
          onChange={(e) => onChange("descricao", e.target.value)}
          placeholder="Descricao do negocio..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
