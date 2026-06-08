import client from "../../../api/client";

export async function fetchAdminCertificates(params = {}) {
  const response = await client.get("/admin/certificates", { params });
  const payload = response?.data?.data;
  return {
    certificates: payload?.certificates || payload || [],
    total: payload?.total || 0,
  };
}

export async function issueAdminCertificate(body) {
  const response = await client.post("/admin/certificates/issue", body, {
    responseType: "blob",
  });
  return response?.data;
}

