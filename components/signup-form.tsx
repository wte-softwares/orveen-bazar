"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { PRIMARY_BRAND_LOGO_SRC } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { GoogleIcon, FacebookIcon } from "@/components/common/BrandIcons";
import { AuthFeedbackPanel } from "@/components/auth/AuthFeedbackPanel";
import { useComingSoon } from "@/components/common/ComingSoon";
import type { TestimonialRow } from "@/lib/testimonials";

/** Ported from shadcn's signup-04 block — see components/login-form.tsx for the general approach. */
export function SignupForm({
  testimonials,
  className,
  ...props
}: React.ComponentProps<"div"> & { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const { trigger: triggerComingSoon } = useComingSoon();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? t("genericError"));
        return;
      }
      if (body.data?.needsEmailConfirmation) {
        setNotice(t("checkEmail"));
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  // Google/Facebook sign-in is temporarily disabled — see the matching note
  // in components/login-form.tsx.
  function handleOAuth(provider: "google" | "facebook") {
    triggerComingSoon(provider === "google" ? "Google sign-in" : "Facebook sign-in");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <AuthFeedbackPanel testimonials={testimonials} />
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href="/">
                  <Image src={PRIMARY_BRAND_LOGO_SRC} alt="ORVEEN BAZAR.COM" width={140} height={46} className="h-9 w-auto object-contain" />
                </Link>
                <h1 className="text-2xl font-bold">{t("createAccountHeading")}</h1>
                <p className="text-sm text-balance text-muted-foreground">{t("createAccountSubtitle")}</p>
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
                <FieldLabel htmlFor="displayName">{t("nameLabel")}</FieldLabel>
                <Input id="displayName" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">{t("confirmPasswordLabel")}</FieldLabel>
                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Field>
                </Field>
              </Field>
              <Field>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t("creatingAccount") : t("createAccountButton")}
                </Button>
              </Field>
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
                      />
                    }
                  >
                    <GoogleIcon className="size-4" />
                    {t("continueWithGoogle")}
                  </TooltipTrigger>
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
                      />
                    }
                  >
                    <FacebookIcon className="size-4" />
                    {t("continueWithFacebook")}
                  </TooltipTrigger>
                  <TooltipContent>{t("oauthComingSoon")}</TooltipContent>
                </Tooltip>
              </Field>
              <FieldDescription className="text-center">
                {t("alreadyHaveAccount")} <Link href="/login">{t("signInLink")}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
