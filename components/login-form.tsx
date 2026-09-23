"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { PRIMARY_BRAND_LOGO_SRC } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { GoogleIcon, FacebookIcon } from "@/components/common/BrandIcons";
import { AuthFeedbackPanel } from "@/components/auth/AuthFeedbackPanel";
import { useComingSoon } from "@/components/common/ComingSoon";
import type { TestimonialRow } from "@/lib/testimonials";

/**
 * Ported from shadcn's login-04 block, restyled with the storefront's brand
 * tokens and wired to the real auth API instead of the block's placeholder
 * form. Only Google and Facebook OAuth are offered (Apple was dropped) per
 * the client's request — see AGENTS.md for the no-cart/no-payments scope
 * this account system otherwise sits within.
 */
export function LoginForm({
  testimonials,
  className,
  ...props
}: React.ComponentProps<"div"> & { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const { trigger: triggerComingSoon } = useComingSoon();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"password" | "magicLink">("password");

  const redirectTo = searchParams.get("redirect") || "/account";

  async function handleSubmit(event?: FormEvent) {
    if (event) event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? t("genericError"));
        return;
      }

      // Staff/platform-admin accounts land straight in the dashboard rather
      // than the customer-facing ?redirect= target — a signed-in admin has
      // no use for /account, and this is the only place that knows both
      // "login just succeeded" and "what kind of account is this."
      const sessionRes = await fetch("/api/v1/auth/session");
      const session = sessionRes.ok ? await sessionRes.json() : null;
      const hasAdminAccess = Boolean(session?.data?.isPlatformAdmin) || (session?.data?.membershipOrgIds?.length ?? 0) > 0;

      router.push(hasAdminAccess ? "/admin" : redirectTo);
      router.refresh();
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  // Google/Facebook sign-in is temporarily disabled — see AGENTS.md-style
  // scope note in components/common/ComingSoon.tsx. Kept as a real,
  // non-`disabled` button so it stays keyboard/hover accessible for the
  // tooltip and the shared "coming soon" dialog, instead of blocking
  // pointer events the way a native `disabled` attribute would.
  function handleOAuth(provider: "google" | "facebook") {
    triggerComingSoon(provider === "google" ? "Google sign-in" : "Facebook sign-in");
  }

  async function handleMagicLink(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` },
      });
      if (otpError) {
        setError(t("genericError"));
        return;
      }
      setNotice(t("magicLinkSent"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={mode === "password" ? handleSubmit : handleMagicLink} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href="/">
                  <Image src={PRIMARY_BRAND_LOGO_SRC} alt="ORVEEN BAZAR.COM" width={140} height={46} className="h-9 w-auto object-contain" />
                </Link>
                <h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
                <p className="text-balance text-muted-foreground">{mode === "password" ? t("signInSubtitle") : t("magicLinkSubtitle")}</p>
              </div>

              {error ? (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p role="status" className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                  {notice}
                </p>
              ) : null}

              <Field>
                <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              {mode === "password" ? (
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                    <Link href="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
              ) : null}
              <Field>
                <Button
                  type="submit"
                  onClick={mode === "password" ? handleSubmit : handleMagicLink}
                  disabled={submitting}
                >
                  {mode === "password" ? (submitting ? t("signingIn") : t("signInButton")) : submitting ? t("sendingMagicLink") : t("sendMagicLink")}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    setMode((m) => (m === "password" ? "magicLink" : "password"));
                    setError(null);
                    setNotice(null);
                  }}
                >
                  {mode === "password" ? t("useMagicLink") : t("usePasswordInstead")}
                </button>
              </FieldDescription>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">{t("orContinueWith")}</FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        type="button"
                        aria-label={`${t("continueWithGoogle")} (coming soon)`}
                        className="cursor-not-allowed opacity-60"
                        onClick={() => handleOAuth("google")}
                      >
                        <GoogleIcon className="size-4" />
                        {t("continueWithGoogle")}
                      </Button>
                    }
                  />
                  <TooltipContent>{t("oauthComingSoon")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        type="button"
                        aria-label={`${t("continueWithFacebook")} (coming soon)`}
                        className="cursor-not-allowed opacity-60"
                        onClick={() => handleOAuth("facebook")}
                      >
                        <FacebookIcon className="size-4" />
                        {t("continueWithFacebook")}
                      </Button>
                    }
                  />
                  <TooltipContent>{t("oauthComingSoon")}</TooltipContent>
                </Tooltip>
              </Field>
              <FieldDescription className="text-center">
                {t("noAccount")} <Link href="/register">{t("signUpLink")}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <AuthFeedbackPanel testimonials={testimonials} />
        </CardContent>
      </Card>
    </div>
  );
}
