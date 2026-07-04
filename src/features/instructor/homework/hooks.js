import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInstructorHomeworkQueue,
  gradeHomeworkSubmission,
  patchHomeworkSubmissionReviewStatus,
  fetchInstructorHomeworks,
  updateInstructorHomework,
  deleteInstructorHomework,
} from "./api";

export function useInstructorHomeworkQueue() {
  return useQuery({
    queryKey: ["instructor", "homework", "queue"],
    queryFn: fetchInstructorHomeworkQueue,
  });
}

export function useInstructorHomeworks() {
  return useQuery({
    queryKey: ["instructor", "homework", "list"],
    queryFn: fetchInstructorHomeworks,
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

export function useUpdateInstructorHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ homeworkId, body }) => updateInstructorHomework(homeworkId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}

export function useDeleteInstructorHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (homeworkId) => deleteInstructorHomework(homeworkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}

