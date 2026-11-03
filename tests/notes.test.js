import { describe, expect, it } from "vitest";
import { isOverdue, sortNotes } from "@/lib/notes";

const note = (id, kind, extra = {}) => ({ id, kind, status: "open", due_date: null, created_at: `2026-11-0${id}T10:00:00Z`, ...extra });

describe("sortNotes", () => {
  it("splits goals from notes", () => {
    const { goals, notes } = sortNotes([note(1, "note"), note(2, "goal"), note(3, "note")]);
    expect(goals.map((g) => g.id)).toEqual([2]);
    expect(notes.map((n) => n.id)).toEqual([3, 1]); // newest first
  });

  it("lists open goals by due date, undated ones after, and done goals last", () => {
    const { goals } = sortNotes([
      note(1, "goal", { status: "done", due_date: "2026-11-01" }),
      note(2, "goal"),
      note(3, "goal", { due_date: "2026-12-01" }),
      note(4, "goal", { due_date: "2026-11-15" }),
    ]);
    expect(goals.map((g) => g.id)).toEqual([4, 3, 2, 1]);
  });
});

describe("isOverdue", () => {
  const today = new Date("2026-11-10T12:00:00Z");

  it("flags open goals whose due date has passed", () => {
    expect(isOverdue(note(1, "goal", { due_date: "2026-11-09" }), today)).toBe(true);
  });

  it("does not flag today, future, done or undated goals, or notes", () => {
    expect(isOverdue(note(1, "goal", { due_date: "2026-11-10" }), today)).toBe(false);
    expect(isOverdue(note(1, "goal", { due_date: "2026-12-01" }), today)).toBe(false);
    expect(isOverdue(note(1, "goal", { due_date: "2026-11-01", status: "done" }), today)).toBe(false);
    expect(isOverdue(note(1, "goal"), today)).toBe(false);
    expect(isOverdue(note(1, "note", { due_date: "2026-11-01" }), today)).toBe(false);
  });
});
