import { useState } from "react";
import { useChores, useUpdateChoreCompletion } from "../api/chores";
import { usePersonContext } from "../context/PersonContext";
import { ChoreItem } from "../components/ChoreItem";
import type { Chore } from "../api/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function DailyView() {
  const [date, setDate] = useState(todayIso());
  const { currentPersonId } = usePersonContext();
  const { data: chores, isLoading } = useChores({
    due_date_after: date,
    due_date_before: date,
  });
  const updateCompletion = useUpdateChoreCompletion();

  const handleToggle = (chore: Chore, isCompleted: boolean) => {
    updateCompletion.mutate({
      id: chore.id,
      is_completed: isCompleted,
      completed_by: isCompleted ? currentPersonId : null,
    });
  };

  return (
    <div className="view daily-view">
      <div className="view-header">
        <button onClick={() => setDate((d) => shiftDate(d, -1))}>‹</button>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={() => setDate((d) => shiftDate(d, 1))}>›</button>
        <button onClick={() => setDate(todayIso())}>Today</button>
      </div>
      {!currentPersonId && (
        <p className="hint">Select who you are in the top bar before checking off chores.</p>
      )}
      {isLoading && <p>Loading…</p>}
      <div className="chore-list">
        {chores?.length === 0 && <p className="empty">No chores due this day.</p>}
        {chores?.map((chore) => (
          <ChoreItem key={chore.id} chore={chore} interactive onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
