import type { RecurrenceUnit } from "../api/types";

export function recurrenceLabel(unit: RecurrenceUnit | null, interval: number): string | null {
  if (!unit) return null;
  if (interval === 1) return `every ${unit}`;
  return `every ${interval} ${unit}s`;
}
