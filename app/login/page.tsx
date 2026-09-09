"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { Field, TextInput } from "@/components/ui/core";
import { LogoMark } from "@/components/layout/Logo";
import { LS_KEYS, writeLS } from "@/lib/utils";

export default function LoginPage() {
  const { t } = useLanguage();
  const { push } = useToast();
  const router = useRouter();
  usePageTitle(t("account.loginTitle"), "Login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = t("validation.invalidEmail");
    if (password.length < 6) next.password = t("validation.minLength", { count: 6 });
    setErrors(next);
    if (Object.keys(next).length > 0) {
      push(t("toasts.formError"), "error");
      return;
    }
    writeLS(LS_KEYS.session, { name: email.split("@")[0], email: email.trim(), mobile: "" });
    push(t("toasts.loginSuccess"));
    router.push("/account");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <LogoMark className="mx-auto h-12 w-12 text-[#1D4ED8]" />
        <h1 className="mt-3 text-center text-[22px] font-black text-[#16339B]">
          {t("account.loginTitle")}
        </h1>
        <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("account.loginSub")}</p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field label={t("account.email")} htmlFor="lg-email" required error={errors.email}>
            <TextInput
              id="lg-email"
              type="email"
              autoComplete="email"
              value={email}
              invalid={!!errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
            />
          </Field>
          <Field label={t("account.password")} htmlFor="lg-pass" required error={errors.password}>
            <TextInput
              id="lg-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
            />
          </Field>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#16339B]"
          >
            <LogIn className="h-4 w-4" />
            {t("account.loginSubmit")}
          </button>
        </form>

        <p className="mt-4 rounded-xl bg-[#E8F0FE] px-3 py-2 text-center text-[11.5px] text-[#1D4ED8]">
          {t("account.storageNotice")}
        </p>

        <p className="mt-4 text-center text-[13px] text-[#66777D]">
          {t("account.noAccount")}{" "}
          <Link href="/register" className="font-bold text-[#1D4ED8] hover:underline">
            {t("account.registerTitle")}
          </Link>
        </p>
      </div>
    </div>
  );
}
