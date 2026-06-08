import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCohort,
  deleteAdminCohort,
  fetchAdminCohort,
  fetchAdminCohorts,
  updateAdminCohort,
} from "./api";
import type { AdminCohortListParams, CreateCohortInput, UpdateCohortInput } from "./types";

export function useAdminCohorts(params: AdminCohortListParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: ["admin", "cohorts", rest],
    queryFn: () => fetchAdminCohorts(rest),
    enabled,
    retry: false,
  });
}

export function useAdminCohort(id: string | null) {
  return useQuery({
    queryKey: ["admin", "cohort", id],
    queryFn: () => fetchAdminCohort(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateAdminCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCohortInput) => createAdminCohort(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "cohorts"] });
    },
  });
}

export function useUpdateAdminCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateCohortInput }) => updateAdminCohort(args),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "cohorts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "cohort", vars.id] });
    },
  });
}

export function useDeleteAdminCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminCohort(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "cohorts"] });
    },
  });
}
