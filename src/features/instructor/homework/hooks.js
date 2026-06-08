import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInstructorHomeworkQueue,
  gradeHomeworkSubmission,
  patchHomeworkSubmissionReviewStatus,
} from "./api";

export function useInstructorHomeworkQueue() {
  return useQuery({
    queryKey: ["instructor", "homework", "queue"],
    queryFn: fetchInstructorHomeworkQueue,
  });
}

export function usePatchHomeworkReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, instructorReviewStatus }) =>
      patchHomeworkSubmissionReviewStatus(submissionId, instructorReviewStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}

export function useGradeHomeworkSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, grade, feedback }) =>
      gradeHomeworkSubmission(submissionId, { grade, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}
