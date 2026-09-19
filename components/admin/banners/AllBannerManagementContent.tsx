"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  GalleryHorizontalIcon,
  CheckCircle2Icon,
  ClockIcon,
  SearchIcon,
  PlusIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
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
import { BannerDialog } from "./BannerDialog";
import { DeleteBannerDialog } from "./DeleteBannerDialog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { BRANDS } from "@/lib/site-config";

const emptySubscribe = () => () => {};

export interface OrganizationOption {
  id: string;
  slug: string;
  name: string;
}

interface AllBannerManagementContentProps {
  initialBanners: AdminBannerItem[];
  organizations: OrganizationOption[];
}

export function AllBannerManagementContent({
  initialBanners,
  organizations,
}: AllBannerManagementContentProps) {
  const t = useTranslations("admin");
  const [banners, setBanners] = useState<AdminBannerItem[]>(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerItem | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBannerItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function refreshBanners() {
    try {
      const res = await fetch("/api/v1/admin/banners");
      const json = await res.json();
      if (res.ok && json.data) {
        setBanners(json.data);
      }
    } catch {
      // background refresh error non-fatal
    }
  }

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: AdminBannerItem) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleToggleActive = async (banner: AdminBannerItem, newActive: boolean) => {
    setTogglingId(banner.id);
    try {
      const res = await fetch(`/api/v1/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update banner status.");
      }

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: newActive } : b))
      );

      setNotification({
        type: "success",
        message: newActive ? "Banner activated and published!" : "Banner deactivated!",
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to toggle status.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [banners]);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAlt = b.alt_text.toLowerCase().includes(query);
        const matchesLink = b.target_url?.toLowerCase().includes(query) ?? false;
        if (!matchesAlt && !matchesLink) return false;
      }

      // Status
      if (statusFilter === "active" && !b.is_active) return false;
      if (statusFilter === "inactive" && b.is_active) return false;

      // Brand
      if (brandFilter !== "all") {
        if (b.organization_id !== brandFilter && b.organization?.slug !== brandFilter) {
          return false;
        }
      }

      return true;
    });
  }, [banners, searchQuery, statusFilter, brandFilter]);

  // Active dialog organization defaults
  const activeDialogOrgId = editingBanner?.organization_id ?? (brandFilter !== "all" ? brandFilter : organizations[0]?.id ?? "");
  const activeDialogOrgSlug = organizations.find((o) => o.id === activeDialogOrgId)?.slug ?? organizations[0]?.slug ?? "orveen-bazar";

  return (
    <div
      data-slot="all-banner-management"
      data-hydrated={mounted ? "true" : "false"}
      className="flex flex-1 flex-col gap-6"
    >
      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("allBannersHeading")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("allBannersSubtitle")}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <PlusIcon className="size-4" />
          {t("addBanner")}
        </Button>
      </div>

      {/* Notification Toast/Banner */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-sm animate-in fade-in-0 duration-150 ${
            notification.type === "success"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2Icon className="size-4 shrink-0" />
          ) : (
            <AlertCircleIcon className="size-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 max-w-2xl">
        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GalleryHorizontalIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterActiveAll")}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterActiveOnly")}</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterInactiveOnly")}</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={t("searchBannersPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Brand Organization Filter */}
          <NativeSelect
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-9"
          >
            <NativeSelectOption value="all">{t("filterBrandAll")}</NativeSelectOption>
            {organizations.map((org) => (
              <NativeSelectOption key={org.id} value={org.id}>
                {org.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          {/* Status Filter */}
          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="h-9"
          >
            <NativeSelectOption value="all">{t("filterActiveAll")}</NativeSelectOption>
            <NativeSelectOption value="active">{t("filterActiveOnly")}</NativeSelectOption>
            <NativeSelectOption value="inactive">{t("filterInactiveOnly")}</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      {/* Banner Table */}
      {filteredBanners.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("noBannersFound")}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Preview</TableHead>
                <TableHead className="w-[150px]">Brand</TableHead>
                <TableHead className="min-w-[200px]">Alt Text & Path</TableHead>
                <TableHead className="min-w-[160px]">Target Link</TableHead>
                <TableHead className="w-[90px] text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowUpDownIcon className="size-3 text-muted-foreground" />
                    <span>Order</span>
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.map((banner) => {
                const isToggling = togglingId === banner.id;
                const imageUrl = publicAssetUrl(banner.image_path);
                const orgMatch = organizations.find((o) => o.id === banner.organization_id);
                const brandConfig = BRANDS.find((b) => b.slug === orgMatch?.slug || b.slug === banner.organization?.slug);

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

                    {/* Brand */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {brandConfig && (
                          <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white border">
                            <Image
                              src={brandConfig.logoSrc}
                              alt=""
                              width={16}
                              height={16}
                              className="size-4 object-contain"
                            />
                          </div>
                        )}
                        <span className="font-medium text-xs truncate max-w-[120px]">
                          {brandConfig?.name || banner.organization?.name || orgMatch?.name || "Brand"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Alt Text & Path */}
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm line-clamp-2 text-foreground">
                          {banner.alt_text}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono truncate mt-0.5 max-w-[240px]">
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
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-[180px] truncate"
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
                          onCheckedChange={(checked) => handleToggleActive(banner, checked)}
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
                          onClick={() => handleOpenEdit(banner)}
                          title={t("editBanner")}
                        >
                          <PencilIcon className="size-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingBanner(banner)}
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
      )}

      {/* Modals */}
      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orgSlug={activeDialogOrgSlug}
        organizationId={activeDialogOrgId}
        banner={editingBanner}
        onSuccess={refreshBanners}
      />

      <DeleteBannerDialog
        banner={deletingBanner}
        orgSlug={activeDialogOrgSlug}
        onOpenChange={(open) => {
          if (!open) setDeletingBanner(null);
        }}
        onSuccess={refreshBanners}
      />
    </div>
  );
}
