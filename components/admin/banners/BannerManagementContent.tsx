"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  GalleryHorizontalIcon,
  CheckCircle2Icon,
  ClockIcon,
  SearchIcon,
  PlusIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { AdminBannerItem } from "@/lib/queries/banners";
import { BannerTable } from "./BannerTable";
import { BannerDialog } from "./BannerDialog";
import { DeleteBannerDialog } from "./DeleteBannerDialog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const emptySubscribe = () => () => {};

interface BannerManagementContentProps {
  initialBanners: AdminBannerItem[];
  organizationId: string;
  orgSlug: string;
  brandName: string;
}

export function BannerManagementContent({
  initialBanners,
  organizationId,
  orgSlug,
  brandName,
}: BannerManagementContentProps) {
  const t = useTranslations("admin");
  const [banners, setBanners] = useState<AdminBannerItem[]>(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerItem | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBannerItem | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function refreshBanners() {
    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/banners`);
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
    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/banners/${banner.id}`, {
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

      return true;
    });
  }, [banners, searchQuery, statusFilter]);

  return (
    <div
      data-slot="banner-management"
      data-hydrated={mounted ? "true" : "false"}
      className="flex flex-1 flex-col gap-6"
    >
      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("bannersHeading")} — {brandName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("bannersSubtitle")}</p>
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
      <BannerTable
        banners={filteredBanners}
        orgSlug={orgSlug}
        onEdit={handleOpenEdit}
        onDelete={(banner) => setDeletingBanner(banner)}
        onToggleActive={handleToggleActive}
      />

      {/* Modals */}
      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orgSlug={orgSlug}
        organizationId={organizationId}
        banner={editingBanner}
        onSuccess={refreshBanners}
      />

      <DeleteBannerDialog
        banner={deletingBanner}
        orgSlug={orgSlug}
        onOpenChange={(open) => {
          if (!open) setDeletingBanner(null);
        }}
        onSuccess={refreshBanners}
      />
    </div>
  );
}
