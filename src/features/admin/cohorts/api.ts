import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import type {
  AdminCohortDetail,
  AdminCohortListParams,
  AdminCohortListResponse,
  CreateCohortInput,
  UpdateCohortInput,
} from "./types";

export async function fetchAdminCohorts(
  params: AdminCohortListParams
): Promise<AdminCohortListResponse> {
  const response = await client.get(endpoints.admin.classes, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      instructorId: params.instructorId,
      courseId: params.courseId,
      type: params.type,
    },
  });
  const payload = response?.data?.data as Partial<AdminCohortListResponse> | undefined;
  return {
    classes: payload?.classes ?? [],
    total: Number(payload?.total ?? 0),
    page: Number(payload?.page ?? 1),
    limit: Number(payload?.limit ?? 10),
  };
}

export async function fetchAdminCohort(id: string): Promise<AdminCohortDetail | null> {
  const response = await client.get(`${endpoints.admin.classes}/${id}`);
  return (response?.data?.data as AdminCohortDetail) ?? null;
}

export async function createAdminCohort(body: CreateCohortInput): Promise<AdminCohortDetail | null> {
  const response = await client.post(endpoints.admin.classes, body);
  return (response?.data?.data as AdminCohortDetail) ?? null;
}

export async function updateAdminCohort(args: {
  id: string;
  body: UpdateCohortInput;
}): Promise<AdminCohortDetail | null> {
  const response = await client.patch(`${endpoints.admin.classes}/${args.id}`, args.body);
  return (response?.data?.data as AdminCohortDetail) ?? null;
}

export async function deleteAdminCohort(id: string): Promise<{ id: string; deleted: boolean } | null> {
  const response = await client.delete(`${endpoints.admin.classes}/${id}`);
  return (response?.data?.data as { id: string; deleted: boolean }) ?? null;
}
