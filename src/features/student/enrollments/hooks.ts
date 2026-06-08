import { useMutation } from "@tanstack/react-query";
import { enrollInCohort } from "./api";

export function useEnrollInCohort() {
  return useMutation({
    mutationFn: (cohortId: string) => enrollInCohort(cohortId),
  });
}
