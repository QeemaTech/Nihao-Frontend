import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Download, Eye, MoreHorizontal } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SlideOver from "../../components/ui/SlideOver";
import usePaginatedQuery from "../../hooks/usePaginatedQuery";
import {
  useAdminUsers,
  useToggleAdminUserActive,
  useUpdateAdminUser,
} from "../../features/admin/users/hooks";
import type { AdminUserRow, AdminUserRole } from "../../features/admin/users/types";

const ROLE_OPTIONS: (AdminUserRole | "")[] = ["", "ADMIN", "INSTRUCTOR", "STUDENT", "STAFF"];

function downloadUsersCsv(rows: AdminUserRow[]) {
  const headers = ["id", "fullName", "email", "role", "isActive", "phone", "createdAt"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => esc((r as Record<string, unknown>)[h])).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nihao-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RowMenu({
  row,
  onEditRole,
  onEditDetails,
}: {
  row: AdminUserRow;
  onEditRole: (u: AdminUserRow) => void;
  onEditDetails: (u: AdminUserRow) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative inline-block text-start" ref={ref}>
      <button
        type="button"
        aria-label={t("adminPages.userDirectory.menu.more")}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute end-0 z-20 mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-4 py-2 text-start text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onEditRole(row);
            }}
          >
            {t("adminPages.userDirectory.menu.editRole")}
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-start text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onEditDetails(row);
            }}
          >
            {t("adminPages.userDirectory.menu.editDetails")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Users() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, limit, search, role, status } = usePaginatedQuery(searchParams);

  const [draftSearch, setDraftSearch] = useState(search);
  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  const apiParams = useMemo(() => {
    const p: Record<string, string | number> = { page, limit };
    if (search.trim()) p.search = search.trim();
    if (role) p.role = role;
    if (status === "active") p.isActive = "true";
    if (status === "inactive") p.isActive = "false";
    return p;
  }, [page, limit, search, role, status]);

  const { data, isLoading, isError } = useAdminUsers(apiParams);
  const users = (data?.users ?? []) as AdminUserRow[];
  const meta = data?.meta;

  const toggleActive = useToggleAdminUserActive();
  const updateUser = useUpdateAdminUser();

  const [roleUser, setRoleUser] = useState<AdminUserRow | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUserRow | null>(null);
  const [roleDraft, setRoleDraft] = useState<AdminUserRole | "">("");
  const [detailForm, setDetailForm] = useState({ fullName: "", email: "", phone: "" });

  const setParam = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === "") next.delete(k);
        else next.set(k, v);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const applySearch = () => {
    setParam({ search: draftSearch.trim() || undefined, page: "1" });
  };

  const openRole = (u: AdminUserRow) => {
    setRoleUser(u);
    setRoleDraft((u.role as AdminUserRole) || "STUDENT");
  };

  const openDetails = (u: AdminUserRow) => {
    setDetailUser(u);
    setDetailForm({
      fullName: u.fullName || "",
      email: u.email || "",
      phone: u.phone || "",
    });
  };

  const saveRole = async () => {
    if (!roleUser || !roleDraft) return;
    try {
      await updateUser.mutateAsync({ id: roleUser.id, body: { role: roleDraft as AdminUserRole } });
      toast.success(t("dashboard.common.save"));
      setRoleUser(null);
    } catch {
      toast.error(t("adminPages.userDirectory.loadError"));
    }
  };

  const saveDetails = async () => {
    if (!detailUser) return;
    try {
      const body: { fullName: string; email: string; phone?: string } = {
        fullName: detailForm.fullName.trim(),
        email: detailForm.email.trim(),
      };
      const ph = detailForm.phone.trim();
      if (ph) body.phone = ph;
      await updateUser.mutateAsync({ id: detailUser.id, body });
      toast.success(t("dashboard.common.save"));
      setDetailUser(null);
    } catch {
      toast.error(t("adminPages.userDirectory.loadError"));
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "fullName",
        title: t("adminPages.userDirectory.table.name"),
        render: (_: unknown, row: AdminUserRow) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nihao-red-light text-xs font-bold text-nihao-red-normal">
              {(row.fullName || "?")
                .split(/\s+/)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="font-semibold text-slate-900">{row.fullName}</span>
          </div>
        ),
      },
      { key: "email", title: t("adminPages.userDirectory.table.email") },
      {
        key: "role",
        title: t("adminPages.userDirectory.table.role"),
        render: (v: unknown) => (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-700">{String(v)}</span>
        ),
      },
      {
        key: "isActive",
        title: t("adminPages.userDirectory.table.status"),
        render: (v: unknown) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              v ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {v ? t("dashboard.common.active") : t("dashboard.common.inactive")}
          </span>
        ),
      },
      {
        key: "createdAt",
        title: t("adminPages.userDirectory.table.created"),
        render: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "—"),
      },
      {
        key: "id",
        title: t("adminPages.userDirectory.table.actions"),
        render: (_: unknown, row: AdminUserRow) => (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-nihao-red-normal focus:ring-nihao-red-normal"
                checked={Boolean(row.isActive)}
                onChange={() =>
                  toggleActive.mutate(row.id, {
                    onSuccess: () => toast.success(t("dashboard.common.save")),
                    onError: () => toast.error(t("adminPages.userDirectory.loadError")),
                  })
                }
              />
              {t("adminPages.userDirectory.toggleActive")}
            </label>
            <Link
              to={`/admin/users/${row.id}`}
              className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              title={t("adminPages.userDirectory.viewProfile")}
            >
              <Eye className="h-4 w-4" />
            </Link>
            <RowMenu row={row} onEditRole={openRole} onEditDetails={openDetails} />
          </div>
        ),
      },
    ],
    [t, toggleActive]
  );

  const totalPages = meta?.totalPages ?? 1;

  return (
    <section>
      <PageHeader
        title={t("adminPages.userDirectory.title")}
        subtitle={t("adminPages.userDirectory.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadUsersCsv(users)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-nihao-red-normal hover:text-nihao-red-normal"
            >
              <Download className="h-4 w-4" />
              {t("adminPages.userDirectory.export")}
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12 md:items-end">
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.filters.role")}</label>
          <select
            value={role}
            onChange={(e) => setParam({ role: e.target.value || undefined, page: "1" })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t("adminPages.userDirectory.filters.allRoles")}</option>
            {ROLE_OPTIONS.filter(Boolean).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.filters.status")}</label>
          <select
            value={status}
            onChange={(e) => setParam({ status: e.target.value || undefined, page: "1" })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t("adminPages.userDirectory.filters.allStatuses")}</option>
            <option value="active">{t("adminPages.userDirectory.filters.active")}</option>
            <option value="inactive">{t("adminPages.userDirectory.filters.suspended")}</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.common.search")}</label>
          <input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder={t("adminPages.userDirectory.filters.searchPlaceholder")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="flex gap-2 md:col-span-1">
          <button
            type="button"
            onClick={applySearch}
            className="mt-6 w-full rounded-xl bg-nihao-red-normal px-3 py-2 text-sm font-semibold text-white hover:bg-nihao-red-hover md:mt-6"
          >
            {t("adminPages.userDirectory.filters.apply")}
          </button>
        </div>
        <div className="md:col-span-12 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">{t("adminPages.pagination.pageSize")}</span>
          <select
            value={String(limit)}
            onChange={(e) => setParam({ limit: e.target.value, page: "1" })}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">{t("adminPages.userDirectory.loadError")}</div>
      ) : null}

      <DataTable
        columns={columns}
        rows={isLoading ? [] : users}
        pagination={
          meta ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2 text-sm text-slate-600">
              <span>
                {t("adminPages.userDirectory.pagination.page", { page: meta.page, pages: totalPages })} ·{" "}
                {t("adminPages.userDirectory.pagination.rows", { count: users.length })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setParam({ page: String(Math.max(1, page - 1)) })}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  {t("adminPages.pagination.prev")}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setParam({ page: String(Math.min(totalPages, page + 1)) })}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  {t("adminPages.pagination.next")}
                </button>
              </div>
            </div>
          ) : null
        }
      />

      {isLoading ? (
        <p className="mt-4 text-center text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      ) : null}
      {!isLoading && users.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-500">{t("adminPages.userDirectory.empty")}</p>
      ) : null}

      <SlideOver open={Boolean(roleUser)} onClose={() => setRoleUser(null)} title={t("adminPages.userDirectory.slideRole.title")}>
        {roleUser ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{roleUser.email}</p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.slideRole.role")}</label>
              <select
                value={roleDraft}
                onChange={(e) => setRoleDraft(e.target.value as AdminUserRole)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.filter(Boolean).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={updateUser.isPending}
              onClick={() => void saveRole()}
              className="w-full rounded-xl bg-nihao-red-normal py-2.5 text-sm font-semibold text-white hover:bg-nihao-red-hover disabled:opacity-50"
            >
              {t("adminPages.userDirectory.slideRole.save")}
            </button>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver open={Boolean(detailUser)} onClose={() => setDetailUser(null)} title={t("adminPages.userDirectory.slideDetails.title")}>
        {detailUser ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.slideDetails.fullName")}</label>
              <input
                value={detailForm.fullName}
                onChange={(e) => setDetailForm((f) => ({ ...f, fullName: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.slideDetails.email")}</label>
              <input
                type="email"
                value={detailForm.email}
                onChange={(e) => setDetailForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.slideDetails.phone")}</label>
              <input
                value={detailForm.phone}
                onChange={(e) => setDetailForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="+9665..."
              />
            </div>
            <button
              type="button"
              disabled={updateUser.isPending}
              onClick={() => void saveDetails()}
              className="w-full rounded-xl bg-nihao-red-normal py-2.5 text-sm font-semibold text-white hover:bg-nihao-red-hover disabled:opacity-50"
            >
              {t("adminPages.userDirectory.slideDetails.save")}
            </button>
          </div>
        ) : null}
      </SlideOver>
    </section>
  );
}
