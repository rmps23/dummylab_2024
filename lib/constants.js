export const ROLES = [
  { id: 1, name: "Top" },
  { id: 2, name: "Jungler" },
  { id: 3, name: "Mid" },
  { id: 4, name: "Bottom" },
  { id: 5, name: "Support" },
];

export const QUEUES = {
  420: "Ranked Solo",
  440: "Ranked Flex",
  400: "Normal Draft",
  430: "Normal Blind",
  450: "ARAM",
  700: "Clash",
  0: "Custom",
};

export const EVENT_TYPES = {
  training: { label: "Training", color: "bg-sky-700", dot: "bg-sky-400", chip: "border-sky-400 bg-sky-400/15 text-sky-100 hover:bg-sky-400/25" },
  scrim: { label: "Scrim", color: "bg-amber-700", dot: "bg-amber-400", chip: "border-amber-400 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25" },
  match: { label: "Match", color: "bg-emerald-700", dot: "bg-emerald-400", chip: "border-emerald-400 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25" },
  other: { label: "Other", color: "bg-zinc-600", dot: "bg-zinc-400", chip: "border-zinc-400 bg-zinc-400/15 text-zinc-100 hover:bg-zinc-400/25" },
};

export const AVAILABILITY = {
  pending: { label: "Pending", short: "?", color: "bg-zinc-700 text-zinc-300" },
  available: { label: "Available", short: "✓", color: "bg-emerald-700 text-white" },
  maybe: { label: "Maybe", short: "~", color: "bg-amber-500 text-zinc-950" },
  unavailable: { label: "Unavailable", short: "✕", color: "bg-red-600 text-white" },
};
