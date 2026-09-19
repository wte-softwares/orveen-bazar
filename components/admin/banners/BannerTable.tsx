"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
  CheckCircle2Icon,
  ClockIcon,
  ArrowUpDownIcon,
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
import type { AdminBannerItem } from "@/lib/queries/banners";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface BannerTableProps {
  banners: AdminBannerItem[];
  orgSlug: string;
  onEdit: (banner: AdminBannerItem) => void;
  onDelete: (banner: AdminBannerItem) => void;
  onToggleActive: (banner: AdminBannerItem, newActive: boolean) => Promise<void>;
}

export function BannerTable({
  banners,
  onEdit,
  onDelete,
  onToggleActive,
}: BannerTableProps) {
  const t = useTranslations("admin");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (banner: AdminBannerItem, checked?: boolean) => {
    const nextState = typeof checked === "boolean" ? checked : !banner.is_active;
    setTogglingId(banner.id);
    try {
      await onToggleActive(banner, nextState);
    } finally {
      setTogglingId(null);
    }
  };

  if (banners.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("noBannersFound")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[180px]">Preview</TableHead>
            <TableHead className="min-w-[220px]">Alt Text & Details</TableHead>
            <TableHead className="min-w-[180px]">Target Link</TableHead>
            <TableHead className="w-[110px] text-center">
              <div className="flex items-center justify-center gap-1">
                <ArrowUpDownIcon className="size-3 text-muted-foreground" />
                <span>Order</span>
              </div>
            </TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => {
            const isToggling = togglingId === banner.id;
            const imageUrl = publicAssetUrl(banner.image_path);

            return (
              <TableRow key={banner.id} className="transition-colors">
                {/* Banner Thumbnail */}
                <TableCell>
                  <div className="relative aspect-[21/9] w-36 overflow-hidden rounded-lg border bg-muted/20 shadow-2xs">
                    <Image
                      src={imageUrl}
                      alt={banner.alt_text}
                      fill
                      sizes="144px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </TableCell>

                {/* Alt Text & Details */}
                <TableCell>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm line-clamp-2 text-foreground">
                      {banner.alt_text}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono truncate mt-0.5 max-w-[260px]">
                      {banner.image_path}
                    </span>
                  </div>
                </TableCell>

                {/* Target URL */}
                <TableCell>
                  {banner.target_url ? (
                    <Link
                      href={banner.target_url}
                      target={banner.target_url.startsWith("http") ? "_blank" : undefined}
                      rel={banner.target_url.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-[200px] truncate"
                    >
                      <span className="truncate">{banner.target_url}</span>
                      <ExternalLinkIcon className="size-3 shrink-0 opacity-70" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None</span>
                  )}
                </TableCell>

                {/* Sort Order */}
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    #{banner.sort_order}
                  </Badge>
                </TableCell>

                {/* Active Switch */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) => handleToggle(banner, checked)}
                      disabled={isToggling}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {banner.is_active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2Icon className="size-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <ClockIcon className="size-3" />
                          Off
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {banner.created_at
                    ? format(new Date(banner.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(banner)}
                      title={t("editBanner")}
                    >
                      <PencilIcon className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(banner)}
                      className="text-muted-foreground hover:text-destructive"
                      title={t("deleteBanner")}
                    >
                      <Trash2Icon className="size-3.5" />
                      <span className="sr-only">Delete</span>
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
