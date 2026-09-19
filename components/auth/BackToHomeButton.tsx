"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/** Fixed top-left escape hatch on the standalone auth pages — see app/login and app/register. */
export function BackToHomeButton() {
  const t = useTranslations("auth");

  return (
    <Button
      variant="ghost"
      className="absolute top-4 left-4 gap-1.5 md:top-6 md:left-6"
      nativeButton={false}
      render={<Link href="/" />}
    >
      <ArrowLeft className="size-4" />
      {t("backToHome")}
    </Button>
  );
}
