import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import type { AdminPackage, CreatePackageInput, UpdatePackageInput } from "./types";

export async function fetchAdminPackages(): Promise<AdminPackage[]> {
  const response = await client.get(`${endpoints.admin.financials}/packages`);
  const payload = response?.data?.data;
  return Array.isArray(payload) ? payload : [];
}

export async function fetchAdminPackage(id: string): Promise<AdminPackage | null> {
  const response = await client.get(`${endpoints.admin.financials}/packages/${id}`);
  return (response?.data?.data as AdminPackage) ?? null;
}

export async function createAdminPackage(body: CreatePackageInput): Promise<AdminPackage | null> {
  const response = await client.post(`${endpoints.admin.financials}/packages`, body);
  return (response?.data?.data as AdminPackage) ?? null;
}

export async function updateAdminPackage(args: {
  id: string;
  body: UpdatePackageInput;
}): Promise<AdminPackage | null> {
  const response = await client.patch(`${endpoints.admin.financials}/packages/${args.id}`, args.body);
  return (response?.data?.data as AdminPackage) ?? null;
}

export async function deleteAdminPackage(id: string): Promise<{ id: string; deleted: boolean } | null> {
  const response = await client.delete(`${endpoints.admin.financials}/packages/${id}`);
  return (response?.data?.data as { id: string; deleted: boolean }) ?? null;
}
