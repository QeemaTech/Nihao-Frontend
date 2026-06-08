import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Ticket,
  Award,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Layers,
  Package,
  Settings2,
  UserCog,
  Users,
} from "lucide-react";

export type NavItem = {
  labelKey: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  /** When true, only this path matches (not child routes). */
  exact?: boolean;
};

export type NavGroup = {
  labelKey: string;
  icon: LucideIcon;
  basePath: string;
  children: NavItem[];
};

export type NavSection = {
  labelKey: string;
  items: (NavItem | NavGroup)[];
};

export function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "children" in item;
}

export function getAdminNavigation(openTicketsCount = 0): NavSection[] {
  return [
    {
      labelKey: "sidebarNav.sections.analytics",
      items: [
        { labelKey: "sidebarNav.items.overview", path: "/admin", icon: LayoutDashboard, exact: true },
        { labelKey: "sidebarNav.items.finance", path: "/admin/finance", icon: DollarSign },
        { labelKey: "sidebarNav.items.packages", path: "/admin/packages", icon: Package },
        { labelKey: "sidebarNav.items.analytics", path: "/admin/performance", icon: LayoutDashboard },
        { labelKey: "sidebarNav.items.coupons", path: "/admin/coupons", icon: Ticket },
        { labelKey: "sidebarNav.items.certificates", path: "/admin/certificates", icon: Award },
      ],
    },
    {
      labelKey: "sidebarNav.sections.management",
      items: [
        { labelKey: "sidebarNav.items.allUsers", path: "/admin/users", icon: UserCog },
        {
          labelKey: "sidebarNav.items.students",
          icon: Users,
          basePath: "/admin/students",
          children: [
            { labelKey: "sidebarNav.items.studentsList", path: "/admin/students", icon: Users },
          ],
        },
        {
          labelKey: "sidebarNav.items.instructors",
          icon: GraduationCap,
          basePath: "/admin/instructors",
          children: [
            { labelKey: "sidebarNav.items.overview", path: "/admin/instructors", icon: GraduationCap },
            { labelKey: "sidebarNav.items.list", path: "/admin/instructors/list", icon: GraduationCap },
            { labelKey: "sidebarNav.items.payouts", path: "/admin/instructors/payouts", icon: GraduationCap },
          ],
        },
        {
          labelKey: "sidebarNav.items.courses",
          icon: BookOpen,
          basePath: "/admin/courses",
          children: [
            { labelKey: "sidebarNav.items.allCourses", path: "/admin/courses", icon: BookOpen },
            { labelKey: "sidebarNav.items.addCourse", path: "/admin/courses/new", icon: BookOpen },
            { labelKey: "sidebarNav.items.categories", path: "/admin/courses/categories", icon: BookOpen },
            { labelKey: "sidebarNav.items.cohorts", path: "/admin/cohorts", icon: Layers },
          ],
        },
        {
          labelKey: "sidebarNav.items.enrollments",
          icon: ClipboardList,
          basePath: "/admin/enrollments",
          children: [
            { labelKey: "sidebarNav.items.history", path: "/admin/enrollments", icon: ClipboardList },
            { labelKey: "sidebarNav.items.enrollStudent", path: "/admin/enrollments/new", icon: ClipboardList },
          ],
        },
        {
          labelKey: "sidebarNav.items.exams",
          path: "/admin/exams",
          icon: ClipboardList,
        },
        {
          labelKey: "sidebarNav.items.tickets",
          path: "/admin/tickets",
          icon: MessageSquare,
          badge: openTicketsCount,
        },
      ],
    },
    {
      labelKey: "sidebarNav.sections.content",
      items: [
        {
          labelKey: "sidebarNav.items.cms",
          icon: FileText,
          basePath: "/admin/cms",
          children: [
            { labelKey: "sidebarNav.items.siteContent", path: "/admin/cms", icon: FileText, exact: true },
            { labelKey: "sidebarNav.items.blogPosts", path: "/admin/cms/posts", icon: FileText },
            { labelKey: "sidebarNav.items.banners", path: "/admin/cms/banners", icon: FileText },
          ],
        },
      ],
    },
    {
      labelKey: "sidebarNav.sections.system",
      items: [
        {
          labelKey: "sidebarNav.items.settings",
          icon: Settings2,
          basePath: "/admin/settings",
          children: [
            { labelKey: "sidebarNav.items.general", path: "/admin/settings", icon: Settings2 },
            { labelKey: "sidebarNav.items.rolesPerms", path: "/admin/settings/roles", icon: Settings2 },
            { labelKey: "sidebarNav.items.emailTemplates", path: "/admin/settings/emails", icon: Settings2 },
            { labelKey: "sidebarNav.items.integrations", path: "/admin/settings/integrations", icon: Settings2 },
          ],
        },
      ],
    },
  ];
}

export function getInstructorNavigation(): NavSection[] {
  return [
    {
      labelKey: "sidebarNav.sections.instructor",
      items: [
        { labelKey: "sidebarNav.items.overview", path: "/instructor", icon: LayoutDashboard, exact: true },
        { labelKey: "sidebarNav.items.myCohorts", path: "/instructor/cohorts", icon: BookOpen },
        { labelKey: "sidebarNav.items.performance", path: "/instructor/performance", icon: BarChart2 },
        { labelKey: "sidebarNav.items.homework", path: "/instructor/homework", icon: ClipboardCheck },
        { labelKey: "sidebarNav.items.availability", path: "/instructor/availability", icon: CalendarClock },
        { labelKey: "sidebarNav.items.exams", path: "/instructor/exams", icon: ClipboardList },
        { labelKey: "sidebarNav.items.students", path: "/instructor/students", icon: Users },
        { labelKey: "sidebarNav.items.wallet", path: "/instructor/wallet", icon: DollarSign },
        { labelKey: "sidebarNav.items.settings", path: "/instructor/settings", icon: Settings2 },
      ],
    },
  ];
}

