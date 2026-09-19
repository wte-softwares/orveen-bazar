"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
  PackageIcon,
  CheckCircle2Icon,
  FileEditIcon,
  ArchiveIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemTable } from "@/components/admin/items/ItemTable";
import { ArchiveItemDialog } from "@/components/admin/items/ArchiveItemDialog";
import type { AdminCatalogItemSummary } from "@/lib/queries/catalog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface ItemManagementContentProps {
  initialItems: AdminCatalogItemSummary[];
  categories: Array<{ id: string; name: string; slug: string }>;
  orgSlug: string;
  brandName: string;
}

const emptySubscribe = () => () => {};

export function ItemManagementContent({
  initialItems,
  categories,
  orgSlug,
  brandName,
}: ItemManagementContentProps) {
  const t = useTranslations("admin");
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [items, setItems] = useState<AdminCatalogItemSummary[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [archivingItem, setArchivingItem] = useState<AdminCatalogItemSummary | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenArchive = (item: AdminCatalogItemSummary) => {
    setArchivingItem(item);
    setIsArchiveDialogOpen(true);
  };

  const handleArchiveSuccess = (archivedId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === archivedId ? { ...it, status: "archived" } : it))
    );
    showFeedback("success", t("itemArchivedSuccess"));
  };

  // Metrics
  const totalCount = items.length;
  const publishedCount = items.filter((it) => it.status === "published").length;
  const draftCount = items.filter((it) => it.status === "draft").length;
  const archivedCount = items.filter((it) => it.status === "archived").length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category?.id !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
      }

      return true;
    });
  }, [items, statusFilter, typeFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6" data-hydrated={isHydrated}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("itemsHeading")} — {brandName}
          </h1>
          <p className="text-sm text-muted-foreground">{t("itemsSubtitle")}</p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/admin/${orgSlug}/items/new`} />}
          className="gap-2 self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          {t("addItem")}
        </Button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" && <CheckCircle2Icon className="h-4 w-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterStatusAll")}
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterStatusPublished")}
            </CardTitle>
            <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {publishedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterStatusDraft")}
            </CardTitle>
            <FileEditIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {draftCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterStatusArchived")}
            </CardTitle>
            <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{archivedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchItemsPlaceholder")}
            className="pl-9"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "published", "draft", "archived"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === "all"
                ? t("filterStatusAll")
                : status === "published"
                ? t("filterStatusPublished")
                : status === "draft"
                ? t("filterStatusDraft")
                : t("filterStatusArchived")}
            </Button>
          ))}
        </div>

        {/* Type filter & Category filter */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "product" | "service")}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">{t("filterTypeAll")}</option>
            <option value="product">{t("filterTypeProduct")}</option>
            <option value="service">{t("filterTypeService")}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">{t("filterCategoryAll")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isHydrated && (
        <ItemTable
          items={filteredItems}
          orgSlug={orgSlug}
          onArchive={handleOpenArchive}
        />
      )}

      {/* Archive Dialog */}
      <ArchiveItemDialog
        item={archivingItem}
        orgSlug={orgSlug}
        isOpen={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onSuccess={handleArchiveSuccess}
      />
    </div>
  );
}
