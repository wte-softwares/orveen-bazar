"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Field, TextInput } from "@/components/ui/core";
import { PasswordInput } from "@/components/ui/feedback";
import { LogoMark } from "@/components/layout/Logo";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { user, resetPassword } = useAuth();

  const [email, setEmail] = useState(() => searchParams.get("email") || user?.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t("validation.invalidEmail");
    }
    if (password.length < 6) {
      next.password = t("validation.minLength", { count: 6 });
    }
    if (confirm !== password) {
      next.confirm = t("validation.passwordMismatch");
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await resetPassword(email, password);
    setLoading(false);
    if (!res.ok) {
      setErrors({ general: t("auth.accountNotFound") });
      return;
    }
    setDone(true);
  };

  return (
    <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
      <LogoMark className="mx-auto h-12 w-12 text-[#075ED1]" />
      <h1 className="mt-3 text-center text-[22px] font-black text-[#0346A5]">{t("auth.resetTitle")}</h1>
      <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("auth.resetSub")}</p>

      {done ? (
        <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-5 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-[#16A34A]" />
          <p className="mt-2 text-[13.5px] font-semibold text-[#14532D]">{t("auth.resetSuccess")}</p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-xl bg-[#075ED1] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0346A5]"
          >
            {t("auth.loginTitle")}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {errors.general ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errors.general}
            </div>
          ) : null}
          <Field label={t("auth.email")} htmlFor="rs-email" required error={errors.email}>
            <TextInput
              id="rs-email"
              type="email"
              autoComplete="email"
              value={email}
              invalid={!!errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined, general: undefined }));
              }}
            />
          </Field>
          <Field label={t("auth.password")} htmlFor="rs-pass" required error={errors.password}>
            <PasswordInput
              id="rs-pass"
              autoComplete="new-password"
              value={password}
              invalid={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined, general: undefined }));
              }}
            />
          </Field>
          <Field label={t("auth.confirmPassword")} htmlFor="rs-confirm" required error={errors.confirm}>
            <PasswordInput
              id="rs-confirm"
              autoComplete="new-password"
              value={confirm}
              invalid={!!errors.confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((p) => ({ ...p, confirm: undefined, general: undefined }));
              }}
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075ED1] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0346A5] disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? t("auth.working") : t("auth.submitReset")}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  usePageTitle(t("auth.resetTitle"), "Reset Password");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <Suspense fallback={<div className="min-h-[300px] rounded-3xl border border-[#E2E8EA] bg-white p-8" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
