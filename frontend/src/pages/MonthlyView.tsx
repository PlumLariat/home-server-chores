import { useState } from "react";
import { useChores } from "../api/chores";
import { ChoreItem } from "../components/ChoreItem";
import type { Chore } from "../api/types";

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfCalendarGrid(year: number, month: number): Date {
  const first = new Date(year, month, 1);
  const day = first.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  first.setDate(first.getDate() + diff);
  return first;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthlyView() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const gridStart = startOfCalendarGrid(cursor.year, cursor.month);
  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const rangeStart = toIso(days[0]);
  const rangeEnd = toIso(days[days.length - 1]);
  const { data: chores, isLoading } = useChores({
    due_date_after: rangeStart,
    due_date_before: rangeEnd,
  });

  const choresByDate = new Map<string, Chore[]>();
  chores?.forEach((chore) => {
    const list = choresByDate.get(chore.due_date) ?? [];
    list.push(chore);
    choresByDate.set(chore.due_date, list);
  });

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (delta: number) => {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <div className="view monthly-view">
      <div className="view-header">
        <button onClick={() => changeMonth(-1)}>‹ Prev</button>
        <span>{monthLabel}</span>
        <button onClick={() => changeMonth(1)}>Next ›</button>
      </div>
      {isLoading && <p>Loading…</p>}
      <div className="month-grid">
        {DAY_LABELS.map((label) => (
          <div className="month-grid-label" key={label}>
            {label}
          </div>
        ))}
        {days.map((date) => {
          const iso = toIso(date);
          const inMonth = date.getMonth() === cursor.month;
          const dayChores = choresByDate.get(iso) ?? [];
          return (
            <div className={`month-grid-cell ${inMonth ? "" : "outside-month"}`} key={iso}>
              <div className="month-grid-date">{date.getDate()}</div>
              {dayChores.map((chore) => (
                <ChoreItem key={chore.id} chore={chore} compact />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
