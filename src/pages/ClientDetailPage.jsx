import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientOverview } from "@/hooks/queries/useClientOverview";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ClientHeader } from "@/components/client-detail/ClientHeader";
import { TabOverview } from "@/components/client-detail/TabOverview";
import { TabConversations } from "@/components/client-detail/TabConversations";
import { TabMetrics } from "@/components/client-detail/TabMetrics";

const TAB_VALUES = ["overview", "conversations", "metrics", "config"];

export default function ClientDetailPage() {
  const { id } = useParams();
  const { client, metrics, isPending, isError, error, refetch } =
    useClientOverview(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (isPending) return <LoadingSkeleton />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-foreground">
          Cliente nao encontrado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          O cliente com este ID nao existe.
        </p>
        <Link
          to="/clientes"
          className="mt-4 text-sm text-primary hover:underline"
        >
          Voltar para Clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <ClientHeader
          client={client}
          metrics={metrics}
          onEditClick={() => setActiveTab("config")}
          onRefresh={() => refetch()}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start px-6">
            <TabsTrigger value="overview">Visao Geral</TabsTrigger>
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="metrics">Metricas</TabsTrigger>
            <TabsTrigger value="config">Configuracao</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "overview" && <TabOverview clientId={id} />}
        {activeTab === "conversations" && <TabConversations clientId={id} />}
        {activeTab === "metrics" && <TabMetrics clientId={id} />}
        {activeTab === "config" && (
          <div className="py-12 text-center text-muted-foreground">
            Configuracao em desenvolvimento
          </div>
        )}
      </div>
    </div>
  );
}
