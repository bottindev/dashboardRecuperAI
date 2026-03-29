import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useClientConfig } from "@/hooks/queries/useClientConfig";
import { useUpdateClient } from "@/hooks/mutations/useUpdateClient";
import { ConfigBasicInfo } from "./ConfigBasicInfo";
import { ConfigFinancial } from "./ConfigFinancial";
import { ConfigContact } from "./ConfigContact";
import { ConfigServices } from "./ConfigServices";
import { ConfigSchedule } from "./ConfigSchedule";
import { ConfigClosedDates } from "./ConfigClosedDates";

const BASIC_FIELDS = ["nome_negocio", "status", "cidade", "tipo_negocio", "descricao"];
const FINANCIAL_FIELDS = ["investimento_mensal", "formas_pagamento", "contrato_status"];
const CONTACT_FIELDS = [
  "whatsapp_numero",
  "whatsapp_relatorio",
  "endereco",
  "link_agendamento",
];
const ALL_CONFIG_FIELDS = [...BASIC_FIELDS, ...FINANCIAL_FIELDS, ...CONTACT_FIELDS];

function pickFields(source, fields) {
  const result = {};
  for (const f of fields) {
    result[f] = source?.[f] ?? null;
  }
  return result;
}

export function TabConfig({ clientId }) {
  const { data: configData, isPending } = useClientConfig(clientId);
  const updateClient = useUpdateClient();

  // Form state -- isolated from query cache via structuredClone
  const [dirtyConfig, setDirtyConfig] = useState(null);

  // Sync form state when query data arrives or changes
  useEffect(() => {
    if (configData) {
      setDirtyConfig(structuredClone(pickFields(configData, ALL_CONFIG_FIELDS)));
    }
  }, [configData]);

  // Compute isDirty by comparing dirtyConfig to query data
  const isDirty = useMemo(() => {
    if (!dirtyConfig || !configData) return false;
    const original = pickFields(configData, ALL_CONFIG_FIELDS);
    return ALL_CONFIG_FIELDS.some((f) => {
      const a = dirtyConfig[f] ?? null;
      const b = original[f] ?? null;
      return String(a) !== String(b);
    });
  }, [dirtyConfig, configData]);

  const handleFieldChange = (field, value) => {
    setDirtyConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!dirtyConfig || !configData) return;

    // Only send changed fields
    const original = pickFields(configData, ALL_CONFIG_FIELDS);
    const changes = {};
    for (const f of ALL_CONFIG_FIELDS) {
      const a = dirtyConfig[f] ?? null;
      const b = original[f] ?? null;
      if (String(a) !== String(b)) {
        changes[f] = a;
      }
    }

    if (Object.keys(changes).length === 0) return;

    updateClient.mutate(
      { id: configData.id, ...changes },
      {
        onSuccess: () => {
          toast.success("Configuracao salva com sucesso");
        },
        onError: (err) => {
          toast.error(err?.message ?? "Erro ao salvar configuracao");
        },
      }
    );
  };

  if (isPending || !dirtyConfig) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Dados Basicos */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Dados Basicos
        </h3>
        <ConfigBasicInfo config={dirtyConfig} onChange={handleFieldChange} />
      </section>

      {/* Financeiro */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Financeiro
        </h3>
        <ConfigFinancial config={dirtyConfig} onChange={handleFieldChange} />
      </section>

      {/* Contato / WhatsApp */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Contato / WhatsApp
        </h3>
        <ConfigContact config={dirtyConfig} onChange={handleFieldChange} />
      </section>

      {/* Servicos */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Servicos
        </h3>
        <ConfigServices clientId={clientId} />
      </section>

      {/* Horarios */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Horarios
        </h3>
        <ConfigSchedule clientId={clientId} />
      </section>

      {/* Datas Fechadas */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-t pt-4">
          Datas Fechadas
        </h3>
        <ConfigClosedDates clientId={clientId} />
      </section>

      {/* Sticky save bar for basic/financial/contact config */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background p-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isDirty || updateClient.isPending}
          className="min-w-[120px]"
        >
          {updateClient.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
