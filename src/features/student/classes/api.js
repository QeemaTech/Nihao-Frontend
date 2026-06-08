import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchStudentClasses() {
  const res = await client.get(endpoints.student.classes);
  return res?.data?.data ?? [];
}
