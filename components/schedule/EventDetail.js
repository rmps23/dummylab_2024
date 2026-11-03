"use client";

import { format } from "date-fns";
import { toast } from "react-toastify";
import { deleteEvent, setAvailability } from "@/hooks/schedule";
import { AVAILABILITY, EVENT_TYPES } from "@/lib/constants";

export const statusFor = (event, player_id) =>
  event.participants?.find((p) => p.player_id === player_id)?.status ?? "pending";

export function availableCount(event, players) {
  return players.filter((p) => statusFor(event, p.id) === "available").length;
}

export default function EventDetail({ event, players, onChange, onEdit, onDeleted }) {
  const t = EVENT_TYPES[event.type];
  const available = availableCount(event, players);

  async function handleStatus(player_id, status) {
    try {
      await setAvailability(event.id, player_id, status);
      const others = (event.participants || []).filter((p) => p.player_id !== player_id);
      onChange({ ...event, participants: [...others, { player_id, status }] });
    } catch (error) {
      toast.error(`Could not save availability: ${error.message}`);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this event?")) return;
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
        <span className={`${t.color} text-white text-xs px-2 py-0.5 rounded-md`}>{t.label}</span>
        <h2 className="text-lg mt-2">{event.title}</h2>
        <p className="text-sm text-zinc-400">
          {format(new Date(event.starts_at), "EEE d MMM, HH:mm")} – {format(new Date(event.ends_at), "HH:mm")}
          {event.opponent && ` · vs ${event.opponent}`}
        </p>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 underline break-all">
            {event.link}
          </a>
        )}
        {event.notes && <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{event.notes}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Availability</h3>
          <span className={`text-sm ${available >= 5 ? "text-emerald-400" : "text-amber-400"}`}>
            {available}/{players.length} available{players.length >= 5 && available < 5 ? " · not enough for a full roster" : ""}
          </span>
        </div>
        {players.length === 0 ? (
          <p className="text-sm text-zinc-400">This team has no players yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const current = statusFor(event, p.id);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 bg-zinc-900 rounded-md p-2">
                  <div className="min-w-0 text-sm truncate">
                    {p.name} <span className="text-zinc-500">· {p.role?.name}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {["available", "maybe", "unavailable"].map((s) => (
                      <button
                        key={s}
                        title={AVAILABILITY[s].label}
                        aria-label={`${p.name}: ${AVAILABILITY[s].label}`}
                        aria-pressed={current === s}
                        onClick={() => handleStatus(p.id, s)}
                        className={`w-8 h-8 rounded-md text-sm ${current === s ? AVAILABILITY[s].color : "bg-zinc-800 text-zinc-500"}`}
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

      <div className="flex gap-3 justify-between">
        <button onClick={handleDelete} className="bg-red-700 py-1 px-3 rounded-md text-sm">
          Delete
        </button>
        <button onClick={() => onEdit(event)} className="bg-zinc-100 text-zinc-950 py-1 px-3 rounded-md text-sm">
          Edit
        </button>
      </div>
    </div>
  );
}
