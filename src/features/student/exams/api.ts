import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchStudentExams() {
  const res = await client.get(endpoints.student.exams);
  return res?.data?.data ?? [];
}

export async function fetchStudentExam(examId: string) {
  const res = await client.get(endpoints.student.exam(examId));
  return res?.data?.data ?? null;
}

export async function startStudentExam(examId: string) {
  const res = await client.post(endpoints.student.examStart(examId));
  return res?.data?.data ?? null;
}

export async function submitStudentExam(examId: string, answers: { questionId: string; answerText: string | null }[]) {
  const res = await client.post(endpoints.student.examSubmit(examId), { answers });
  return res?.data?.data ?? null;
}

export async function fetchExamResult(examId: string, submissionId: string) {
  const res = await client.get(endpoints.student.examResults(examId, submissionId));
  return res?.data?.data ?? null;
}
