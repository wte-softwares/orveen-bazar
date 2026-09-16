"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MailQuestion } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { Field, TextInput } from "@/components/ui/core";
import { LogoMark } from "@/components/layout/Logo";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  usePageTitle(t("auth.forgotTitle"), "Forgot Password");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("validation.invalidEmail"));
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 700);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <LogoMark className="mx-auto h-12 w-12 text-[#075ED1]" />
        <h1 className="mt-3 text-center text-[22px] font-black text-[#0346A5]">{t("auth.forgotTitle")}</h1>
        <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("auth.forgotSub")}</p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-5 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-[#16A34A]" />
            <p className="mt-2 text-[13.5px] font-semibold text-[#14532D]">{t("auth.forgotSuccess")}</p>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}
              className="mt-3 inline-block text-[13px] font-bold text-[#075ED1] hover:underline"
            >
              {t("auth.resetTitle")}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <Field label={t("auth.email")} htmlFor="fp-email" required error={error}>
              <TextInput
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                invalid={!!error}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075ED1] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0346A5] disabled:opacity-60"
            >
              <MailQuestion className="h-4 w-4" />
              {loading ? t("auth.sending") : t("auth.submitForgot")}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-[13px] text-[#66777D]">
          <Link href="/login" className="font-bold text-[#075ED1] hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
