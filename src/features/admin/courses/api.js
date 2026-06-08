import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminCourses(params) {
  const response = await client.get(endpoints.admin.courses, { params });
  const payload = response?.data?.data;
  return {
    courses: payload?.courses || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
  };
}

export async function fetchAdminCourse(id) {
  const response = await client.get(`${endpoints.admin.courses}/${id}`);
  return response?.data?.data || null;
}

export async function createAdminCourse(body) {
  const response = await client.post(endpoints.admin.courses, body);
  return response?.data?.data || null;
}

export async function updateAdminCourse({ id, body }) {
  const response = await client.patch(`${endpoints.admin.courses}/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminCourse(id) {
  const response = await client.delete(`${endpoints.admin.courses}/${id}`);
  return response?.data?.data || null;
}

export async function createAdminUnit(body) {
  const response = await client.post("/admin/units", body);
  return response?.data?.data || null;
}

export async function updateAdminUnit({ id, body }) {
  const response = await client.patch(`/admin/units/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminUnit(id) {
  const response = await client.delete(`/admin/units/${id}`);
  return response?.data?.data || null;
}

export async function createAdminLesson(body) {
  const response = await client.post("/admin/lessons", body);
  return response?.data?.data || null;
}

export async function updateAdminLesson({ id, body }) {
  const response = await client.patch(`/admin/lessons/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminLesson(id) {
  const response = await client.delete(`/admin/lessons/${id}`);
  return response?.data?.data || null;
}

export async function assignAdminCourseInstructor({ id, instructorId }) {
  const response = await client.patch(`${endpoints.admin.courses}/${id}/assign-instructor`, { instructorId });
  return response?.data?.data || null;
}

export async function fetchAdminUnits(params = {}) {
  const response = await client.get("/admin/units", { params });
  const payload = response?.data?.data;
  return {
    units: payload?.units || payload || [],
    meta: payload?.pagination || null,
  };
}
