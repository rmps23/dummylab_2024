export default function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <header className="border-b border-white/[0.08] px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-base text-brand">
          <Icon aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
