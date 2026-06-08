import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Menu, Database } from "lucide-react";

function SidebarItem({ item, t, isCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const Icon = item.icon;

  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some(child => pathname === child.to);
  const isActive = pathname === item.to || isChildActive;

  // Notification badge for Enrollments
  const showBadge = item.labelKey === "dashboard.admin.nav.enrolment";
  const badgeCount = 12;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isCollapsed ? t(item.labelKey) : ""}
          className={`group flex items-center justify-between rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            isCollapsed ? "mx-2 w-12 px-0 justify-center" : "mx-4 w-[calc(100%-2rem)] px-4"
          } ${
            isActive || isOpen
              ? "bg-red-50 text-[#991B1B] dark:bg-white/10 dark:text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-x-3">
            <Icon className={`h-5 w-5 transition-colors ${
              isActive || isOpen ? "text-[#B91C1C]" : "text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
            }`} />
            {!isCollapsed && <span>{t(item.labelKey)}</span>}
          </div>
          {!isCollapsed && <ChevronRight className={`h-4 w-4 transition-transform duration-200 rtl:scale-x-[-1] ${isOpen ? "rotate-90" : ""}`} />}
        </button>
        
        {isOpen && !isCollapsed && (
          <div className="space-y-1 overflow-hidden transition-all">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `mx-4 flex items-center rounded-lg ps-12 pe-4 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? "font-bold bg-red-50 text-[#991B1B] dark:bg-white/5 dark:text-white"
                      : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white/3 dark:hover:text-white"
                  }`
                }
              >
                {t(child.labelKey)}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === "/admin" || item.to === "/instructor"}
      title={isCollapsed ? t(item.labelKey) : ""}
      className={({ isActive }) =>
        `group flex items-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 ${
          isCollapsed ? "mx-2 w-12 px-0 justify-center" : "mx-4 gap-x-3 px-4"
        } ${
          isActive
            ? "border-s-2 border-[#B91C1C] bg-red-50 text-[#B91C1C] dark:bg-white/10 dark:text-white"
            : "border-s-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <div className="relative flex items-center gap-x-3">
          <Icon className={`h-5 w-5 transition-colors ${
            isActive ? "text-[#B91C1C]" : "text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
          }`} />
          {!isCollapsed && <span>{t(item.labelKey)}</span>}
          
          {showBadge && (
            <span className={`absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B91C1C] text-[8px] font-bold text-white ring-2 ring-white dark:ring-[#0A0A10] ${isCollapsed ? "scale-75" : ""}`}>
              {badgeCount}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

function SidebarDivider({ label, isCollapsed }) {
  if (isCollapsed) return <div className="mx-4 my-6 h-px bg-slate-100 dark:bg-white/5" />;
  return (
    <div className="mb-2 mt-6 px-8">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {label}
      </p>
    </div>
  );
}


function Sidebar({ title, navItems = [] }) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Grouping logic for Admin categories
  const categories = [
    { label: t("sidebar.analytics"), items: navItems.filter(i => ["nav.overview", "nav.finance"].includes(i.labelKey)) },
    { label: t("sidebar.management"), items: navItems.filter(i => ["nav.users", "nav.instructors", "nav.courses", "nav.enrollments"].includes(i.labelKey)) },
    { label: t("sidebar.system"), items: navItems.filter(i => ["nav.cms", "nav.settings"].includes(i.labelKey)) },
  ];

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 border-e rtl:border-e-0 rtl:border-s border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-white/5 dark:bg-[#0A0A10] lg:block ${isCollapsed ? "w-16" : "w-60"}`}>
      <div className={`flex h-20 items-center border-b border-slate-100 px-4 transition-all dark:border-white/5 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="relative">
              <div className="absolute -end-1 -top-1 z-10 h-2 w-2 animate-pulse-red rounded-full bg-[#B91C1C]" />
              <img 
                src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg" 
                alt="Nihao Academy" 
                className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
              />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Nihao Academy</h1>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-5rem)] py-6">
        <div className="overflow-y-auto no-scrollbar">
          {categories.map((cat, idx) => (
            <div key={idx} className="mb-4">
              <SidebarDivider label={cat.label} isCollapsed={isCollapsed} />
              <nav className="space-y-1">
                {cat.items.map((item) => (
                  <SidebarItem key={t(item.labelKey)} item={item} t={t} isCollapsed={isCollapsed} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className={`mt-auto border-t border-slate-100 transition-all dark:border-white/5 ${isCollapsed ? "px-2 py-6" : "px-4 py-4"}`}>
          {/* Storage Quota */}
          <div className="mb-6">
            {isCollapsed ? (
              <div className="flex justify-center group relative cursor-help" title="Storage: 4.2 GB / 10 GB (42%)">
                <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#B91C1C] transition-colors dark:bg-white/5">
                  <Database className="h-5 w-5" />
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-200 dark:text-white/5"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#B91C1C"
                      strokeWidth="2"
                      strokeDasharray="113"
                      strokeDashoffset={113 - (113 * 42) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="px-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Database className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("sidebar.storage")}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">42%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                  <div className="h-full w-[42%] rounded-full bg-[#B91C1C]" />
                </div>
                <p className="mt-2 text-[10px] font-medium text-slate-600">4.2 GB / 10 GB</p>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#B91C1C] to-[#F59E0B] p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900 dark:bg-[#0A0A10] dark:text-white">
                  AD
                </div>
              </div>
              <div className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0A0A10]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Administrator</p>
                <p className="text-[10px] font-medium text-slate-500">Admin Panel v2.4</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}







export default Sidebar;
