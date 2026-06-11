import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { useCreateAdminCourse } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

function AddCourse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCourseMutation = useCreateAdminCourse();
  const { data: categoryData } = useAdminCategories({ page: 1, limit: 100 });
  const { data: instructorData } = useAdminInstructors({ page: 1, limit: 100 });
  const categories = categoryData?.categories || [];
  const instructors = instructorData?.instructors || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    instructorId: "",
    categoryId: "",
  });
  const [submitError, setSubmitError] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      if (!form.title.trim()) throw new Error(t("adminPages.addCourse.titleRequired"));
      if (!form.instructorId) throw new Error(t("adminPages.addCourse.instructorRequired"));
      const course = await createCourseMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description || undefined,
        thumbnail: form.thumbnail || undefined,
        instructorId: form.instructorId,
        categoryId: form.categoryId || undefined,
      });
      if (!course?.id) throw new Error(t("adminPages.addCourse.missingId"));
      navigate(`/admin/courses/${course.id}/edit`);
    } catch (error) {
      setSubmitError(getErrorMessage(error, t("adminPages.addCourse.createFailed")));
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-8 py-4">
      <PageHeader
        title={t("adminPages.addCourse.title", { defaultValue: "Create New Course" })}
        subtitle={t("adminPages.addCourse.subtitle", {
          defaultValue: "Set the basics, then build your full curriculum in the studio.",
        })}
      />

      {/* Info card */}
      <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            {t("adminPages.addCourse.quickStartTitle")}
          </p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {t("adminPages.addCourse.quickStartBody")}{" "}
            <strong>{t("adminPages.addCourse.courseStudio")}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          {/* Title */}
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("adminPages.addCourse.titleField")} <span className="text-[#B91C1C]">*</span>
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("adminPages.addCourse.titlePlaceholder")}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#B91C1C]/50 focus:ring-2 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>

          {/* Description */}
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.addCourse.description")}</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("adminPages.addCourse.descriptionPlaceholder")}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#B91C1C]/50 focus:ring-2 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Instructor */}
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addCourse.instructor")} <span className="text-[#B91C1C]">*</span>
              </span>
              <select
                required
                value={form.instructorId}
                onChange={(e) => set("instructorId", e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#B91C1C]/50 focus:ring-2 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="">{t("dashboard.admin.courses.selectInstructor")}</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.fullName || i.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Category */}
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.addCourse.category")}</span>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#B91C1C]/50 focus:ring-2 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="">{t("adminPages.courseEditor.empty.noCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Thumbnail */}
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.courseEditor.fields.thumbnailUrl")}</span>
            <input
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#B91C1C]/50 focus:ring-2 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
        </div>

        {/* Error */}
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {submitError}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("adminPages.common.cancel")}
          </button>
          <button
            disabled={createCourseMutation.isPending}
            type="submit"
            className="inline-flex items-center gap-2.5 rounded-lg bg-[#B91C1C] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Layers className="h-4 w-4" />
            {createCourseMutation.isPending ? t("adminPages.addCourse.creating") : t("adminPages.addCourse.createAndOpen")}
            {!createCourseMutation.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddCourse;
