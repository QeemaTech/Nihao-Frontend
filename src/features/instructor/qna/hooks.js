import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQuestionsByLesson, replyToQuestion, toggleResolveQuestion } from "./api";

export function useQuestionsByLesson(lessonId) {
  return useQuery({
    queryKey: ["instructor", "qna", "questions", lessonId],
    queryFn: () => fetchQuestionsByLesson(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useReplyToQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "qna", "questions"] }),
  });
}

export function useToggleResolveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleResolveQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "qna", "questions"] }),
  });
}
