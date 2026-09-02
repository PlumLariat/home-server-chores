import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Chore, NewChoreInput, Person } from "./types";

export interface ChoreListParams {
  due_date_after?: string;
  due_date_before?: string;
  is_completed?: boolean;
  assigned_to?: number;
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useChores(params: ChoreListParams = {}) {
  return useQuery({
    queryKey: ["chores", params],
    queryFn: () => apiClient.get<Chore[]>(`/chores/${buildQuery(params)}`),
  });
}

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: () => apiClient.get<Person[]>("/people/"),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<Person>("/people/", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useCreateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewChoreInput) => apiClient.post<Chore>("/chores/", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });
}

export function useUpdateChoreCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      is_completed,
      completed_by,
    }: {
      id: number;
      is_completed: boolean;
      completed_by?: number | null;
    }) => apiClient.patch<Chore>(`/chores/${id}/`, { is_completed, completed_by }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });
}
