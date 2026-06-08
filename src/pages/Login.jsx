import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../store/authStore";
import { getErrorMessage } from "../api/error";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { getEnrollmentCheckoutPath, getPostLoginRedirectPath } from "../utils/enrollmentIntent";

/* ── Zod schema — mirrors backend loginSchema ── */
const loginSchema = z.object({
  identifier: z.string().min(1, "Email is required"),
  password:   z.string().min(1, "Password is required"),
  remember:   z.boolean().optional(),
});

/* ── Reusable field wrapper ── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: false },
  });

  const onSubmit = async ({ identifier, password }) => {
    setServerError("");
    try {
      const user = await login({ identifier, password });
      const role = normalizeRole(user?.role);
      const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
      if (role === APP_ROLES.STUDENT && enrollmentCheckout) {
        navigate(enrollmentCheckout, { replace: true });
        return;
      }
      const redirectPath = getPostLoginRedirectPath(location.search);
      if (role === APP_ROLES.STUDENT && redirectPath) {
        navigate(redirectPath, { replace: true });
        return;
      }
      const fallbackByRole =
        role === APP_ROLES.ADMIN
          ? "/admin"
          : role === APP_ROLES.INSTRUCTOR
          ? "/instructor"
          : "/";
      const target = from && from !== "/" ? from : fallbackByRole;
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.errors.loginFailed")));
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — brand ── */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-nihao-red-normal px-10 lg:flex lg:w-[45%]">
        {/* decorative circles */}
        <div className="absolute -start-20 -top-20 h-64 w-64 rounded-full bg-nihao-red-hover/40" />
        <div className="absolute -bottom-20 -end-20 h-72 w-72 rounded-full bg-nihao-red-dark/50" />

        <div className="relative z-10 text-center">
          <img
            src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
            alt="Nihao Academy"
            className="mx-auto mb-6 h-20 w-auto"
          />
          <h1 className="text-3xl font-bold text-white md:text-4xl">Nihao <span className="text-white">Academy</span></h1>
          <p className="mt-3 max-w-xs text-base text-white/80">
            {t("auth.login.brandSubtitle")}
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 block lg:hidden">
          <img
            src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
            alt="Nihao Academy"
            className="h-12 w-auto"
          />
        </Link>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t("auth.login.title")}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">{t("auth.login.subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Field label={t("auth.login.emailLabel")} error={errors.identifier?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder={t("auth.login.emailPlaceholder")}
                className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                  errors.identifier ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
                {...register("identifier")}
              />
            </Field>

            <Field label={t("auth.login.passwordLabel")} error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  className={`w-full rounded-lg border px-4 py-3 pe-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                    errors.password ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-nihao-red-normal"
                  {...register("remember")}
                />
                {t("auth.login.rememberMe")}
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-nihao-yellow-normal hover:underline"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-nihao-red-normal py-3.5 text-sm font-semibold text-white transition hover:bg-nihao-red-hover disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("auth.login.submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("auth.login.noAccount")}{" "}
            <Link to={`/signup${location.search}`} className="font-semibold text-nihao-red-normal hover:underline">
              {t("auth.login.signUpLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
