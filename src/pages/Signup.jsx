import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../store/authStore";
import { getErrorMessage } from "../api/error";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { getEnrollmentCheckoutPath } from "../utils/enrollmentIntent";

/* ── Zod schema — mirrors backend registerSchema ── */
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Full name must be at most 100 characters"),

    email: z.string().min(1, "Email is required").email("Invalid email address"),

    phone: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format")
      .or(z.literal(""))
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ── Reusable field wrapper ── */
function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Password-strength dots ── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const score = [hasLength, hasLetter, hasNumber].filter(Boolean).length;
  const colours = ["bg-red-400", "bg-nihao-yellow-normal", "bg-green-500"];
  const labels  = ["Weak", "Fair", "Strong"];
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colours[score - 1] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{labels[score - 1] || ""}</span>
    </div>
  );
}

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const registerUser = useAuthStore((s) => s.register);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [serverError,  setServerError]  = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const payload = {
        fullName:        values.fullName,
        email:           values.email,
        password:        values.password,
        confirmPassword: values.confirmPassword,
        ...(values.phone && { phone: values.phone }),
      };
      const user = await registerUser(payload);
      const role = normalizeRole(user?.role);
      const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
      if (role === APP_ROLES.STUDENT && enrollmentCheckout) {
        navigate(enrollmentCheckout, { replace: true });
        return;
      }
      navigate("/");
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.errors.registerFailed")));
    }
  };

  const benefits = [
    t("auth.signup.benefit1"),
    t("auth.signup.benefit2"),
    t("auth.signup.benefit3"),
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — brand ── */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-nihao-red-normal px-10 lg:flex lg:w-[45%]">
        <div className="absolute -start-20 -top-20 h-64 w-64 rounded-full bg-nihao-red-hover/40" />
        <div className="absolute -bottom-24 -end-24 h-80 w-80 rounded-full bg-nihao-red-dark/50" />

        <div className="relative z-10 text-center">
          <img
            src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
            alt="Nihao Academy"
            className="mx-auto mb-6 h-20 w-auto"
          />
          <h1 className="text-3xl font-bold text-white md:text-4xl">Nihao Academy</h1>
          <p className="mt-3 max-w-xs text-sm text-white/80">
            {t("auth.signup.brandSubtitle")}
          </p>

          {/* Benefit list */}
          <ul className="mt-8 space-y-3 text-start">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nihao-yellow-normal">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 md:px-12">
        {/* Mobile logo */}
        <Link to="/" className="mb-6 block lg:hidden">
<div className="flex items-center gap-2">
  
          <img
            src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
            alt="Nihao Academy"
            className="h-12 w-auto"
          />
          <h1 className="text-2xl font-bold text-slate-900">Nihao <span className="text-nihao-red-normal">Academy</span></h1>
            </div>
        </Link>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t("auth.signup.title")}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">{t("auth.signup.subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Field label={t("auth.signup.fullNameLabel")} error={errors.fullName?.message}>
              <input
                type="text"
                autoComplete="name"
                placeholder={t("auth.signup.fullNamePlaceholder")}
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                  errors.fullName ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
                {...register("fullName")}
              />
            </Field>

            <Field label={t("auth.signup.emailLabel")} error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder={t("auth.signup.emailPlaceholder")}
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                  errors.email ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
                {...register("email")}
              />
            </Field>

            <Field
              label={t("auth.signup.phoneLabel")}
              error={errors.phone?.message}
              hint={t("auth.signup.phoneHint")}
            >
              <input
                type="tel"
                autoComplete="tel"
                placeholder={t("auth.signup.phonePlaceholder")}
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                  errors.phone ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
                {...register("phone")}
              />
            </Field>

            <Field label={t("auth.signup.passwordLabel")} error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  className={`w-full rounded-lg border px-4 py-3 pe-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
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
              <PasswordStrength password={passwordValue} />
            </Field>

            <Field label={t("auth.signup.confirmPasswordLabel")} error={errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                  className={`w-full rounded-lg border px-4 py-3 pe-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-nihao-red-normal focus:ring-2 focus:ring-nihao-red-light ${
                    errors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-nihao-red-normal py-3.5 text-sm font-semibold text-white transition hover:bg-nihao-red-hover disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("auth.signup.submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("auth.signup.hasAccount")}{" "}
            <Link to={`/login${location.search}`} className="font-semibold text-nihao-red-normal hover:underline">
              {t("auth.signup.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
