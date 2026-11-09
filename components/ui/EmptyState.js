import { btnPrimary } from "@/components/ui/buttons";

export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto my-10 flex max-w-xl animate-rise flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-panel p-8 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/12 text-2xl text-brand">
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
