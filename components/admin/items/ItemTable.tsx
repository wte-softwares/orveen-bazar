"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  PencilIcon,
  ArchiveIcon,
  PackageIcon,
  ImageIcon,
  PlusIcon,
} from "lucide-react";
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
import type { AdminCatalogItemSummary } from "@/lib/queries/catalog";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface ItemTableProps {
  items: AdminCatalogItemSummary[];
  orgSlug: string;
  onArchive: (item: AdminCatalogItemSummary) => void;
}

export function ItemTable({ items, orgSlug, onArchive }: ItemTableProps) {
  const t = useTranslations("admin");

  if (items.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/20">
        <PackageIcon className="mb-3 h-10 w-10 text-muted-foreground/60" />
        <p className="text-base font-semibold text-foreground">{t("noItemsFound")}</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Get started by adding your first product or service for this organization.
        </p>
        <Button
          nativeButton={false}
          render={<Link href={`/admin/${orgSlug}/items/new`} />}
          size="sm"
          className="mt-4 gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {t("addItem")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Cover</TableHead>
            <TableHead>{t("itemTitle")}</TableHead>
            <TableHead>{t("itemCategory")}</TableHead>
            <TableHead>{t("itemType")}</TableHead>
            <TableHead>{t("itemPrice")}</TableHead>
            <TableHead>{t("colStatus")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("colJoined")}</TableHead>
            <TableHead className="text-right">{t("colActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const coverImage = item.item_images?.[0]?.image_path;

            const statusBadgeVariant =
              item.status === "published"
                ? "default"
                : item.status === "draft"
                ? "secondary"
                : "outline";

            return (
              <TableRow key={item.id}>
                {/* Cover thumbnail */}
                <TableCell>
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {coverImage ? (
                      <Image
                        src={publicAssetUrl(coverImage)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>
                </TableCell>

                {/* Title & Slug */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{item.title}</span>
                    <code className="mt-0.5 w-fit rounded bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">
                      {item.slug}
                    </code>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell>
                  {item.category ? (
                    <Badge variant="outline" className="text-xs">
                      {item.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Type */}
                <TableCell>
                  <span className="text-xs capitalize text-muted-foreground">
                    {item.type === "product" ? t("typeProduct") : t("typeService")}
                  </span>
                </TableCell>

                {/* Price (Display Only) */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">৳{item.price}</span>
                    {item.compare_at_price != null && (
                      <span className="text-xs text-muted-foreground line-through">
                        ৳{item.compare_at_price}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <Badge variant={statusBadgeVariant} className="text-xs capitalize">
                    {item.status === "published"
                      ? t("filterStatusPublished")
                      : item.status === "draft"
                      ? t("filterStatusDraft")
                      : t("filterStatusArchived")}
                  </Badge>
                </TableCell>

                {/* Date */}
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {format(new Date(item.updated_at), "MMM d, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={t("editItem")}
                      nativeButton={false}
                      render={
                        <Link href={`/admin/${orgSlug}/items/${item.id}`}>
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">{t("editItem")}</span>
                        </Link>
                      }
                    />
                    {item.status !== "archived" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onArchive(item)}
                        title={t("archiveItem")}
                      >
                        <ArchiveIcon className="h-4 w-4" />
                        <span className="sr-only">{t("archiveItem")}</span>
                      </Button>
                    )}
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
