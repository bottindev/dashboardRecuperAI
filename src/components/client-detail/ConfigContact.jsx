import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConfigContact({ config, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="cfg-whatsapp">WhatsApp Numero</Label>
        <Input
          id="cfg-whatsapp"
          type="tel"
          value={config.whatsapp_numero ?? ""}
          onChange={(e) => onChange("whatsapp_numero", e.target.value)}
          placeholder="Ex: 5511999999999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-whatsapp-relatorio">WhatsApp Relatorio</Label>
        <Input
          id="cfg-whatsapp-relatorio"
          type="tel"
          value={config.whatsapp_relatorio ?? ""}
          onChange={(e) => onChange("whatsapp_relatorio", e.target.value)}
          placeholder="Ex: 5511999999999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-endereco">Endereco</Label>
        <Input
          id="cfg-endereco"
          value={config.endereco ?? ""}
          onChange={(e) => onChange("endereco", e.target.value)}
          placeholder="Ex: Rua das Flores, 123"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cfg-agendamento">Link de Agendamento</Label>
        <Input
          id="cfg-agendamento"
          type="url"
          value={config.link_agendamento ?? ""}
          onChange={(e) => onChange("link_agendamento", e.target.value)}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
