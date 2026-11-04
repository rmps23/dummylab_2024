"use client";

import { format, isSameDay } from "date-fns";
import { EVENT_TYPES } from "@/lib/constants";
import { availableCount, pendingCount } from "@/lib/availability";

// Events grouped by day, one readable row each. Used on phones and as a third calendar view.
export default function Agenda({ events, players, onSelect, onCreate }) {
  const days = [];
  events.forEach((event) => {
    const date = new Date(event.starts_at);
    const last = days[days.length - 1];
    if (last && isSameDay(last.date, date)) last.events.push(event);
    else days.push({ date, events: [event] });
  });

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-panel/50 p-8 text-center">
        <p className="text-zinc-300">Nothing scheduled in this period.</p>
        <button
          onClick={onCreate}
          className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-brand hover:bg-brand-soft px-4 text-sm font-semibold text-zinc-950"
        >
          Schedule an event
        </button>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {days.map(({ date, events: dayEvents }) => (
        <li key={date.toDateString()}>
          <h3 className={`mb-2 text-sm font-bold ${isSameDay(date, new Date()) ? "text-brand" : "text-zinc-300"}`}>
            {format(date, "EEEE d MMMM")}
            {isSameDay(date, new Date()) && " · Today"}
          </h3>
          <ul className="flex flex-col gap-2">
            {dayEvents.map((e) => {
              const type = EVENT_TYPES[e.type];
              const yes = availableCount(e, players);
              const waiting = pendingCount(e, players);
              return (
                <li key={e.id}>
                  <button
                    onClick={() => onSelect(e.id)}
                    className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-white/[0.07] bg-panel p-3 text-left shadow-card transition hover:border-brand/30 hover:bg-white/[0.05]"
                  >
                    <span aria-hidden="true" className={`h-10 w-1 shrink-0 rounded-full ${type.dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{e.title}</span>
                      <span className="block text-xs text-zinc-400">
                        {type.label} · {format(new Date(e.starts_at), "HH:mm")}–{format(new Date(e.ends_at), "HH:mm")}
                        {e.opponent && ` · vs ${e.opponent}`}
                      </span>
                    </span>
                    {players.length > 0 && (
                      <span className="shrink-0 text-right text-sm">
                        <span className={yes >= 5 ? "text-emerald-400" : "text-amber-400"}>
                          {yes}/{players.length}
                        </span>
                        {waiting > 0 && <span className="block text-xs text-zinc-400">{waiting} pending</span>}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
