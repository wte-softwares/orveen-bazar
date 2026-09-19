"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface AccountProfileFormProps {
  email: string;
  initialDisplayName: string | null;
  userId: string;
}

export function AccountProfileForm({
  email,
  initialDisplayName,
}: AccountProfileFormProps) {
  const router = useRouter();
  const t = useTranslations("account");

  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Failed to update profile.");
      }

      setSuccessMessage(t("savedSuccess"));
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {t("personalInfo")}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {t("accountSubtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 text-xs font-semibold"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{loggingOut ? "Signing out..." : t("signOut")}</span>
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Address (Read-only) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("emailAddress")}</span>
          </label>
          <Input
            type="email"
            value={email}
            disabled
            className="h-10 rounded-xl bg-muted/40 border-[var(--border-default)] text-muted-foreground cursor-not-allowed text-sm"
          />
          <p className="text-[11px] text-[var(--text-secondary)]">
            {t("emailHelp")}
          </p>
        </div>

        {/* Display Name (Editable) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("displayName")}</span>
          </label>
          <Input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
            data-testid="profile-display-name-input"
            className="h-10 rounded-xl bg-[var(--bg-base)] border-[var(--border-default)] text-sm"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            data-testid="profile-save-btn"
            className="h-10 px-6 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs"
          >
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
