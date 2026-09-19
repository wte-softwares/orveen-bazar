"use client";

import { useMemo, useState } from "react";
import { ArrowUpDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRecentItem } from "@/lib/queries/admin";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export function RecentItemsTable({ items }: { items: AdminRecentItem[] }) {
  const t = useTranslations("admin");
  const [sortField, setSortField] = useState<"title" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const statusLabel = useMemo(
    () => ({
      published: t("statusPublished"),
      draft: t("statusDraft"),
      archived: t("statusArchived"),
    }),
    [t],
  );

  const sortedItems = useMemo(() => {
    if (!sortField) return items;
    return [...items].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortField, sortDir]);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noItemsYet")}</p>;
  }

  const toggleSort = () => {
    if (sortField !== "title") {
      setSortField("title");
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir("asc");
    }
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" className="-ml-3 h-8" onClick={toggleSort}>
                {t("columnTitle")} <ArrowUpDownIcon className="ml-1 size-3.5" />
              </Button>
            </TableHead>
            <TableHead>{t("columnCategory")}</TableHead>
            <TableHead>{t("columnType")}</TableHead>
            <TableHead>{t("columnPrice")}</TableHead>
            <TableHead>{t("columnStatus")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.category?.name ?? "—"}</TableCell>
              <TableCell>{item.type === "service" ? t("typeService") : t("typeProduct")}</TableCell>
              <TableCell>৳{item.price.toLocaleString("en-BD")}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[item.status] ?? "outline"}>
                  {statusLabel[item.status as keyof typeof statusLabel] ?? item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
