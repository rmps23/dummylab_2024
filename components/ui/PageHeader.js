export default function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <header className="border-b border-line px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-lg text-brand">
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
