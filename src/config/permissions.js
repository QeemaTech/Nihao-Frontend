export const APP_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
  STAFF: "staff",
};

export function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "super_admin" || normalized === "super-admin") return APP_ROLES.ADMIN;
  return normalized;
}

export function hasAnyRole(user, allowedRoles = []) {
  const role = normalizeRole(user?.role);
  return allowedRoles.map(normalizeRole).includes(role);
}
