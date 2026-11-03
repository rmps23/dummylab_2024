const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

export const btnPrimary = `${base} bg-gradient-to-r from-cyan-400 to-sky-500 text-zinc-950 shadow-[0_6px_18px_-8px_rgba(34,211,238,0.8)] hover:brightness-110`;
export const btnSecondary = `${base} border border-white/10 bg-white/[0.05] text-zinc-100 hover:bg-white/10`;
export const btnGhost = `${base} text-zinc-300 hover:bg-white/[0.06]`;
export const btnDanger = `${base} bg-rose-600/90 text-white hover:bg-rose-500`;
export const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/[0.08]";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/20";
