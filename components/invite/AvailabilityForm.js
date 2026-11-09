"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { toast } from "react-toastify";
import { EVENT_TYPES } from "@/lib/constants";

const CHOICES = [
  { status: "available", label: "I can play", short: "✓", on: "bg-emerald-600 text-white" },
  { status: "maybe", label: "Maybe", short: "~", on: "bg-amber-500 text-zinc-950" },
  { status: "unavailable", label: "Can't make it", short: "✕", on: "bg-rose-600 text-white" },
];

export default function AvailabilityForm({ token, playerName, teamName, initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [saving, setSaving] = useState(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function answer(event, status) {
    if (event.status === status || saving) return;
    const previous = event.status;
    setSaving(event.id);
    setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, status } : e)));
    try {
      const response = await fetch(`/api/availability/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, status }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Could not save");
    } catch (error) {
      setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, status: previous } : e)));
      toast.error(error.message);
    } finally {
      setSaving(null);
    }
  }

  const waiting = events.filter((e) => e.status === "pending").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow">{teamName}</p>
        <h1 className="mt-1 text-3xl font-bold">Hi {playerName}</h1>
        <p className="mt-2 text-zinc-300">
          Tell your coach when you can play. Your answers are saved as you tap.
          {events.length > 0 && (waiting > 0 ? ` ${waiting} still waiting for your answer.` : " You have answered everything.")}
        </p>
        <p className="mt-1 text-xs text-zinc-400">Times shown in {timeZone.replace("_", " ")}</p>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-zinc-400">
          Nothing is scheduled in the next 30 days. Check back later.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e, i) => {
            const start = new Date(e.starts_at);
            const type = EVENT_TYPES[e.type] ?? EVENT_TYPES.other;
            const newDay = i === 0 || !isSameDay(start, new Date(events[i - 1].starts_at));
            return (
              <li key={e.id}>
                {newDay && <h2 className="eyebrow mb-2 mt-2">{format(start, "EEEE d MMMM")}</h2>}
                <div className="rounded-xl border border-line bg-panel p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-bold">{e.title}</div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${type.dot}`} />
                        {type.label} · {format(start, "HH:mm")}–{format(new Date(e.ends_at), "HH:mm")}
                        {e.opponent && ` · vs ${e.opponent}`}
                      </div>
                    </div>
                    {e.status === "pending" && <span className="shrink-0 text-xs font-bold text-amber-400">Waiting</span>}
                  </div>
                  <div role="group" aria-label={`Your answer for ${e.title}`} className="mt-3 grid grid-cols-3 gap-2">
                    {CHOICES.map((c) => (
                      <button
                        key={c.status}
                        onClick={() => answer(e, c.status)}
                        aria-pressed={e.status === c.status}
                        className={`min-h-12 rounded-lg px-2 text-sm font-semibold transition ${
                          e.status === c.status ? c.on : "bg-white/[0.06] text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <span aria-hidden="true">{c.short}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
