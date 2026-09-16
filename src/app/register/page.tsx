"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { z } from "zod";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/StoreProvider";
import { Field, TextInput } from "@/components/ui/core";
import { PasswordInput } from "@/components/ui/feedback";
import { LogoMark } from "@/components/layout/Logo";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  usePageTitle(t("auth.registerTitle"), "Create Account");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const schema = z
    .object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
      confirm: z.string(),
    })
    .refine((value) => value.confirm === value.password, { path: ["confirm"] });

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof typeof form, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key === "confirm") next.confirm = t("validation.passwordMismatch");
        else if (key === "email") next.email = t("validation.invalidEmail");
        else if (key === "name") next.name = t("validation.minLength", { count: 3 });
        else next.password = t("validation.minLength", { count: 6 });
      }
      setErrors(next);
      return;
    }
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (!result.ok) {
      setErrors({ email: result.error === "exists" ? t("validation.emailExists") : t("validation.invalidEmail") });
      return;
    }
    /* Demo email-confirmation screen — no email is actually sent. */
    setConfirmed(true);
    push(t("auth.registerSuccess"));
    window.setTimeout(() => router.push("/account"), 1600);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <LogoMark className="mx-auto h-12 w-12 text-[#075ED1]" />
        <h1 className="mt-3 text-center text-[22px] font-black text-[#0346A5]">
          {t("auth.registerTitle")}
        </h1>
        <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("auth.registerSub")}</p>
        <p className="mt-1 text-center text-[11px] text-[#66777D]">{t("auth.demoNote")}</p>

        {confirmed ? (
          <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-5 text-center">
            <p className="text-[13.5px] font-semibold text-[#14532D]">{t("auth.registerSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <Field label={t("auth.name")} htmlFor="rg-name" required error={errors.name}>
              <TextInput id="rg-name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label={t("auth.email")} htmlFor="rg-email" required error={errors.email}>
              <TextInput id="rg-email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label={t("auth.password")} htmlFor="rg-pass" required error={errors.password}>
              <PasswordInput id="rg-pass" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={(e) => set("password", e.target.value)} />
            </Field>
            <Field label={t("auth.confirmPassword")} htmlFor="rg-confirm" required error={errors.confirm}>
              <PasswordInput id="rg-confirm" autoComplete="new-password" value={form.confirm} invalid={!!errors.confirm} onChange={(e) => set("confirm", e.target.value)} />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D9819] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#238014] disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? t("auth.working") : t("auth.submitRegister")}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-[13px] text-[#66777D]">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-bold text-[#075ED1] hover:underline">
            {t("auth.loginTitle")}
          </Link>
        </p>
      </div>
    </div>
  );
}
