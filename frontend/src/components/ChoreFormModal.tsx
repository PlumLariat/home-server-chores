import { useEffect, useState, type FormEvent } from "react";
import { usePeople, useCreateChore } from "../api/chores";
import { usePersonContext } from "../context/PersonContext";
import type { RecurrenceUnit } from "../api/types";

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ChoreFormModal({ isOpen, onClose }: ChoreFormModalProps) {
  const { data: people } = usePeople();
  const { currentPersonId } = usePersonContext();
  const createChore = useCreateChore();

  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | "">("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [repeats, setRepeats] = useState(false);
  const [recurrenceUnit, setRecurrenceUnit] = useState<RecurrenceUnit>("day");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentPersonId && assignedTo === "") {
      setAssignedTo(currentPersonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPersonId]);

  if (!isOpen) return null;

  const reset = () => {
    setDescription("");
    setAssignedTo("");
    setDueDate(todayIso());
    setRepeats(false);
    setRecurrenceUnit("day");
    setRecurrenceInterval(1);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !assignedTo || !dueDate) {
      setError("Description, assignee, and due date are required.");
      return;
    }
    try {
      await createChore.mutateAsync({
        description: description.trim(),
        assigned_to: Number(assignedTo),
        due_date: dueDate,
        recurrence_unit: repeats ? recurrenceUnit : null,
        recurrence_interval: repeats ? recurrenceInterval : 1,
      });
      handleClose();
    } catch {
      setError("Could not create chore. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Chore</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Assigned to
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Select…</option>
              {people?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={repeats}
              onChange={(e) => setRepeats(e.target.checked)}
            />
            Repeats
          </label>
          {repeats && (
            <div className="recurrence-fields">
              Every
              <input
                type="number"
                min={1}
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
              />
              <select
                value={recurrenceUnit}
                onChange={(e) => setRecurrenceUnit(e.target.value as RecurrenceUnit)}
              >
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
              </select>
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createChore.isPending}>
              {createChore.isPending ? "Saving…" : "Create Chore"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
