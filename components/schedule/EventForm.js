"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { insertEvent, updateEvent } from "@/hooks/schedule";
import { EVENT_TYPES } from "@/lib/constants";

const input = "min-h-11 w-full rounded-lg border border-line bg-black/30 px-3 py-2 text-sm outline-none focus:border-brand/60";
const local = (d) => format(new Date(d), "yyyy-MM-dd'T'HH:mm");

export default function EventForm({ teamId, event, defaultDate, onSaved, onClose }) {
  const start = event ? new Date(event.starts_at) : new Date(defaultDate);
  if (!event) start.setHours(19, 0, 0, 0);

  const [type, setType] = useState(event?.type ?? "training");
  const [title, setTitle] = useState(event?.title ?? "");
  const [startsAt, setStartsAt] = useState(local(start));
  const [endsAt, setEndsAt] = useState(local(event ? event.ends_at : new Date(start.getTime() + 2 * 3600000)));
  const [opponent, setOpponent] = useState(event?.opponent ?? "");
  const [link, setLink] = useState(event?.link ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [repeat, setRepeat] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (new Date(endsAt) <= new Date(startsAt)) return toast.error("The end must be after the start.");
    setSaving(true);
    const values = {
      type,
      title: title.trim() || EVENT_TYPES[type].label,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      opponent: opponent.trim() || null,
      link: link.trim() || null,
      notes: notes.trim() || null,
    };
    try {
      const saved = event
        ? [await updateEvent(event.id, values)]
        : await insertEvent({ ...values, team_id: teamId }, repeat);
      onSaved(saved);
    } catch (error) {
      toast.error(`Could not save the event: ${error.message}`);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        {Object.entries(EVENT_TYPES).map(([key, t]) => (
          <button
            type="button"
            key={key}
            onClick={() => setType(key)}
            className={`min-h-11 flex-1 rounded-lg text-sm font-semibold ${type === key ? `${t.color} text-white` : "bg-white/[0.05] text-zinc-400 hover:bg-white/10"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input className={input} placeholder={`Title (default: ${EVENT_TYPES[type].label})`} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-zinc-400">
          Starts
          <input type="datetime-local" required className={input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-400">
          Ends
          <input type="datetime-local" required className={input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </label>
      </div>
      {(type === "scrim" || type === "match") && (
        <input className={input} placeholder="Opponent" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
      )}
      <input className={input} placeholder="Link (lobby, VOD, Discord...)" value={link} onChange={(e) => setLink(e.target.value)} />
      <textarea className={input} rows={3} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {!event && (
        <label className="text-sm text-zinc-300 flex items-center gap-2">
          Repeat weekly for
          <input type="number" min={0} max={12} className="min-h-11 w-20 rounded-lg border border-line bg-black/30 px-2" value={repeat} onChange={(e) => setRepeat(Math.min(12, Math.max(0, Number(e.target.value) || 0)))} />
          more weeks
        </label>
      )}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white/[0.05] px-4 text-sm font-semibold hover:bg-white/10">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink hover:bg-brand-soft disabled:opacity-50">
          Save
        </button>
      </div>
    </form>
  );
}
