import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import ProfileAvatarEditor from "../../components/profile/ProfileAvatarEditor";

function Account() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <PageHeader title={t("dashboard.admin.pages.account.title")} subtitle={t("dashboard.admin.pages.account.subtitle")} />
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]">
        <ProfileAvatarEditor />
      </div>
    </section>
  );
}

export default Account;
