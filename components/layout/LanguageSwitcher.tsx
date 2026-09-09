"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/types";

const options: { code: Lang; label: string }[] = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher({
  variant = "topbar",
  tone = "light",
  className,
}: {
  variant?: "topbar" | "block";
  /** light = sits on dark background, dark = sits on white background */
  tone?: "light" | "dark";
  className?: string;
}) {
  const { language, setLanguage } = useLanguage();

  if (variant === "block") {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)} role="group" aria-label="Language">
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            aria-pressed={language === opt.code}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
              language === opt.code
                ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                : "border-[#E2E8EA] bg-white text-[#17242A] hover:border-[#1D4ED8]/40 hover:bg-[#E8F0FE]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full p-0.5",
        tone === "light" ? "border border-white/25 bg-white/10" : "border border-[#E2E8EA] bg-[#F5F8FE]",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLanguage(opt.code)}
          aria-pressed={language === opt.code}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
            language === opt.code
              ? tone === "light"
                ? "bg-white text-[#1D4ED8]"
                : "bg-[#1D4ED8] text-white"
              : tone === "light"
                ? "text-white/85 hover:bg-white/15"
                : "text-[#66777D] hover:bg-[#E8F0FE]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
