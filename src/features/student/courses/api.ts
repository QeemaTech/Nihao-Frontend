import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchMyCourses() {
  const res = await client.get(endpoints.student.myCourses);
  return res?.data?.data ?? [];
}

export async function fetchCourseUnits(courseId: string) {
  const res = await client.get(endpoints.student.courseUnits(courseId));
  return res?.data?.data ?? [];
}
