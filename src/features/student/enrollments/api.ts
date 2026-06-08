import api from "../../../lib/api";

/** POST /api/v1/student/cohorts/:id/enroll — uses skip403Redirect so quota errors can be handled in UI. */
export async function enrollInCohort(cohortId: string): Promise<unknown> {
  const res = await api.post(`/student/cohorts/${cohortId}/enroll`, {}, { skip403Redirect: true });
  return res?.data?.data ?? null;
}
