import { MessageSquare, Clock } from "lucide-react";
import { useClientConversations } from "@/hooks/queries/useClientConversations";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/utils/formatters";

const OUTCOME_CONFIG = {
  booked: {
    label: "Agendado",
    class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
  abandoned: {
    label: "Abandonado",
    class: "bg-red-500/10 text-red-600 border-red-500/30",
  },
  delegated_human: {
    label: "Delegado",
    class: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  in_progress: {
    label: "Em andamento",
    class: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  },
};

const NEUTRAL_OUTCOME = {
  label: "Outro",
  class: "bg-muted text-muted-foreground border-muted-foreground/30",
};

function maskPhone(phone) {
  if (!phone) return "—";
  // Mask middle digits: +55 11 9****-1234
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 8) return phone;
  const last4 = cleaned.slice(-4);
  const first = cleaned.slice(0, Math.max(cleaned.length - 8, 2));
  return `${first} ****-${last4}`;
}

function formatDuration(startedAt, endedAt) {
  if (!endedAt) return "em aberto";
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const diffMin = Math.round((end - start) / 60000);
  if (diffMin < 1) return "<1min";
  return `${diffMin}min`;
}

function formatAbsoluteDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function ConversationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function TabConversations({ clientId }) {
  const { data: conversations, isPending } = useClientConversations(clientId);

  if (isPending) return <ConversationsSkeleton />;

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">Nenhuma conversa encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const outcome = OUTCOME_CONFIG[conv.outcome] || NEUTRAL_OUTCOME;
        const displayName = conv.customer_name || maskPhone(conv.customer_phone);

        return (
          <div
            key={conv.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
          >
            {/* Date */}
            <div className="w-24 shrink-0">
              <span className="block text-sm font-medium text-foreground">
                {formatRelativeTime(conv.started_at)}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                {formatAbsoluteDate(conv.started_at)}
              </span>
            </div>

            {/* Customer */}
            <div className="flex-1 min-w-0">
              <span className="block text-sm text-foreground truncate">
                {displayName}
              </span>
            </div>

            {/* Outcome badge */}
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${outcome.class}`}
            >
              {outcome.label}
            </Badge>

            {/* Messages count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <MessageSquare className="h-3 w-3" />
              <span>{conv.messages_count ?? 0}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-16 justify-end">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(conv.started_at, conv.ended_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
