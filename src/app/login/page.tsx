"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LogIn } from "lucide-react";
import { z } from "zod";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useToast, useWishlist } from "@/providers/StoreProvider";
import { consumePendingWishlist } from "@/components/catalog/cards";
import { Field, TextInput } from "@/components/ui/core";
import { PasswordInput } from "@/components/ui/feedback";
import { LogoMark } from "@/components/layout/Logo";
import { demoAccounts } from "@/data/users";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function LoginInner() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { push } = useToast();
  const { add } = useWishlist();
  const router = useRouter();
  const params = useSearchParams();
  usePageTitle(t("auth.loginTitle"), "Log In");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") next.email = t("validation.invalidEmail");
        if (issue.path[0] === "password") next.password = t("validation.required");
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await login(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (!result.ok) {
      setErrors({ form: t("auth.invalidCredentials") });
      return;
    }
    /* Guest wishlist intent is applied right after a successful demo login. */
    const pending = consumePendingWishlist();
    if (pending) {
      add(pending);
      push(t("wishlist.saved"));
    } else {
      push(t("auth.loginSuccess"));
    }
    const next = params.get("next");
    const roleHome = result.user?.role === "customer" ? "/account" : "/admin";
    router.push(next ?? roleHome);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <LogoMark className="mx-auto h-12 w-12 text-[#075ED1]" />
        <h1 className="mt-3 text-center text-[22px] font-black text-[#0346A5]">{t("auth.loginTitle")}</h1>
        <p className="mt-1 text-center text-[12.5px] text-[#66777D]">{t("auth.loginSub")}</p>
        <p className="mt-1 text-center text-[11px] text-[#66777D]">{t("auth.demoNote")}</p>

        {errors.form ? (
          <p role="alert" className="mt-4 rounded-xl bg-[#DC2626]/10 px-4 py-2.5 text-[12.5px] font-semibold text-[#B91C1C]">
            {errors.form}
          </p>
        ) : null}

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Field label={t("auth.email")} htmlFor="lg-email" required error={errors.email}>
            <TextInput
              id="lg-email"
              type="email"
              autoComplete="email"
              value={email}
              invalid={!!errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined, form: undefined }));
              }}
            />
          </Field>
          <Field label={t("auth.password")} htmlFor="lg-pass" required error={errors.password}>
            <PasswordInput
              id="lg-pass"
              autoComplete="current-password"
              value={password}
              invalid={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined, form: undefined }));
              }}
            />
          </Field>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-[12.5px] font-semibold text-[#075ED1] hover:underline">
              {t("auth.forgotLink")}
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075ED1] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0346A5] disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? t("auth.working") : t("auth.submitLogin")}
          </button>
        </form>

        <div className="mt-5 rounded-2xl border border-dashed border-[#E2E8EA] bg-[#F7F9FA] p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#66777D]">{t("auth.demoTitle")}</p>
          <p className="mt-1 text-[11.5px] text-[#66777D]">{t("auth.demoHint")}</p>
          <ul className="mt-2 space-y-1.5">
            {demoAccounts.map((acc) => (
              <li key={acc.email} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-[#17242A]">
                  {acc.email} • {acc.password}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setErrors({});
                  }}
                  className="shrink-0 rounded-lg bg-[#EAF3FE] px-2.5 py-1 text-[11px] font-bold text-[#075ED1] transition hover:bg-[#075ED1] hover:text-white"
                >
                  {t("auth.use")}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#66777D]">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-bold text-[#075ED1] hover:underline">
            {t("auth.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
