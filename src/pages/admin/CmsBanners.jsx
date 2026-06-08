import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminBanners, useCreateBanner, useDeleteBanner, useUpdateBanner } from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";

function CmsBanners() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const rows = data || [];
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState("0");

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.cmsBanners.title")} subtitle={t("adminPages.cmsBanners.subtitle")} />

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        {isLoading ? <p className="text-sm text-slate-500">{t("adminPages.cmsBanners.loading")}</p> : null}
        {isError ? (
          <p className="text-sm text-red-500">
            {getErrorMessage(error, "Failed to load.")}{" "}
            <button type="button" onClick={() => refetch()} className="underline">
              Retry
            </button>
          </p>
        ) : null}
        {!isLoading && !rows.length ? (
          <p className="text-sm text-slate-500">{t("adminPages.cmsBanners.empty")}</p>
        ) : null}
        {rows.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-white/10">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-white/5">
              {b.imageUrl ? <img src={b.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">{b.title || "—"}</p>
              <p className="truncate text-xs text-slate-500">{b.link || "—"}</p>
              <p className="text-[10px] text-slate-400">
                order {b.order ?? 0} · {b.isActive ? "active" : "inactive"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={Boolean(b.isActive)}
                onChange={() => updateMutation.mutate({ id: b.id, body: { isActive: !b.isActive } })}
              />
              {t("adminPages.cmsBanners.toggle")}
            </label>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(t("adminPages.cmsBanners.confirmDelete"))) return;
                deleteMutation.mutate(b.id);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 dark:border-red-500/40 dark:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t("adminPages.cmsBanners.delete")}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("adminPages.cmsBanners.add")}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            placeholder={t("adminPages.cmsBanners.form.title")}
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            placeholder={t("adminPages.cmsBanners.form.link")}
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t("adminPages.cmsBanners.imageUrl")}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white md:col-span-2"
          />
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            type="number"
            placeholder={t("adminPages.cmsBanners.order")}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          />
        </div>
        <button
          type="button"
          disabled={!imageUrl.trim() || createMutation.isPending}
          onClick={() =>
            createMutation.mutate(
              {
                title: title.trim() || undefined,
                imageUrl: imageUrl.trim(),
                link: link.trim() || undefined,
                isActive: true,
                order: Number(order) || 0,
              },
              {
                onSuccess: () => {
                  setTitle("");
                  setLink("");
                  setImageUrl("");
                  setOrder("0");
                },
              }
            )
          }
          className="mt-3 rounded-lg bg-[#B91C1C] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {createMutation.isPending ? "…" : t("adminPages.cmsBanners.create")}
        </button>
        {createMutation.isError ? (
          <p className="mt-2 text-sm text-red-600">{getErrorMessage(createMutation.error)}</p>
        ) : null}
      </div>
    </section>
  );
}

export default CmsBanners;
