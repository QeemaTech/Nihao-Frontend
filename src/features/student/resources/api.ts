import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchLessonResources(lessonId: string) {
  const res = await client.get(endpoints.student.lessonResources(lessonId));
  return res?.data?.data ?? [];
}
