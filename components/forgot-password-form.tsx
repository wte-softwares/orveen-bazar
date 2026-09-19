"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PRIMARY_BRAND_LOGO_SRC } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { AuthFeedbackPanel } from "@/components/auth/AuthFeedbackPanel";
import type { TestimonialRow } from "@/lib/testimonials";

/** Same Card/logo/FeedbackPanel treatment as login-form.tsx and signup-form.tsx — see AGENTS.md-adjacent notes there for why. */
export function ForgotPasswordForm({
  testimonials,
  className,
  ...props
}: React.ComponentProps<"div"> & { testimonials: TestimonialRow[] }) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show the same success state whether or not the email is
      // registered — see app/api/v1/auth/forgot-password/route.ts, which
      // deliberately never reports failure either, for the same reason.
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href="/">
                  <Image src={PRIMARY_BRAND_LOGO_SRC} alt="ORVEEN BAZAR.COM" width={140} height={46} className="h-9 w-auto object-contain" />
                </Link>
                <h1 className="text-2xl font-bold">{t("forgotPasswordHeading")}</h1>
                <p className="text-balance text-muted-foreground">{t("forgotPasswordSubtitle")}</p>
              </div>

              {sent ? (
                <p role="status" className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                  {t("resetLinkSent")}
                </p>
              ) : (
                <Field>
                  <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                  <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={submitting || sent}>
                  {submitting ? t("sendingResetLink") : t("sendResetLink")}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                <Link href="/login">{t("backToLogin")}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <AuthFeedbackPanel testimonials={testimonials} />
        </CardContent>
      </Card>
    </div>
  );
}
