"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { ErrorState } from "@/components/ui/feedback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <ErrorState title={t("errors.errorTitle")} description={t("errors.errorDesc")} onRetry={reset} />
      <div className="mt-4 flex justify-center">
        <Link
          href="/"
          className="rounded-xl border border-[#E2E8EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#17242A] transition hover:bg-[#F7F9FA]"
        >
          {t("errors.backHome")}
        </Link>
      </div>
    </div>
  );
}
