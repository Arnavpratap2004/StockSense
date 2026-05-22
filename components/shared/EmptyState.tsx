import { Package } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "No data found",
  description = "There's nothing to display here yet.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in relative rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59, 130, 246,0.05),transparent_70%)] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-20 h-20 rounded-3xl bg-[rgba(59, 130, 246,0.05)] border border-[rgba(59, 130, 246,0.1)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59, 130, 246,0.1)] animate-[float_6s_ease-in-out_infinite] relative z-10">
        <div className="text-[var(--brand-primary)] opacity-80">
          {icon || <Package className="w-10 h-10 drop-shadow-[0_0_8px_rgba(59, 130, 246,0.5)]" />}
        </div>
      </div>
      <h3 className="text-xl font-semibold font-display text-[var(--text-primary)] relative z-10">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm relative z-10 leading-relaxed">{description}</p>
      {action && <div className="mt-6 relative z-10">{action}</div>}
    </div>
  );
}
