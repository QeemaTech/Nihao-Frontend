import client from "../../../api/client";

export async function fetchAdminCoupons(params = {}) {
  const response = await client.get("/admin/coupons", { params });
  const payload = response?.data?.data;
  return {
    coupons: payload?.coupons || payload || [],
    meta: payload?.pagination || null,
  };
}

export async function createAdminCoupon(body) {
  const response = await client.post("/admin/coupons", body);
  return response?.data?.data || null;
}

export async function updateAdminCoupon({ id, body }) {
  const response = await client.patch(`/admin/coupons/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminCoupon(id) {
  const response = await client.delete(`/admin/coupons/${id}`);
  return response?.data?.data || null;
}

