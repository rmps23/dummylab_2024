"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCircleCheck, FaRegCircle, FaTrash } from "react-icons/fa6";
import { addNote, deleteNote, fetchNotes, updateNote } from "@/hooks/players";
import { isOverdue, sortNotes } from "@/lib/notes";
import { btnPrimary, iconBtn, inputClass } from "@/components/ui/buttons";

export default function PlayerNotes({ player }) {
  const [items, setItems] = useState(null);
  const [kind, setKind] = useState("goal");
  const [body, setBody] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes(player.id)
      .then(setItems)
      .catch((e) => {
        toast.error(e.message);
        setItems([]);
      });
  }, [player.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!body.trim() || saving) return;
    setSaving(true);
    try {
      const created = await addNote({ player_id: player.id, kind, body: body.trim(), due_date: kind === "goal" ? due : null });
      setItems((list) => [created, ...list]);
      setBody("");
      setDue("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(goal) {
    try {
      const updated = await updateNote(goal.id, { status: goal.status === "open" ? "done" : "open" });
      setItems((list) => list.map((n) => (n.id === goal.id ? updated : n)));
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove(note) {
    try {
      await deleteNote(note.id);
      setItems((list) => list.filter((n) => n.id !== note.id));
    } catch (error) {
      toast.error(error.message);
    }
  }

  const { goals, notes } = sortNotes(items || []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold">Notes and goals for {player.name}</h2>
        <p className="mt-1 text-sm text-zinc-400">Private to you. Players never see these.</p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
        <div role="group" aria-label="Type" className="flex gap-2">
          {[["goal", "Goal"], ["note", "Note"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`min-h-11 flex-1 rounded-lg text-sm font-semibold ${kind === value ? "bg-brand/20 text-brand" : "bg-white/[0.05] text-zinc-400 hover:bg-white/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <textarea
          aria-label={kind === "goal" ? "Goal" : "Note"}
          rows={3}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === "goal" ? "e.g. Reach 7.5 CS/min by the end of the month" : "e.g. Overextends in lane when ahead; talk about wave control"}
          className={`${inputClass} py-2`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {kind === "goal" && (
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              Due
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputClass} w-auto`} />
            </label>
          )}
          <button type="submit" disabled={!body.trim() || saving} className={`${btnPrimary} ml-auto`}>
            Add {kind}
          </button>
        </div>
      </form>

      {items === null ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Nothing yet. Add a goal to track progress, or a note after a review.</p>
      ) : (
        <>
          {goals.length > 0 && (
            <section>
              <h3 className="eyebrow mb-2">Goals</h3>
              <ul className="flex flex-col gap-2">
                {goals.map((g) => (
                  <li key={g.id} className="flex items-start gap-2 rounded-lg bg-white/[0.04] p-2">
                    <button
                      onClick={() => toggle(g)}
                      aria-label={g.status === "done" ? "Mark as open" : "Mark as done"}
                      aria-pressed={g.status === "done"}
                      className={`${iconBtn} shrink-0`}
                    >
                      {g.status === "done" ? <FaCircleCheck className="text-win" /> : <FaRegCircle />}
                    </button>
                    <div className="min-w-0 flex-1 py-2">
                      <p className={`whitespace-pre-wrap break-words text-sm ${g.status === "done" ? "text-zinc-400 line-through" : ""}`}>{g.body}</p>
                      {g.due_date && (
                        <p className={`mt-1 text-xs ${isOverdue(g) ? "font-bold text-loss" : "text-zinc-400"}`}>
                          Due {new Date(g.due_date).toLocaleDateString("en-GB")}
                          {isOverdue(g) && " · overdue"}
                        </p>
                      )}
                    </div>
                    <button onClick={() => remove(g)} aria-label="Delete goal" className={iconBtn}>
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {notes.length > 0 && (
            <section>
              <h3 className="eyebrow mb-2">Notes</h3>
              <ul className="flex flex-col gap-2">
                {notes.map((n) => (
                  <li key={n.id} className="flex items-start gap-2 rounded-lg bg-white/[0.04] p-2">
                    <div className="min-w-0 flex-1 px-2 py-2">
                      <p className="whitespace-pre-wrap break-words text-sm">{n.body}</p>
                      <p className="mt-1 text-xs text-zinc-400">{new Date(n.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                    <button onClick={() => remove(n)} aria-label="Delete note" className={iconBtn}>
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
