"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, startOfMonth, startOfWeek,
} from "date-fns";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { toast } from "react-toastify";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchEvents } from "@/hooks/schedule";
import { EVENT_TYPES } from "@/lib/constants";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EventForm from "@/components/schedule/EventForm";
import EventDetail, { availableCount } from "@/components/schedule/EventDetail";

const WEEK = { weekStartsOn: 1 };

const Schedule = () => {
  const { teams, activeTeamId, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null); // { event?, date? }

  const range = useMemo(() => {
    const from = view === "month" ? startOfWeek(startOfMonth(cursor), WEEK) : startOfWeek(cursor, WEEK);
    const to = view === "month" ? endOfWeek(endOfMonth(cursor), WEEK) : endOfWeek(cursor, WEEK);
    return { from, to, days: eachDayOfInterval({ start: from, end: to }) };
  }, [view, cursor]);

  const load = useCallback(async () => {
    if (!activeTeamId) return setEvents([]);
    try {
      setEvents(await fetchEvents(activeTeamId, range.from, new Date(range.to.getTime() + 1)));
    } catch (error) {
      toast.error(`Could not load events: ${error.message}`);
    }
  }, [activeTeamId, range]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = events.find((e) => e.id === selectedId);
  const step = (dir) => setCursor((c) => (view === "month" ? addMonths(c, dir) : addWeeks(c, dir)));
  const title = view === "month" ? format(cursor, "MMMM yyyy") : `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yyyy")}`;
  const replace = (event) => setEvents((list) => list.map((e) => (e.id === event.id ? event : e)));

  function handleSaved(saved) {
    setForm(null);
    load();
    if (saved.length === 1) setSelectedId(saved[0].id);
  }

  if (loaded && teams.length === 0) {
    return (
      <>
        <PageHeader icon={FaCalendar} title="Schedule" />
        <p className="p-6 text-zinc-400">Create a team first to plan its schedule.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader icon={FaCalendar} title="Schedule">
        <button
          onClick={() => setForm({ date: new Date() })}
          disabled={!activeTeamId}
          className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100 disabled:opacity-50"
        >
          New event
        </button>
      </PageHeader>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <button aria-label="Previous" onClick={() => step(-1)} className="p-2 bg-zinc-800 rounded-md"><FaChevronLeft /></button>
            <button onClick={() => setCursor(new Date())} className="px-3 py-1 bg-zinc-800 rounded-md text-sm">Today</button>
            <button aria-label="Next" onClick={() => step(1)} className="p-2 bg-zinc-800 rounded-md"><FaChevronRight /></button>
            <span className="ml-2 font-bold">{title}</span>
          </div>
          <div className="flex gap-1 bg-zinc-800 rounded-md p-1">
            {["month", "week"].map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded-md text-sm capitalize ${view === v ? "bg-zinc-600" : "text-zinc-400"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
          {Object.values(EVENT_TYPES).map((t) => (
            <span key={t.label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${t.dot}`} /> {t.label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-zinc-800 border border-zinc-800 rounded-md overflow-hidden">
          {range.days.slice(0, 7).map((d) => (
            <div key={d.toISOString()} className="bg-zinc-900 text-center text-xs text-zinc-400 py-1">
              {format(d, "EEE")}
            </div>
          ))}
          {range.days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.starts_at), day));
            const muted = view === "month" && !isSameMonth(day, cursor);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setForm({ date: day })}
                className={`bg-zinc-950 p-1 cursor-pointer hover:bg-zinc-900 ${view === "month" ? "min-h-20" : "min-h-48"} ${muted ? "opacity-40" : ""}`}
              >
                <div className={`text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? "bg-cyan-500 text-zinc-950" : "text-zinc-400"}`}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-col gap-1">
                  {dayEvents.map((e) => {
                    const n = availableCount(e, players);
                    return (
                      <button
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedId(e.id);
                        }}
                        className={`${EVENT_TYPES[e.type].color} text-white text-left text-xs rounded px-1 py-0.5 truncate`}
                      >
                        {format(new Date(e.starts_at), "HH:mm")} {e.title}
                        {players.length > 0 && <span className="opacity-80"> · {n}/{players.length}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        show={!!selected}
        onClose={() => setSelectedId(null)}
        content={
          selected && (
            <EventDetail
              event={selected}
              players={players}
              onChange={replace}
              onEdit={(event) => {
                setSelectedId(null);
                setForm({ event });
              }}
              onDeleted={(id) => {
                setEvents((list) => list.filter((e) => e.id !== id));
                setSelectedId(null);
              }}
            />
          )
        }
      />
      <Modal
        show={!!form}
        onClose={() => setForm(null)}
        content={form && <EventForm teamId={activeTeamId} event={form.event} defaultDate={form.date} onSaved={handleSaved} onClose={() => setForm(null)} />}
      />
    </>
  );
};

export default Schedule;
