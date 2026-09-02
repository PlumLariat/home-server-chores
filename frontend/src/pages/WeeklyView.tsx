import { useState } from "react";
import { useChores } from "../api/chores";
import { ChoreItem } from "../components/ChoreItem";
import type { Chore } from "../api/types";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyView() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = addDays(weekStart, 6);
  const { data: chores, isLoading } = useChores({
    due_date_after: toIso(weekStart),
    due_date_before: toIso(weekEnd),
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const choresByDate = new Map<string, Chore[]>();
  days.forEach((day) => choresByDate.set(toIso(day), []));
  chores?.forEach((chore) => {
    choresByDate.get(chore.due_date)?.push(chore);
  });

  return (
    <div className="view weekly-view">
      <div className="view-header">
        <button onClick={() => setWeekStart((d) => addDays(d, -7))}>‹ Prev week</button>
        <span>
          {toIso(weekStart)} – {toIso(weekEnd)}
        </span>
        <button onClick={() => setWeekStart((d) => addDays(d, 7))}>Next week ›</button>
      </div>
      {isLoading && <p>Loading…</p>}
      <div className="week-grid">
        {days.map((day, i) => {
          const iso = toIso(day);
          const dayChores = choresByDate.get(iso) ?? [];
          return (
            <div className="week-day-column" key={iso}>
              <div className="week-day-header">
                {DAY_LABELS[i]} <span>{iso}</span>
              </div>
              {dayChores.map((chore) => (
                <ChoreItem key={chore.id} chore={chore} />
              ))}
              {dayChores.length === 0 && <p className="empty">—</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
