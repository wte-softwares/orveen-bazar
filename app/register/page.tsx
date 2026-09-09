"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { Field, TextInput } from "@/components/ui/core";
import { LogoMark } from "@/components/layout/Logo";
import { LS_KEYS, writeLS } from "@/lib/utils";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { push } = useToast();
  const router = useRouter();
  usePageTitle(t("account.registerTitle"), "Create Account");

  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (form.name.trim().length < 3) next.name = t("validation.minLength", { count: 3 });
    const mobile = form.mobile.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    if (!/^01[3-9]\d{8}$/.test(mobile)) next.mobile = t("validation.invalidMobile");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = t("validation.invalidEmail");
    if (form.password.length < 6) next.password = t("validation.minLength", { count: 6 });
    if (form.confirm !== form.password) next.confirm = t("validation.passwordMismatch");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      push(t("toasts.formError"), "error");
      return;
    }
    writeLS(LS_KEYS.session, { name: form.name.trim(), email: form.email.trim(), mobile });
    push(t("toasts.registered"));
    router.push("/account");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <LogoMark className="mx-auto h-12 w-12 text-[#1D4ED8]" />
        <h1 className="mt-3 text-center text-[22px] font-black text-[#16339B]">
          {t("account.registerTitle")}
        </h1>
        <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("account.registerSub")}</p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field label={t("account.name")} htmlFor="rg-name" required error={errors.name}>
            <TextInput id="rg-name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label={t("account.mobile")} htmlFor="rg-mobile" required error={errors.mobile}>
            <TextInput id="rg-mobile" inputMode="tel" placeholder="01XXXXXXXXX" value={form.mobile} invalid={!!errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
          </Field>
          <Field label={t("account.email")} htmlFor="rg-email" required error={errors.email}>
            <TextInput id="rg-email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label={t("account.password")} htmlFor="rg-pass" required error={errors.password}>
            <TextInput id="rg-pass" type="password" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label={t("account.confirmPassword")} htmlFor="rg-confirm" required error={errors.confirm}>
            <TextInput id="rg-confirm" type="password" autoComplete="new-password" value={form.confirm} invalid={!!errors.confirm} onChange={(e) => set("confirm", e.target.value)} />
          </Field>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E9E44] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#1F7A33]"
          >
            <UserPlus className="h-4 w-4" />
            {t("account.registerSubmit")}
          </button>
        </form>

        <p className="mt-4 rounded-xl bg-[#E8F0FE] px-3 py-2 text-center text-[11.5px] text-[#1D4ED8]">
          {t("account.storageNotice")}
        </p>

        <p className="mt-4 text-center text-[13px] text-[#66777D]">
          {t("account.haveAccount")}{" "}
          <Link href="/login" className="font-bold text-[#1D4ED8] hover:underline">
            {t("account.loginTitle")}
          </Link>
        </p>
      </div>
    </div>
  );
}
