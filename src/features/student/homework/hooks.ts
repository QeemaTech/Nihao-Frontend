import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHomeworkAssignment, fetchHomeworkByCohort, fetchMyHomework, submitHomework } from "./api";

export function useHomeworkList(cohortId: string | undefined) {
  return useQuery({
    queryKey: ["student", "homework", cohortId],
    queryFn: () => fetchHomeworkByCohort(cohortId as string),
    enabled: !!cohortId,
    retry: false,
  });
}

export function useMyHomework() {
  return useQuery({
    queryKey: ["student", "homework", "mine"],
    queryFn: fetchMyHomework,
    retry: false,
  });
}

export function useHomeworkAssignment(homeworkId: string | undefined) {
  return useQuery({
    queryKey: ["student", "homework", "assignment", homeworkId],
    queryFn: () => fetchHomeworkAssignment(homeworkId as string),
    enabled: !!homeworkId,
    retry: false,
  });
}

export function useSubmitHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      homeworkId,
      cohortId,
      body,
    }: {
      homeworkId: string;
      cohortId?: string;
      body: { content?: string | null; fileUrl?: string | null } | FormData;
    }) => submitHomework(homeworkId, body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "homework", "mine"] });
      void qc.invalidateQueries({ queryKey: ["student", "homework", "assignment", v.homeworkId] });
      if (v.cohortId) void qc.invalidateQueries({ queryKey: ["student", "homework", v.cohortId] });
    },
  });
}
