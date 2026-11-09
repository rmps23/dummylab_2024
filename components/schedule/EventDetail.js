"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { deleteEvent, setAvailability } from "@/hooks/schedule";
import { AVAILABILITY, EVENT_TYPES } from "@/lib/constants";
import { availableCount, rosterShort, statusFor } from "@/lib/availability";
import { teamStore } from "@/store/teamStore";

export default function EventDetail({ event, players, timeZone, onChange, onEdit, onDeleted }) {
  const t = EVENT_TYPES[event.type];
  const available = availableCount(event, players);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reminding, setReminding] = useState(false);
  const team = teamStore((s) => s.teams.find((t) => t.id === event.team_id));

  async function handleStatus(player_id, status) {
    try {
      await setAvailability(event.id, player_id, status);
      const others = (event.participants || []).filter((p) => p.player_id !== player_id);
      onChange({ ...event, participants: [...others, { player_id, status }] });
    } catch (error) {
      toast.error(`Could not save availability: ${error.message}`);
    }
  }

  async function handleRemind() {
    setReminding(true);
    try {
      const response = await fetch(`/api/events/${event.id}/remind`, { method: "POST" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not send the reminder");
      toast.success("Reminder sent to Discord");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReminding(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteEvent(event.id);
      onDeleted(event.id);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={`${t.color} rounded-md px-2 py-0.5 text-xs text-white`}>{t.label}</span>
        <h2 className="mt-2 text-lg">{event.title}</h2>
        <p className="text-sm text-zinc-400">
          {format(new Date(event.starts_at), "EEE d MMM, HH:mm")} – {format(new Date(event.ends_at), "HH:mm")}
          {event.opponent && ` · vs ${event.opponent}`}
        </p>
        {timeZone && <p className="text-xs text-zinc-400">Times in {timeZone.replace("_", " ")}</p>}
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-brand underline">
            {event.link}
          </a>
        )}
        {event.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{event.notes}</p>}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold">Availability</h3>
          <span className={`text-sm ${available >= 5 ? "text-emerald-400" : "text-amber-400"}`}>
            {available}/{players.length} available{rosterShort(event, players) ? " · not enough for a full roster" : ""}
          </span>
        </div>
        <p className="mb-2 text-xs text-zinc-400">
          Set each player&apos;s answer: {Object.values(AVAILABILITY).slice(1).map((a) => `${a.short} ${a.label}`).join(", ")}.
          Players without an answer count as pending.
        </p>
        {players.length === 0 ? (
          <p className="text-sm text-zinc-400">This team has no players yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const current = statusFor(event, p.id);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] p-2">
                  <div className="min-w-0 truncate text-sm">
                    {p.name} <span className="text-zinc-400">· {p.role?.name}</span>
                    {current === "pending" && <span className="ml-2 text-xs text-amber-400">pending</span>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {["available", "maybe", "unavailable"].map((s) => (
                      <button
                        key={s}
                        title={AVAILABILITY[s].label}
                        aria-label={`${p.name}: ${AVAILABILITY[s].label}`}
                        aria-pressed={current === s}
                        onClick={() => handleStatus(p.id, s)}
                        className={`h-11 w-11 rounded-lg text-sm ${current === s ? AVAILABILITY[s].color : "bg-white/[0.06] text-zinc-400 hover:bg-white/10"}`}
                      >
                        {AVAILABILITY[s].short}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="min-h-11 rounded-lg bg-rose-600/90 px-4 text-sm font-semibold">
              Yes, delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="min-h-11 rounded-lg bg-white/10 px-4 text-sm">
              Keep
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="min-h-11 rounded-lg bg-rose-600/90 px-4 text-sm font-semibold">
            Delete
          </button>
        )}
        {team?.discord_webhook_url && (
          <button onClick={handleRemind} disabled={reminding} className="min-h-11 rounded-lg border border-line bg-white/[0.05] px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-50">
            Remind on Discord
          </button>
        )}
        <button onClick={() => onEdit(event)} className="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink">
          Edit
        </button>
      </div>
    </div>
  );
}
