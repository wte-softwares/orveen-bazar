"use client";

import { useState } from "react";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AdminCategoryItem } from "@/lib/queries/categories";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

import { slugify } from "@/lib/utils";

interface CategoryDialogProps {
  category: AdminCategoryItem | null;
  orgSlug: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (savedCategory: AdminCategoryItem) => void;
}

interface CategoryFormProps {
  category: AdminCategoryItem | null;
  orgSlug: string;
  onSuccess: (savedCategory: AdminCategoryItem) => void;
  onCancel: () => void;
}

function CategoryForm({ category, orgSlug, onSuccess, onCancel }: CategoryFormProps) {
  const t = useTranslations("admin");
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [sortOrder, setSortOrder] = useState<number>(category?.sort_order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(category?.is_active ?? true);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(category));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited && !isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage(t("categoryNamePlaceholder"));
      return;
    }

    if (!trimmedSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      setErrorMessage(t("categorySlugHelp"));
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/v1/admin/${orgSlug}/categories/${category!.id}`
        : `/api/v1/admin/${orgSlug}/categories`;
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        name: trimmedName,
        slug: trimmedSlug,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409 || json.error?.code === "conflict") {
          throw new Error("A category with this slug already exists for this brand.");
        }
        throw new Error(json.error?.message || json.error || "Failed to save category.");
      }

      const itemData = json.data || json;

      const saved: AdminCategoryItem = {
        id: itemData.id || (category ? category.id : ""),
        organization_id: itemData.organization_id || (category ? category.organization_id : ""),
        name: itemData.name ?? trimmedName,
        slug: itemData.slug ?? trimmedSlug,
        sort_order: itemData.sort_order ?? (Number(sortOrder) || 0),
        is_active: itemData.is_active ?? isActive,
        created_at: itemData.created_at || (category ? category.created_at : new Date().toISOString()),
        updated_at: itemData.updated_at || (category ? category.updated_at : new Date().toISOString()),
        item_count: category ? category.item_count : 0,
      };

      onSuccess(saved);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Name */}
        <div className="grid gap-1.5">
          <Label htmlFor="category-name">{t("categoryName")} *</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t("categoryNamePlaceholder")}
            required
          />
        </div>

        {/* Slug */}
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="category-slug">{t("categorySlug")} *</Label>
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(name));
                  setSlugManuallyEdited(false);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <SparklesIcon className="h-3 w-3" />
                Auto-generate
              </button>
            )}
          </div>
          <Input
            id="category-slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder={t("categorySlugPlaceholder")}
            required
          />
          <p className="text-xs text-muted-foreground">{t("categorySlugHelp")}</p>
        </div>

        {/* Sort order & Active status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="category-sort-order">{t("categorySortOrder")}</Label>
            <Input
              id="category-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="flex flex-col justify-end pb-1">
            <div className="flex items-center gap-2">
              <Switch
                id="category-is-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(typeof checked === "boolean" ? checked : !isActive)}
              />
              <Label htmlFor="category-is-active" className="cursor-pointer">
                {t("categoryStatus")}
              </Label>
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t("categoryUpdate") : t("categorySave")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryDialog({
  category,
  orgSlug,
  isOpen,
  onOpenChange,
  onSuccess,
}: CategoryDialogProps) {
  const t = useTranslations("admin");
  const isEditing = Boolean(category);

  const handleFormSuccess = (savedCategory: AdminCategoryItem) => {
    onSuccess(savedCategory);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editCategory") : t("addCategory")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("categoriesSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <CategoryForm
            key={category?.id || "new"}
            category={category}
            orgSlug={orgSlug}
            onSuccess={handleFormSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
