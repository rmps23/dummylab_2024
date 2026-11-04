"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, startOfMonth, startOfWeek,
} from "date-fns";
import { FaCalendar, FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchEvents } from "@/hooks/schedule";
import { AVAILABILITY, EVENT_TYPES } from "@/lib/constants";
import { availableCount } from "@/lib/availability";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { btnPrimary, btnSecondary, iconBtn } from "@/components/ui/buttons";
import EventForm from "@/components/schedule/EventForm";
import EventDetail from "@/components/schedule/EventDetail";
import Agenda from "@/components/schedule/Agenda";

const WEEK = { weekStartsOn: 1 };
const VIEWS = ["month", "week", "agenda"];

const Schedule = () => {
  const { teams, activeTeamId, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null); // { event?, date? }
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (window.matchMedia("(max-width: 639px)").matches) setView("agenda");
  }, []);

  // Agenda lists the whole month; the grids show a month or a week.
  const range = useMemo(() => {
    const byWeek = view === "week";
    const from = byWeek ? startOfWeek(cursor, WEEK) : view === "agenda" ? startOfMonth(cursor) : startOfWeek(startOfMonth(cursor), WEEK);
    const to = byWeek ? endOfWeek(cursor, WEEK) : view === "agenda" ? endOfMonth(cursor) : endOfWeek(endOfMonth(cursor), WEEK);
    return { from, to, days: eachDayOfInterval({ start: from, end: to }) };
  }, [view, cursor]);

  const load = useCallback(async () => {
    if (!activeTeamId) return setEvents([]);
    setError(null);
    try {
      setEvents(await fetchEvents(activeTeamId, range.from, new Date(range.to.getTime() + 1)));
    } catch (e) {
      setError(e.message);
      setEvents([]);
    }
  }, [activeTeamId, range]);

  useEffect(() => {
    setEvents(null);
    load();
  }, [load]);

  const selected = events?.find((e) => e.id === selectedId);
  const step = (dir) => setCursor((c) => (view === "week" ? addWeeks(c, dir) : addMonths(c, dir)));
  const title = view === "week" ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yyyy")}` : format(cursor, "MMMM yyyy");
  const replace = (event) => setEvents((list) => list.map((e) => (e.id === event.id ? event : e)));
  const openForm = (date) => setForm({ date });

  function handleSaved(saved) {
    setForm(null);
    load();
    if (saved.length === 1) setSelectedId(saved[0].id);
  }

  if (loaded && teams.length === 0) {
    return (
      <>
        <PageHeader icon={FaCalendar} title="Schedule" />
        <EmptyState icon={FaCalendar} title="Create a team first">
          The schedule belongs to a team. Create one in the Teams page, then plan trainings, scrims and matches here.
        </EmptyState>
      </>
    );
  }

  const gridClass = view === "agenda" ? "hidden" : "hidden sm:grid";

  return (
    <>
      <PageHeader icon={FaCalendar} title="Schedule" subtitle={timeZone ? `Times shown in ${timeZone.replace("_", " ")}` : undefined}>
        <button onClick={() => openForm(new Date())} disabled={!activeTeamId} className={btnPrimary}>
          <FaPlus aria-hidden="true" /> New event
        </button>
      </PageHeader>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button aria-label="Previous" onClick={() => step(-1)} className={`${iconBtn} border border-white/10 bg-white/[0.04]`}>
              <FaChevronLeft />
            </button>
            <button onClick={() => setCursor(new Date())} className={`${btnSecondary} px-3`}>
              Today
            </button>
            <button aria-label="Next" onClick={() => step(1)} className={`${iconBtn} border border-white/10 bg-white/[0.04]`}>
              <FaChevronRight />
            </button>
            <h2 className="ml-3 text-lg font-bold">{title}</h2>
          </div>
          <div role="group" aria-label="Calendar view" className="hidden gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 sm:flex">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`min-h-9 rounded-lg px-4 text-sm font-semibold capitalize transition ${
                  view === v ? "bg-brand/20 text-brand" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
          {Object.values(EVENT_TYPES).map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${t.dot}`} /> {t.label}
            </span>
          ))}
          <span className="hidden sm:inline">|</span>
          <span>Availability: {Object.values(AVAILABILITY).map((a) => `${a.short} ${a.label}`).join(" · ")}</span>
        </div>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-700 bg-rose-950/40 p-3 text-sm">
            <span>Could not load events: {error}</span>
            <button onClick={load} className={btnSecondary}>
              Retry
            </button>
          </div>
        )}

        {events === null ? (
          <Skeleton className="h-96" />
        ) : (
          <>
            <div className={view === "agenda" ? "block" : "sm:hidden"}>
              <Agenda events={events} players={players} onSelect={setSelectedId} onCreate={() => openForm(new Date())} />
            </div>

            <div className={`${gridClass} animate-rise grid-cols-7 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07] shadow-card`}>
              {range.days.slice(0, 7).map((d) => (
                <div key={d.toISOString()} className="eyebrow bg-raised py-2 text-center">
                  {format(d, "EEE")}
                </div>
              ))}
              {range.days.map((day) => {
                const dayEvents = events.filter((e) => isSameDay(new Date(e.starts_at), day));
                const muted = view === "month" && !isSameMonth(day, cursor);
                const today = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => openForm(day)}
                    className={`cursor-pointer bg-panel p-1.5 transition hover:bg-raised ${view === "month" ? "min-h-24" : "min-h-52"} ${muted ? "opacity-40" : ""} ${today ? "bg-brand/[0.06]" : ""}`}
                  >
                    <button
                      aria-label={`New event on ${format(day, "d MMMM")}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openForm(day);
                      }}
                      className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        today ? "bg-brand text-zinc-950" : "text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map((e) => (
                        <button
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedId(e.id);
                          }}
                          className={`truncate rounded border-l-2 px-1.5 py-0.5 text-left text-[11px] font-semibold transition ${EVENT_TYPES[e.type].chip}`}
                        >
                          {format(new Date(e.starts_at), "HH:mm")} {e.title}
                          {players.length > 0 && (
                            <span className="opacity-80">
                              {" "}
                              · {availableCount(e, players)}/{players.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Modal
        title="Event details"
        show={!!selected}
        onClose={() => setSelectedId(null)}
        content={
          selected && (
            <EventDetail
              event={selected}
              players={players}
              timeZone={timeZone}
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
        title={form?.event ? "Edit event" : "New event"}
        show={!!form}
        onClose={() => setForm(null)}
        content={form && <EventForm teamId={activeTeamId} event={form.event} defaultDate={form.date} onSaved={handleSaved} onClose={() => setForm(null)} />}
      />
    </>
  );
};

export default Schedule;
