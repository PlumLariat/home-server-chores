export interface Person {
  id: number;
  name: string;
  created_at: string;
}

export type RecurrenceUnit = "day" | "week" | "month";

export interface Chore {
  id: number;
  description: string;
  assigned_to: number;
  assigned_to_name: string;
  due_date: string;
  recurrence_unit: RecurrenceUnit | null;
  recurrence_interval: number;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: number | null;
  completed_by_name: string | null;
  created_at: string;
}

export interface NewChoreInput {
  description: string;
  assigned_to: number;
  due_date: string;
  recurrence_unit: RecurrenceUnit | null;
  recurrence_interval: number;
}
