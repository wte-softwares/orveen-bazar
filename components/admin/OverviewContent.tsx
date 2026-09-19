"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewStats } from "@/components/admin/OverviewStats";
import { RecentItemsTable } from "@/components/admin/RecentItemsTable";
import type { AdminOverviewStats, AdminRecentItem } from "@/lib/queries/admin";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Client Component wrapping the Overview page's presentation so every label
 * reacts instantly to a language switch, the same as the rest of the admin
 * chrome (sidebar, header) — data fetching itself stays server-side in
 * app/admin/page.tsx, only rendering happens here.
 */
export function OverviewContent({
  orgSlug,
  stats,
  recentItems,
}: {
  orgSlug: string;
  stats: AdminOverviewStats;
  recentItems: AdminRecentItem[];
}) {
  const { locale } = useLocale();
  const t = useTranslations("admin");

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("overviewHeading")}</h1>
        <Button nativeButton={false} render={<Link href={`/admin/${orgSlug}/items/new`} />}>
          <PlusIcon />
          {t("addProduct")}
        </Button>
      </div>

      <OverviewStats stats={stats} locale={locale} />

      <Card>
        <CardHeader>
          <CardTitle>{t("recentItems")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentItemsTable items={recentItems} />
        </CardContent>
      </Card>
    </div>
  );
}
