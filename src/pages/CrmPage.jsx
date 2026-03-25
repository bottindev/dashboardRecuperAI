import { CrmKanban } from "@/components/crm/CrmKanban";

export default function CrmPage() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">CRM AI-Powered</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe a qualificação BANT e as conversas da Ahri em tempo real.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[500px]">
        <CrmKanban />
      </div>
    </div>
  );
}
