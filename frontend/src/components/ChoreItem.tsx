import type { Chore } from "../api/types";
import { recurrenceLabel } from "../utils/recurrence";

interface ChoreItemProps {
  chore: Chore;
  interactive?: boolean;
  compact?: boolean;
  onToggle?: (chore: Chore, isCompleted: boolean) => void;
}

export function ChoreItem({ chore, interactive = false, compact = false, onToggle }: ChoreItemProps) {
  const recurrence = recurrenceLabel(chore.recurrence_unit, chore.recurrence_interval);
  const classes = ["chore-item"];
  if (chore.is_completed) classes.push("completed");
  if (compact) classes.push("compact");

  return (
    <div className={classes.join(" ")}>
      {interactive ? (
        <input
          type="checkbox"
          checked={chore.is_completed}
          onChange={(e) => onToggle?.(chore, e.target.checked)}
        />
      ) : (
        <span className={`status-dot ${chore.is_completed ? "done" : "pending"}`} />
      )}
      <div className="chore-item-body">
        <div className="chore-item-description">{chore.description}</div>
        {!compact && (
          <div className="chore-item-meta">
            {chore.assigned_to_name}
            {recurrence && <span className="chore-recurrence"> · {recurrence}</span>}
            {chore.is_completed && chore.completed_by_name && (
              <span className="chore-completed-by"> · done by {chore.completed_by_name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
