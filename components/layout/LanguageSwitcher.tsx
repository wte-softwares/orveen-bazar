"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/** A direct BN/EN toggle keeps the utility row compact and predictable. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations("header");
  const nextLocale = locale === "bn" ? "en" : "bn";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={t("languageSwitcher")}
      aria-pressed={locale === "en"}
      onClick={() => setLocale(nextLocale)}
      className={cn(
        "gap-1 text-[var(--brand-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]",
        compact ? "h-9 px-2" : "h-14 min-w-16 flex-col px-2",
      )}
    >
      <Globe className="size-5" />
      <span className={cn("rounded-full bg-[var(--color-primary-50)] px-1.5 py-0.5 font-bold", compact ? "text-xs" : "text-[10px] leading-none")}>
        {locale === "bn" ? "বাং" : "EN"}
      </span>
    </Button>
  );
}
