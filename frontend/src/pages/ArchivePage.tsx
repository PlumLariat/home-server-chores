import { useMemo, useState } from "react";
import { useChores, usePeople } from "../api/chores";

export function ArchivePage() {
  const [personFilter, setPersonFilter] = useState<number | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: people } = usePeople();
  const { data: chores, isLoading } = useChores({
    is_completed: true,
    due_date_after: fromDate || undefined,
    due_date_before: toDate || undefined,
    assigned_to: personFilter || undefined,
  });

  const sorted = useMemo(
    () =>
      [...(chores ?? [])].sort((a, b) =>
        (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
      ),
    [chores]
  );

  return (
    <div className="view archive-view">
      <div className="view-header archive-filters">
        <label>
          From <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          To <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <label>
          Person
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">All</option>
            {people?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isLoading && <p>Loading…</p>}
      <table className="archive-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Assigned to</th>
            <th>Completed by</th>
            <th>Due date</th>
            <th>Completed at</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((chore) => (
            <tr key={chore.id}>
              <td>{chore.description}</td>
              <td>{chore.assigned_to_name}</td>
              <td>{chore.completed_by_name ?? "—"}</td>
              <td>{chore.due_date}</td>
              <td>{chore.completed_at ? new Date(chore.completed_at).toLocaleString() : "—"}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                No completed chores match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
