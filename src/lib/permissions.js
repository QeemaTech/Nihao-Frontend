export const PERMISSION_GROUPS = {
  users: {
    label: "Users",
    permissions: [
      { key: "user:manage", label: "Manage users" },
      { key: "role:manage", label: "Manage roles" },
    ],
  },
  instructors: {
    label: "Instructors",
    permissions: [
      { key: "instructor:manage", label: "Manage instructors" },
      { key: "instructor:payout", label: "Process payouts" },
    ],
  },
  courses: {
    label: "Courses",
    permissions: [
      { key: "course:manage", label: "Manage courses" },
      { key: "category:manage", label: "Manage categories" },
      { key: "enrollment:manage", label: "Manage enrollments" },
    ],
  },
  exams: {
    label: "Assessments",
    permissions: [
      { key: "exam:manage", label: "Manage exams and quizzes" },
      { key: "exam:review", label: "Review submissions" },
    ],
  },
  finance: {
    label: "Finance",
    permissions: [
      { key: "finance:manage", label: "Manage finance and coupons" },
      { key: "payout:manage", label: "Manage instructor payouts" },
    ],
  },
  cms: {
    label: "Content",
    permissions: [
      { key: "cms:manage", label: "Manage CMS" },
      { key: "banner:manage", label: "Manage banners" },
      { key: "settings:manage", label: "Manage settings" },
    ],
  },
};

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flatMap((group) =>
  group.permissions.map((perm) => perm.key)
);

export const buildPermission = (resource, action) => `${resource}:${action}`;

