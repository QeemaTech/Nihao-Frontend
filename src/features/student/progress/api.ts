import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchCohortProgressStats(cohortId: string) {
  const res = await client.get(endpoints.student.progressStats(cohortId));
  return res?.data?.data ?? null;
}

export async function fetchCohortResume(cohortId: string) {
  const res = await client.get(endpoints.student.progressResume(cohortId));
  return res?.data?.data ?? null;
}

export async function fetchCompletedLessonIds(cohortId: string) {
  const res = await client.get(endpoints.student.progressCompletedLessons(cohortId));
  return res?.data?.data?.lessonIds ?? [];
}

export async function postLessonAccess(lessonId: string, cohortId: string, watchPercentage = 0) {
  const res = await client.post(endpoints.student.progressLessonAccess(lessonId), { cohortId, watchPercentage });
  return res?.data?.data ?? null;
}

export async function postLessonComplete(lessonId: string, cohortId: string) {
  const res = await client.post(endpoints.student.progressLessonComplete(lessonId), { cohortId });
  return res?.data?.data ?? null;
}
