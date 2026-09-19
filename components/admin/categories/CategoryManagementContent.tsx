"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { PlusIcon, SearchIcon, LayersIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryDialog } from "@/components/admin/categories/CategoryDialog";
import { DeleteCategoryDialog } from "@/components/admin/categories/DeleteCategoryDialog";
import type { AdminCategoryItem } from "@/lib/queries/categories";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface CategoryManagementContentProps {
  initialCategories: AdminCategoryItem[];
  orgSlug: string;
}

const emptySubscribe = () => () => {};

export function CategoryManagementContent({
  initialCategories,
  orgSlug,
}: CategoryManagementContentProps) {
  const t = useTranslations("admin");
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [categories, setCategories] = useState<AdminCategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryItem | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: AdminCategoryItem) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (category: AdminCategoryItem) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogSuccess = (saved: AdminCategoryItem) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev].sort((a, b) => a.sort_order - b.sort_order);
    });
    showFeedback("success", t("categorySave"));
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== deletedId));
    showFeedback("success", t("deleteCategory"));
  };

  const handleToggleActive = async (category: AdminCategoryItem, newActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActive }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update category status");
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: newActive } : c))
      );
      showFeedback(
        "success",
        newActive ? t("bannerActive") : t("bannerInactive")
      );
    } catch (err: unknown) {
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Failed to update category status"
      );
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (statusFilter === "active") return cat.is_active;
        if (statusFilter === "inactive") return !cat.is_active;
        return true;
      })
      .filter((cat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [categories, statusFilter, searchQuery]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const totalReferencedItems = categories.reduce((sum, c) => sum + (c.item_count || 0), 0);

  return (
    <div className="space-y-6" data-hydrated={isHydrated}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("categoriesHeading")}</h1>
          <p className="text-sm text-muted-foreground">{t("categoriesSubtitle")}</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2 self-start sm:self-auto">
          <PlusIcon className="h-4 w-4" />
          {t("addCategory")}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterActiveAllCategories")}
            </CardTitle>
            <LayersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("filterActiveOnlyCategories")}
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeCategories}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("categoryItemCount")}
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono">Σ</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferencedItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchCategoriesPlaceholder")}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className="capitalize"
            >
              {filter === "all"
                ? t("filterActiveAllCategories")
                : filter === "active"
                ? t("filterActiveOnlyCategories")
                : t("filterInactiveOnlyCategories")}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isHydrated && (
        <CategoryTable
          categories={filteredCategories}
          orgSlug={orgSlug}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Create / Edit Dialog */}
      <CategoryDialog
        category={editingCategory}
        orgSlug={orgSlug}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        category={deletingCategory}
        orgSlug={orgSlug}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
