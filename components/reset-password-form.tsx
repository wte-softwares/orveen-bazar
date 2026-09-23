"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { formatApiError } from "@/lib/api/format-error";
import type { TestimonialRow } from "@/lib/testimonials";

/**
 * Reached only after app/auth/callback/route.ts has already exchanged the
 * emailed recovery link's code for a session — see that route and
 * app/api/v1/auth/forgot-password/route.ts. If the visitor lands here
 * without that (link expired, or navigated here directly),
 * POST /api/v1/auth/reset-password responds 401 and this form surfaces it.
 */
export function ResetPasswordForm({
  testimonials,
  className,
  ...props
}: React.ComponentProps<"div"> & { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(formatApiError(body, t("genericError")));
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError(t("genericError"));
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
                <h1 className="text-2xl font-bold">{t("resetPasswordHeading")}</h1>
                <p className="text-balance text-muted-foreground">{t("resetPasswordSubtitle")}</p>
              </div>

              {error ? (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {done ? (
                <p role="status" className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                  {t("passwordUpdated")}
                </p>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="password">{t("newPasswordLabel")}</FieldLabel>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">{t("confirmPasswordLabel")}</FieldLabel>
                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Field>
                </>
              )}
              <Field>
                <Button type="submit" disabled={submitting || done}>
                  {submitting ? t("updatingPassword") : t("updatePasswordButton")}
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
