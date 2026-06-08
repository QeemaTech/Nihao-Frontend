import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

// Backend currently exposes list endpoint on student scope by lesson.
export async function fetchQuestionsByLesson(lessonId) {
  const response = await client.get(`${endpoints.student.qna}/lessons/${lessonId}/questions`);
  return response?.data?.data || [];
}

export async function replyToQuestion({ questionId, body }) {
  const response = await client.post(`${endpoints.instructor.qna}/questions/${questionId}/answers`, { body });
  return response?.data?.data;
}

export async function toggleResolveQuestion(questionId) {
  const response = await client.patch(`${endpoints.instructor.qna}/questions/${questionId}/resolve`);
  return response?.data?.data;
}
