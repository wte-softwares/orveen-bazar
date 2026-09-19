import { PackageIcon, FileEditIcon, TagsIcon, GalleryHorizontalIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverviewStats } from "@/lib/queries/admin";
import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";

/** Server-rendered — no client interactivity, so it takes the resolved locale as a prop instead of reading the client-only LocaleProvider. */
export function OverviewStats({ stats, locale }: { stats: AdminOverviewStats; locale: Locale }) {
  const cards = [
    { label: translate("admin", "publishedItems", locale), value: stats.publishedItems, icon: PackageIcon },
    { label: translate("admin", "draftItems", locale), value: stats.draftItems, icon: FileEditIcon },
    { label: translate("admin", "categoriesCount", locale), value: stats.categories, icon: TagsIcon },
    { label: translate("admin", "activeBanners", locale), value: stats.activeBanners, icon: GalleryHorizontalIcon },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
