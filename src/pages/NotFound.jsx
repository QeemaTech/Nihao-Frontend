import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-nihao-red-normal">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">{t("notFound.title")}</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">{t("notFound.body")}</p>
      <Link
        to="/explore"
        className="mt-8 inline-flex rounded-xl bg-nihao-red-normal px-8 py-3 text-sm font-bold text-white hover:bg-nihao-red-hover"
      >
        {t("notFound.cta")}
      </Link>
    </div>
  );
}
