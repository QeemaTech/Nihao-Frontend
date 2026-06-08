import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Zap } from "lucide-react";
import { usePublicPackages } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";

function parseFeatures(features) {
  if (Array.isArray(features)) {
    return features.map((x) => String(x)).filter(Boolean);
  }
  if (features && typeof features === "object") {
    return Object.values(features).map((x) => String(x));
  }
  return [];
}

function BillingToggle({ yearly, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm font-medium ${!yearly ? "text-slate-900" : "text-slate-400"}`}>
        {t("subscription.billing.monthly")}
      </span>
      <button
        type="button"
        onClick={() => onChange(!yearly)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          yearly ? "bg-nihao-red-normal" : "bg-slate-300"
        }`}
        aria-label={t("subscription.billing.toggleAria", { defaultValue: "Toggle billing period" })}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all ${
            yearly ? "start-6" : "start-0.5"
          }`}
        />
      </button>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${yearly ? "text-slate-900" : "text-slate-400"}`}>
        {t("subscription.billing.yearly")}
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          {t("subscription.billing.discount")}
        </span>
      </span>
    </div>
  );
}

function PlanCard({ pkg, yearly, onGetStarted }) {
  const { t } = useTranslation();
  const price = yearly ? pkg.priceYearly : pkg.priceMonthly;
  const highlighted = !!pkg.isRecommended;
  const featureLines = useMemo(() => parseFeatures(pkg.features), [pkg.features]);
  const limits = [
    t("subscription.limits.live", { count: pkg.liveCohortsLimit }),
    t("subscription.limits.recorded", { count: pkg.recordedCohortsLimit }),
    t("subscription.limits.private", { count: pkg.privateSessionsLimit }),
  ];

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-0.5 transition-all hover:-translate-y-1 ${
        highlighted
          ? "bg-gradient-to-b from-nihao-red-normal to-nihao-red-dark shadow-2xl shadow-nihao-red-normal/30"
          : "border border-slate-200 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {highlighted ? (
        <span className="absolute -top-3.5 start-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-nihao-yellow-normal px-3 py-1 text-xs font-bold text-white shadow">
          <Zap className="h-3 w-3" />
          {t("subscription.mostPopular")}
        </span>
      ) : null}

      <div className={`flex flex-1 flex-col rounded-2xl p-6 ${highlighted ? "bg-white" : ""}`}>
        <div className="space-y-1">
          <h3 className={`text-xl font-bold ${highlighted ? "text-nihao-red-normal" : "text-slate-900"}`}>{pkg.name}</h3>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              highlighted ? "bg-nihao-red-light text-nihao-red-normal" : "bg-slate-100 text-slate-500"
            }`}
          >
            {pkg.level}
          </span>
        </div>

        <div className="mt-5 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-slate-900">${Number(price).toFixed(0)}</span>
          <span className="mb-1 text-sm text-slate-400">/ {t("subscription.billing.perUser")}</span>
        </div>
        {!yearly ? (
          <p className="mt-0.5 text-xs text-slate-400">
            {t("subscription.yearlyHint", { price: Number(pkg.priceYearly).toFixed(0), defaultValue: `Yearly $${Number(pkg.priceYearly).toFixed(0)}/mo equivalent` })}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-400 line-through">
            ${Number(pkg.priceMonthly).toFixed(0)} {t("subscription.billing.perUser")}
          </p>
        )}

        <div className="my-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">{t("subscription.tierLimits", { defaultValue: "Tier limits" })}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <ul className="space-y-2">
          {limits.map((line, idx) => (
            <li key={`${pkg.id}-lim-${idx}`} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span
                className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                  highlighted ? "bg-nihao-red-light" : "bg-nihao-yellow-light"
                }`}
              >
                <Check className={`h-2.5 w-2.5 ${highlighted ? "text-nihao-red-normal" : "text-nihao-yellow-normal"}`} strokeWidth={3} />
              </span>
              {line}
            </li>
          ))}
        </ul>

        {featureLines.length > 0 ? (
          <>
            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">{t("subscription.featuresHeading", { defaultValue: "Features" })}</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <ul className="space-y-2">
              {featureLines.slice(0, 8).map((line, idx) => (
                <li key={`${pkg.id}-feat-${idx}`} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${highlighted ? "bg-nihao-red-light" : "bg-nihao-yellow-light"}`}>
                    <Check className={`h-2.5 w-2.5 ${highlighted ? "text-nihao-red-normal" : "text-nihao-yellow-normal"}`} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => onGetStarted(pkg.id)}
          className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition ${
            highlighted
              ? "bg-nihao-red-normal text-white hover:bg-nihao-red-hover"
              : "border border-nihao-red-normal text-nihao-red-normal hover:bg-nihao-red-light"
          }`}
        >
          {t("subscription.getStarted")}
        </button>
      </div>
    </div>
  );
}

export default function Subscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const { data: packages = [], isLoading, isError } = usePublicPackages();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const handleGetStarted = (id) => {
    const qs = new URLSearchParams({ packageId: id, yearly: yearly ? "true" : "false" });
    const path = `/checkout?${qs.toString()}`;
    if (!isAuthenticated || role !== APP_ROLES.STUDENT) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => Number(a.priceMonthly) - Number(b.priceMonthly)),
    [packages]
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            {t("subscription.titlePrefix")}{" "}
            <span className="text-nihao-red-normal">{t("subscription.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">{t("subscription.subtitle")}</p>

          <div className="mt-7">
            <BillingToggle yearly={yearly} onChange={setYearly} />
          </div>
        </div>

        {isLoading ? (
          <p className="mt-16 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
        ) : null}
        {isError ? (
          <p className="mt-16 text-center text-red-600">{t("subscription.loadError", { defaultValue: "Could not load plans." })}</p>
        ) : null}

        {!isLoading && !isError && sortedPackages.length === 0 ? (
          <p className="mt-16 text-center text-slate-500">{t("subscription.empty", { defaultValue: "No packages are available yet." })}</p>
        ) : null}

        {!isLoading && sortedPackages.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedPackages.map((pkg) => (
              <PlanCard key={pkg.id} pkg={pkg} yearly={yearly} onGetStarted={handleGetStarted} />
            ))}
          </div>
        ) : null}

        <p className="mt-10 text-center text-sm text-slate-500">
          {t("subscription.faqTeaser")}{" "}
          <Link to="/faq" className="font-medium text-nihao-red-normal hover:underline">
            {t("subscription.faqLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
