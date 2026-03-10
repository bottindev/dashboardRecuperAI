import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/utils/formatters";

export function ClientOverviewCard({ client }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/clientes/${client.id}`)}
      className="group w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {client.name}
        </h3>
        <Badge
          variant="outline"
          className={
            client.status === "ativo"
              ? "border-emerald/30 text-emerald text-[10px]"
              : "border-muted-foreground/30 text-muted-foreground text-[10px]"
          }
        >
          {client.status}
        </Badge>
      </div>

      {/* Sparkline */}
      {client.sparkline && client.sparkline.length > 1 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={client.sparkline}>
              <defs>
                <linearGradient id={`client-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#0EA5E9"
                strokeWidth={1.5}
                fill={`url(#client-${client.id})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Receita</span>
        <span className="text-sm font-semibold font-mono text-foreground">
          R$ {fmt(client.receita)}
        </span>
      </div>
    </button>
  );
}
