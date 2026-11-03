// Goals first (open ones by due date, then done), then notes, newest first.
export function sortNotes(notes) {
  const goals = notes
    .filter((n) => n.kind === "goal")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  const rest = notes.filter((n) => n.kind !== "goal").sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { goals, notes: rest };
}

export const isOverdue = (goal, today = new Date()) =>
  goal.kind === "goal" && goal.status === "open" && !!goal.due_date && goal.due_date < today.toISOString().slice(0, 10);
