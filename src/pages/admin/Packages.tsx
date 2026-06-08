import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import SlideOver from "../../components/ui/SlideOver";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import {
  useAdminPackage,
  useAdminPackages,
  useCreateAdminPackage,
  useDeleteAdminPackage,
  useUpdateAdminPackage,
} from "../../features/admin/packages/hooks";
import type { AdminPackage, PackageLevel } from "../../features/admin/packages/types";

/** Turn stored JSON features into plain lines for non-technical editors. */
function featuresToLines(features: unknown): string {
  if (features == null) return "";
  if (Array.isArray(features)) {
    return features.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
  }
  if (typeof features === "object") {
    try {
      return JSON.stringify(features, null, 2);
    } catch {
      return "";
    }
  }
  return String(features);
}

function linesToFeatureArray(text: string): unknown[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function PackageMobileCard({
  pkg,
  onEdit,
  onDelete,
  labels,
}: {
  pkg: AdminPackage;
  onEdit: () => void;
  onDelete: () => void;
  labels: {
    tier: string;
    monthly: string;
    yearly: string;
    liveCap: string;
    recCap: string;
    privateCap: string;
    active: string;
    recommended: string;
    edit: string;
    delete: string;
  };
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{pkg.name}</h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {labels.tier}: {pkg.level}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pkg.isActive ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
              {labels.active}
            </span>
          ) : null}
          {pkg.isRecommended ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
              ★ {labels.recommended}
            </span>
          ) : null}
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{labels.monthly}</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-200">${Number(pkg.priceMonthly ?? 0).toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{labels.yearly}</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-200">${Number(pkg.priceYearly ?? 0).toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{labels.liveCap}</dt>
          <dd className="text-slate-700 dark:text-slate-300">{pkg.liveCohortsLimit ?? 0}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{labels.recCap}</dt>
          <dd className="text-slate-700 dark:text-slate-300">{pkg.recordedCohortsLimit ?? 0}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{labels.privateCap}</dt>
          <dd className="text-slate-700 dark:text-slate-300">{pkg.privateSessionsLimit ?? 0}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-nihao-red-normal hover:underline">
          {labels.edit}
        </button>
        <button type="button" onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">
          {labels.delete}
        </button>
      </div>
    </article>
  );
}

