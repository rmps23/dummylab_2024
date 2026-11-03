export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto my-8 flex max-w-xl flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-700 p-8 text-center">
      {Icon && <Icon aria-hidden="true" className="text-3xl text-cyan-400" />}
      <h2 className="text-lg">{title}</h2>
      <p className="text-sm text-zinc-400">{children}</p>
      {action}
    </div>
  );
}

export const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400";
