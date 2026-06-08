import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInstructorExamQuestion,
  createInstructorExam,
  fetchInstructorCourseExamStructure,
  fetchInstructorExamDetail,
  fetchInstructorExamSubmissions,
  fetchInstructorExams,
} from "./api";

export function useInstructorExams(params) {
  return useQuery({
    queryKey: ["instructor", "exams", params],
    queryFn: () => fetchInstructorExams(params),
  });
}

export function useInstructorExamDetail(examId) {
  return useQuery({
    queryKey: ["instructor", "exams", examId, "detail"],
    queryFn: () => fetchInstructorExamDetail(examId),
    enabled: Boolean(examId),
  });
}

export function useInstructorExamSubmissions(examId) {
  return useQuery({
    queryKey: ["instructor", "exams", examId, "submissions"],
    queryFn: () => fetchInstructorExamSubmissions(examId),
    enabled: Boolean(examId),
  });
}

export function useInstructorCourseExamStructure(courseId) {
  return useQuery({
    queryKey: ["instructor", "exams", "structure", courseId],
    queryFn: () => fetchInstructorCourseExamStructure(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCreateInstructorExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructorExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams"] });
    },
  });
}

export function useAddInstructorExamQuestion(examId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => addInstructorExamQuestion(examId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", examId] });
    },
  });
}
