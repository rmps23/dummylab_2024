const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-display text-sm font-bold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40";

export const btnPrimary = `${base} bg-brand text-brand-ink shadow-[0_3px_0_0_#1E7F99] hover:-translate-y-px hover:bg-brand-soft active:translate-y-0.5 active:shadow-none`;
export const btnSecondary = `${base} border border-line-strong bg-raised text-zinc-100 shadow-[0_3px_0_0_#0E0F12] hover:-translate-y-px hover:bg-well active:translate-y-0.5 active:shadow-none`;
export const btnGhost = `${base} text-zinc-300 hover:bg-white/[0.06]`;
export const btnDanger = `${base} bg-loss text-ink hover:brightness-110`;
export const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/[0.08]";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand focus:ring-2 focus:ring-brand/25";
