import { cn } from "@/lib/utils";

const TIER_STYLES = {
  hot: "bg-red-500/15 text-red-400 border-red-500/30",
  warm: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  cold: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

/**
 * Colored pill badge for lead tier (Hot / Warm / Cold).
 * @param {{ tier: string | null | undefined }} props
 */
export function TierBadge({ tier }) {
  const normalised = tier?.toLowerCase() ?? "cold";
  const style = TIER_STYLES[normalised] ?? TIER_STYLES.cold;
  const label = normalised.charAt(0).toUpperCase() + normalised.slice(1);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold select-none",
        style
      )}
    >
      {label}
    </span>
  );
}
