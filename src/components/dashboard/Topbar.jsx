import { Bell, User, Settings, LogOut, Shield, ChevronDown, Sun, Moon, Menu, LayoutDashboard, Loader2, BellOff } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../features/notifications/hooks";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification hooks
  const { data: notifications = [], isLoading: notifLoading } = useNotifications();
  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n.isRead).length : 0),
    [notifications]
  );

  // Close dropdowns on outside click
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAdminShell = pathname.startsWith("/admin");

  const profileMenuItems = useMemo(() => {
    const close = () => setIsProfileOpen(false);
    if (isAdminShell) {
      return [
        {
          icon: User,
          labelKey: "header.dashboardMenu.account",
          onClick: () => {
            close();
            navigate("/admin/account");
          },
        },
        {
          icon: Settings,
          labelKey: "header.dashboardMenu.platformSettings",
          onClick: () => {
            close();
            navigate("/admin/settings");
          },
        },
      ];
    }
    return [
      {
        icon: User,
        labelKey: "header.dashboardMenu.account",
        onClick: () => {
          close();
          navigate("/instructor/settings");
        },
      },
      {
        icon: LayoutDashboard,
        labelKey: "header.dashboardMenu.instructorHome",
        onClick: () => {
          close();
          navigate("/instructor");
        },
      },
    ];
  }, [isAdminShell, navigate]);

  const currentLng = lang;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-white/5 dark:bg-[#0A0A10]">
      <div className="flex h-16 min-h-16 items-center justify-between gap-2 px-3 sm:h-20 sm:min-h-20 sm:px-6 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 md:gap-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-6">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={t("header.mobile.menuToggle")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 lg:hidden dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 rtl:scale-x-[-1]" />
            </button>

            <div className="hidden min-w-0 items-center gap-4 md:flex lg:gap-6">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("overview.platformStatus")}: {t("overview.allSystemsOk")}
              </div>
              
              <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span>{t("sidebar.adminPanel")}</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-600 dark:text-slate-300">{t("nav.overview")}</span>
              </nav>
            </div>
          </div>

        </div>

        {/* Language Toggle & Actions — compact on small screens to avoid horizontal overflow */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5 sm:gap-1 sm:p-1">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:py-1 sm:text-[10px] ${
                currentLng === "en"
                  ? "bg-[#B91C1C] text-white"
                  : "border border-slate-200 bg-transparent text-slate-400 dark:border-white/10"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:py-1 sm:text-[10px] ${
                currentLng === "ar"
                  ? "bg-[#B91C1C] text-white"
                  : "border border-slate-200 bg-transparent text-slate-400 dark:border-white/10"
              }`}
            >
              AR
            </button>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-expanded={isNotificationsOpen}
              aria-label={t("header.notifications")}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${isNotificationsOpen ? "bg-[#B91C1C] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B91C1C] text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0A0A10]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute end-0 z-50 mt-3 w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:mt-4 sm:w-80 sm:max-w-none sm:p-4 dark:border-white/10 dark:bg-[#1A1A22] dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("header.notifications")}</h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      disabled={markAllReadMutation.isPending}
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[10px] font-bold text-[#B91C1C] hover:underline disabled:opacity-50"
                    >
                      {markAllReadMutation.isPending ? "Marking…" : "Mark all read"}
                    </button>
                  )}
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : !notifications.length ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <BellOff className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((note) => (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => {
                          if (!note.isRead) markReadMutation.mutate(note.id);
                        }}
                        className={`group w-full rounded-xl p-3 text-start transition-colors hover:bg-slate-100 dark:hover:bg-white/10 ${
                          note.isRead
                            ? "bg-transparent"
                            : "bg-slate-50 dark:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!note.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#B91C1C]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{note.title}</p>
                            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {note.message}
                            </p>
                            <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                              {timeAgo(note.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-white/10" />

          <div className="hidden flex-col items-end md:flex">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {t("overview.lastSynced")}: 2 {t("overview.minAgo")}
            </p>
            <div className="h-px w-8 bg-[#B91C1C]/30 mt-1" />
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-label={t("header.dropdown.open")}
              className="flex items-center gap-1.5 rounded-xl p-0.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:p-1 dark:hover:bg-white/5"
            >
              <div className="hidden max-w-[8rem] text-end sm:block md:max-w-32">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user?.fullName || t("header.admin")}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {user?.role || "Global Admin"}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 sm:h-10 sm:w-10 dark:bg-white/5 dark:ring-white/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {String(user?.fullName || "AD")
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-slate-500 transition-transform sm:block ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute end-0 z-50 mt-3 w-[min(14rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-md sm:mt-4 sm:w-56 dark:border-white/10 dark:bg-[#1A1A22] dark:shadow-2xl dark:shadow-black/50">
                <div className="mb-1 border-b border-slate-100 p-2 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("header.dashboardMenu.accountActions")}
                  </p>
                </div>
                {[
                  ...profileMenuItems.map((item) => ({ ...item, label: t(item.labelKey) })),
                  {
                    icon: Shield,
                    label: t("header.dashboardMenu.switchRole"),
                    onClick: () => setIsProfileOpen(false),
                  },
                  {
                    icon: LogOut,
                    label: t("header.dashboardMenu.logout"),
                    color: "text-rose-500",
                    onClick: handleLogout,
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={item.onClick}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${item.color || "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



export default Topbar;
