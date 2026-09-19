"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function CatalogPagination({
  currentPage,
  totalPages,
}: CatalogPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("catalog");

  if (totalPages <= 1) return null;

  function createPageUrl(pageNumber: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      {/* Previous Page */}
      {currentPage > 1 ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={createPageUrl(currentPage - 1)} />}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t("previousPage")}</span>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1 text-xs opacity-40">
          <ChevronLeft className="h-4 w-4" />
          <span>{t("previousPage")}</span>
        </Button>
      )}

      {/* Page indicator */}
      <span className="text-xs text-[var(--text-secondary)] px-3 font-medium">
        {t("pageOf")} {currentPage} / {totalPages}
      </span>

      {/* Next Page */}
      {currentPage < totalPages ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={createPageUrl(currentPage + 1)} />}
          className="gap-1 text-xs"
        >
          <span>{t("nextPage")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1 text-xs opacity-40">
          <span>{t("nextPage")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
