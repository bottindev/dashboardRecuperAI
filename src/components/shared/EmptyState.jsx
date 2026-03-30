/**
 * Reusable empty state for zero-data scenarios.
 * @param {{ icon: React.ElementType, message: string, action?: React.ReactNode, className?: string }} props
 */
export function EmptyState({ icon: Icon, message, action, className }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-muted-foreground ${className ?? ""}`}>
      {Icon && <Icon className="h-10 w-10 mb-3 opacity-40" />}
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
