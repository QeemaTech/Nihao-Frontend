import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCompletedLessonIds,
  fetchCohortProgressStats,
  fetchCohortResume,
  postLessonAccess,
  postLessonComplete,
} from "./api";

export function useCohortProgressStats(cohortId: string | undefined) {
  return useQuery({
    queryKey: ["student", "progress-stats", cohortId],
    queryFn: () => fetchCohortProgressStats(cohortId as string),
    enabled: !!cohortId,
    retry: false,
  });
}

export function useCohortResume(cohortId: string | undefined) {
  return useQuery({
    queryKey: ["student", "progress-resume", cohortId],
    queryFn: () => fetchCohortResume(cohortId as string),
    enabled: !!cohortId,
    retry: false,
  });
}

export function useCompletedLessonIds(cohortId: string | undefined) {
  return useQuery({
    queryKey: ["student", "completed-lessons", cohortId],
    queryFn: () => fetchCompletedLessonIds(cohortId as string),
    enabled: !!cohortId,
    retry: false,
  });
}

export function useTrackLessonAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      cohortId,
      watchPercentage,
    }: {
      lessonId: string;
      cohortId: string;
      watchPercentage?: number;
    }) => postLessonAccess(lessonId, cohortId, watchPercentage),
    retry: false,
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "progress-stats", v.cohortId] });
    },
  });
}

export function useMarkLessonComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, cohortId }: { lessonId: string; cohortId: string }) => postLessonComplete(lessonId, cohortId),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "progress-stats", v.cohortId] });
      void qc.invalidateQueries({ queryKey: ["student", "completed-lessons", v.cohortId] });
      void qc.invalidateQueries({ queryKey: ["student", "progress-resume", v.cohortId] });
    },
  });
}
