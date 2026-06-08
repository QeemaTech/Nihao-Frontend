import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Phone, Shield, User } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminUserById } from "../../features/admin/users/hooks";

const ROLES_STUDENT = "STUDENT";
const ROLES_INSTRUCTOR = "INSTRUCTOR";

export default function UserDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useAdminUserById(id);

  if (isLoading) {
    return (
      <section>
        <PageHeader title={t("adminPages.userDetail.title")} subtitle="" />
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">{t("dashboard.common.loading")}</div>
      </section>
    );
  }

  if (isError || !user) {
    return (
      <section>
        <PageHeader title={t("adminPages.userDetail.title")} subtitle="" />
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">{t("adminPages.userDetail.loadError")}</div>
        <Link to="/admin/users" className="mt-4 inline-flex text-sm font-semibold text-nihao-red-normal hover:underline">
          ← {t("adminPages.userDetail.back")}
        </Link>
      </section>
    );
  }

  const role = String(user.role || "");

  return (
    <section>
      <Link
        to="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-nihao-red-normal"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("adminPages.userDetail.back")}
      </Link>
      <PageHeader title={user.fullName || user.email} subtitle={user.email} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <User className="h-4 w-4 text-nihao-red-normal" />
            {t("adminPages.userDetail.identity")}
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.table.email")}</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                <Mail className="h-4 w-4 text-slate-400" />
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.slideDetails.phone")}</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                <Phone className="h-4 w-4 text-slate-400" />
                {user.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.table.role")}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{role}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.toggleActive")}</dt>
              <dd className="mt-1 text-sm text-slate-900">{user.isActive ? t("dashboard.common.active") : t("dashboard.common.inactive")}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDetail.lastLogin")}</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-nihao-red-light/40 to-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Shield className="h-4 w-4 text-nihao-red-normal" />
              {t("adminPages.userDetail.permissions")}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {user.customRole?.name ? (
                <>
                  {t("adminPages.userDetail.customRole")}: <span className="font-semibold text-slate-900">{user.customRole.name}</span>
                </>
              ) : (
                <span className="text-slate-500">{t("adminPages.userDetail.permissions")}</span>
              )}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {role === ROLES_STUDENT ? (
                <Link
                  to={`/admin/students/${user.id}`}
                  className="rounded-xl bg-nihao-red-normal px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-nihao-red-hover"
                >
                  {t("adminPages.userDetail.openStudent")}
                </Link>
              ) : null}
              {role === ROLES_INSTRUCTOR ? (
                <Link
                  to={`/admin/instructors/${user.id}`}
                  className="rounded-xl bg-nihao-red-normal px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-nihao-red-hover"
                >
                  {t("adminPages.userDetail.openInstructor")}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
