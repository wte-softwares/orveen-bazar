"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  PencilIcon,
  Trash2Icon,
  LayersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCategoryItem } from "@/lib/queries/categories";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface CategoryTableProps {
  categories: AdminCategoryItem[];
  orgSlug: string;
  onEdit: (category: AdminCategoryItem) => void;
  onDelete: (category: AdminCategoryItem) => void;
  onToggleActive: (category: AdminCategoryItem, newActive: boolean) => Promise<void>;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoryTableProps) {
  const t = useTranslations("admin");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (category: AdminCategoryItem, checked?: boolean) => {
    const nextState = typeof checked === "boolean" ? checked : !category.is_active;
    setTogglingId(category.id);
    try {
      await onToggleActive(category, nextState);
    } finally {
      setTogglingId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <LayersIcon className="mb-2 h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{t("noCategoriesFound")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("categoryName")}</TableHead>
            <TableHead>{t("categorySlug")}</TableHead>
            <TableHead>{t("categoryItemCount")}</TableHead>
            <TableHead>{t("categorySortOrder")}</TableHead>
            <TableHead>{t("categoryStatus")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("colJoined")}</TableHead>
            <TableHead className="text-right">{t("colActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const isToggling = togglingId === category.id;

            return (
              <TableRow key={category.id}>
                {/* Name */}
                <TableCell>
                  <span className="font-medium text-foreground">{category.name}</span>
                </TableCell>

                {/* Slug */}
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {category.slug}
                  </code>
                </TableCell>

                {/* Item Count */}
                <TableCell>
                  <Badge variant={category.item_count > 0 ? "secondary" : "outline"} className="text-xs">
                    {category.item_count} {t("categoryItemCount").toLowerCase()}
                  </Badge>
                </TableCell>

                {/* Sort Order */}
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    #{category.sort_order}
                  </span>
                </TableCell>

                {/* Active Toggle */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.is_active}
                      disabled={isToggling}
                      onCheckedChange={(checked) => handleToggle(category, checked)}
                      aria-label={`${category.name} status`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {category.is_active ? t("bannerActive") : t("bannerInactive")}
                    </span>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {format(new Date(category.created_at), "MMM d, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(category)}
                      title={t("editCategory")}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">{t("editCategory")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(category)}
                      title={t("deleteCategory")}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">{t("deleteCategory")}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
