import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import { PerformanceDashboardUI } from "../../components/features/performance/PerformanceDashboardUI";
import { useInstructorPerformance } from "../../features/instructor/performance/hooks";

function Performance() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useInstructorPerformance();

  if (isLoading) {
    return (
      <section>
        <PageHeader title={t("dashboard.instructor.pages.performance.title")} subtitle={t("dashboard.instructor.pages.performance.subtitle")} />
        <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <PageHeader title={t("dashboard.instructor.pages.performance.title")} subtitle={t("dashboard.instructor.pages.performance.subtitle")} />
        <p className="text-red-600 dark:text-red-400">Could not load performance data.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader title={t("dashboard.instructor.pages.performance.title")} subtitle={t("dashboard.instructor.pages.performance.subtitle")} />
      <PerformanceDashboardUI data={data} />
    </section>
  );
}

export default Performance;
