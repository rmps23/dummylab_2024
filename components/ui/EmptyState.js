import { btnPrimary } from "@/components/ui/buttons";

export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto my-10 flex max-w-xl animate-rise flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-panel/40 p-8 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/25 to-accent/25 text-2xl text-brand shadow-glow">
          <Icon aria-hidden="true" />
        </span>
      )}
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="max-w-md text-sm text-zinc-400">{children}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export const actionClass = btnPrimary;