export default function AdminPackagesPage() {
  const { t } = useTranslation();
  const { data: packages = [], isLoading } = useAdminPackages();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPackage | null>(null);

  const { data: pkgDetail } = useAdminPackage(editingId);

  const [name, setName] = useState("");
  const [level, setLevel] = useState<PackageLevel>("BASIC");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [priceYearly, setPriceYearly] = useState("");
  const [featuresLines, setFeaturesLines] = useState("");
  const [liveLimit, setLiveLimit] = useState("0");
  const [recordedLimit, setRecordedLimit] = useState("0");
  const [privateLimit, setPrivateLimit] = useState("0");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateAdminPackage();
  const updateMutation = useUpdateAdminPackage();
  const deleteMutation = useDeleteAdminPackage();

  useEffect(() => {
    if (!panelOpen) return;
    if (!editingId) {
      setName("");
      setLevel("BASIC");
      setPriceMonthly("");
      setPriceYearly("");
      setFeaturesLines("");
      setLiveLimit("0");
      setRecordedLimit("0");
      setPrivateLimit("0");
      setIsRecommended(false);
      setIsActive(true);
      return;
    }
    const p = pkgDetail;
    if (!p) return;
    setName(p.name ?? "");
    setLevel(p.level);
    setPriceMonthly(String(p.priceMonthly ?? ""));
    setPriceYearly(String(p.priceYearly ?? ""));
    setFeaturesLines(featuresToLines(p.features));
    setLiveLimit(String(p.liveCohortsLimit ?? 0));
    setRecordedLimit(String(p.recordedCohortsLimit ?? 0));
    setPrivateLimit(String(p.privateSessionsLimit ?? 0));
    setIsRecommended(!!p.isRecommended);
    setIsActive(p.isActive !== false);
  }, [panelOpen, editingId, pkgDetail]);

  const handleSubmit = async () => {
    const pm = Number(priceMonthly);
    const py = Number(priceYearly);
    if (!name.trim() || Number.isNaN(pm) || Number.isNaN(py) || pm <= 0 || py <= 0) {
      toast.error(t("dashboard.common.validation", { defaultValue: "Check prices and name." }));
      return;
    }
    let features: unknown;
    const trimmedBlock = featuresLines.trim();
    if (trimmedBlock.startsWith("{") || trimmedBlock.startsWith("[")) {
      try {
        features = JSON.parse(trimmedBlock) as unknown;
      } catch {
        toast.error(t("adminPages.packages.invalidFeatures"));
        return;
      }
    } else {
      features = linesToFeatureArray(featuresLines);
    }
    const body = {
      name: name.trim(),
      level,
      priceMonthly: pm,
      priceYearly: py,
      features,
      isRecommended,
      isActive,
      liveCohortsLimit: Number(liveLimit) || 0,
      recordedCohortsLimit: Number(recordedLimit) || 0,
      privateSessionsLimit: Number(privateLimit) || 0,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(t("dashboard.common.saved", { defaultValue: "Saved" }));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("dashboard.common.saved", { defaultValue: "Created" }));
      }
      setPanelOpen(false);
      setEditingId(null);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("dashboard.common.saved", { defaultValue: "Deleted" }));
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  };

  const tableLabels = {
    tier: t("adminPages.packages.table.level"),
    monthly: t("adminPages.packages.table.monthly"),
    yearly: t("adminPages.packages.table.yearly"),
    liveCap: t("adminPages.packages.table.liveCap"),
    recCap: t("adminPages.packages.table.recCap"),
    privateCap: t("adminPages.packages.table.privateCap"),
    active: t("adminPages.packages.table.active"),
    recommended: t("adminPages.packages.table.recommended"),
    edit: t("adminPages.packages.table.edit"),
    delete: t("adminPages.packages.table.delete"),
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.packages.title")}
        subtitle={t("adminPages.packages.subtitle")}
        action={
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setPanelOpen(true);
            }}
            className="h-10 w-full rounded-lg bg-nihao-red-normal px-4 text-sm font-bold text-white hover:bg-nihao-red-hover sm:w-auto"
          >
            {t("adminPages.packages.addPackage")}
          </button>
        }
      />

      {isLoading ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {packages.map((pkg) => (
              <PackageMobileCard
                key={pkg.id}
                pkg={pkg}
                labels={tableLabels}
                onEdit={() => {
                  setEditingId(pkg.id);
                  setPanelOpen(true);
                }}
                onDelete={() => setDeleteTarget(pkg)}
              />
            ))}
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={[
                { key: "name", title: t("adminPages.packages.table.name") },
                { key: "level", title: t("adminPages.packages.table.level") },
                {
                  key: "priceMonthly",
                  title: t("adminPages.packages.table.monthly"),
                  render: (v: unknown) => `$${Number(v ?? 0).toFixed(2)}`,
                },
                {
                  key: "priceYearly",
                  title: t("adminPages.packages.table.yearly"),
                  render: (v: unknown) => `$${Number(v ?? 0).toFixed(2)}`,
                },
                { key: "liveCohortsLimit", title: t("adminPages.packages.table.liveCap") },
                { key: "recordedCohortsLimit", title: t("adminPages.packages.table.recCap") },
                { key: "privateSessionsLimit", title: t("adminPages.packages.table.privateCap") },
                {
                  key: "isActive",
                  title: t("adminPages.packages.table.active"),
                  render: (v: unknown) => (v ? "✓" : "—"),
                },
                {
                  key: "isRecommended",
                  title: t("adminPages.packages.table.recommended"),
                  render: (v: unknown) => (v ? "★" : "—"),
                },
                {
                  key: "id",
                  title: t("adminPages.packages.table.actions"),
                  render: (_: unknown, row: AdminPackage) => (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(row.id);
                          setPanelOpen(true);
                        }}
                        className="text-xs font-semibold text-nihao-red-normal hover:underline"
                      >
                        {t("adminPages.packages.table.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        {t("adminPages.packages.table.delete")}
                      </button>
                    </div>
                  ),
                },
              ]}
              rows={packages}
            />
          </div>
        </>
      )}

      {!isLoading && packages.length === 0 ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t("adminPages.packages.empty")}</p>
      ) : null}

      <SlideOver
        open={panelOpen}
        title={editingId ? t("adminPages.packages.editPackage") : t("adminPages.packages.addPackage")}
        onClose={() => {
          setPanelOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.packages.form.name")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.packages.form.level")}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PackageLevel)}
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="BASIC">BASIC</option>
              <option value="PROFESSIONAL">PROFESSIONAL</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.packages.form.priceMonthly")}
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.packages.form.priceYearly")}
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={priceYearly}
                onChange={(e) => setPriceYearly(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.packages.form.featuresLines")}
            <textarea
              value={featuresLines}
              onChange={(e) => setFeaturesLines(e.target.value)}
              rows={6}
              placeholder={t("adminPages.packages.form.featuresPlaceholder")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
              {t("adminPages.packages.form.featuresHint")}
            </span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.packages.form.liveLimit")}
              <input
                type="number"
                min={0}
                value={liveLimit}
                onChange={(e) => setLiveLimit(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.packages.form.recordedLimit")}
              <input
                type="number"
                min={0}
                value={recordedLimit}
                onChange={(e) => setRecordedLimit(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.packages.form.privateLimit")}
              <input
                type="number"
                min={0}
                value={privateLimit}
                onChange={(e) => setPrivateLimit(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} />
            {t("adminPages.packages.form.recommended")}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            {t("adminPages.packages.form.active")}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setEditingId(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
            >
              {t("adminPages.packages.form.cancel")}
            </button>
            <button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => void handleSubmit()}
              className="rounded-lg bg-nihao-red-normal px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {t("adminPages.packages.form.save")}
            </button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("adminPages.packages.deleteConfirmTitle")}
        message={t("adminPages.packages.deleteConfirmMessage")}
        confirmLabel={t("adminPages.packages.deleteConfirm")}
        cancelLabel={t("adminPages.packages.deleteCancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
