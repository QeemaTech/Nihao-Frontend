import {
  CircleDollarSign,
  ClipboardCheck,
  HelpCircle,
  LayoutDashboard,
  MonitorPlay,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

const instructorNav = [
  { labelKey: "dashboard.instructor.nav.overview", to: "/instructor", icon: LayoutDashboard },
  { labelKey: "dashboard.instructor.nav.cohorts", to: "/instructor/cohorts", icon: MonitorPlay },
  { labelKey: "dashboard.instructor.nav.exams", to: "/instructor/exams", icon: ClipboardCheck },
  { labelKey: "dashboard.instructor.nav.students", to: "/instructor/students", icon: Users },
  { labelKey: "dashboard.instructor.nav.qna", to: "/instructor/qna", icon: HelpCircle },
  { labelKey: "dashboard.instructor.nav.wallet", to: "/instructor/wallet", icon: CircleDollarSign },
  { labelKey: "dashboard.instructor.nav.performance", to: "/instructor/performance", icon: TrendingUp },
  { labelKey: "dashboard.instructor.nav.settings", to: "/instructor/settings", icon: Settings },
];

export default instructorNav;
