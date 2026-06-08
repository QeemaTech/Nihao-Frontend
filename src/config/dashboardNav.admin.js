import {
  BadgeDollarSign,
  BookOpenCheck,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  UserSquare2,
} from "lucide-react";

const adminNav = [
  { labelKey: "nav.overview", to: "/admin", icon: LayoutDashboard },
  { labelKey: "nav.users", to: "/admin/users", icon: Users },
  { 
    labelKey: "nav.instructors", 
    icon: UserSquare2,
    children: [
      { labelKey: "nav.overview", to: "/admin/instructors/overview" },
      { labelKey: "nav.instructors", to: "/admin/instructors" },
      { labelKey: "nav.finance", to: "/admin/payouts" }, // Map to finance for simplicity in this demo
    ]
  },
  { 
    labelKey: "nav.courses", 
    icon: BookOpenCheck,
    children: [
      { labelKey: "nav.courses", to: "/admin/courses/categories" },
      { labelKey: "nav.courses", to: "/admin/courses" },
      { labelKey: "nav.courses", to: "/admin/courses/add" },
    ]
  },
  { 
    labelKey: "nav.enrollments", 
    icon: ClipboardCheck,
    children: [
      { labelKey: "nav.enrollments", to: "/admin/enrolment/history" },
      { labelKey: "nav.enrollments", to: "/admin/enrolment/add" },
    ]
  },
  { labelKey: "nav.finance", to: "/admin/finance", icon: BadgeDollarSign },
  { labelKey: "nav.cms", to: "/admin/cms", icon: ShieldCheck },
  { labelKey: "nav.settings", to: "/admin/settings", icon: Settings },
];


export default adminNav;
