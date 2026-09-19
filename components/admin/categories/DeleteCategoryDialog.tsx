"use client";

import { useState } from "react";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminCategoryItem } from "@/lib/queries/categories";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface DeleteCategoryDialogProps {
  category: AdminCategoryItem | null;
  orgSlug: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedId: string) => void;
}

export function DeleteCategoryDialog({
  category,
  orgSlug,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("admin");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!category) return null;

  const hasItems = category.item_count > 0;

  const handleDelete = async () => {
    if (hasItems) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 409 || errorData.error === "category_in_use") {
          throw new Error(
            t("confirmDeleteCategoryInUse").replace("{count}", String(category.item_count))
          );
        }
        throw new Error(errorData.error || "Failed to delete category.");
      }

      onSuccess(category.id);
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                hasItems
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("confirmDeleteCategoryTitle")}</DialogTitle>
              <DialogDescription className="text-xs">
                {category.name} ({category.slug})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          {hasItems ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              <p className="font-medium">
                {t("confirmDeleteCategoryInUse")}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("confirmDeleteCategoryDesc")}</p>
          )}

          {errorMessage && (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || hasItems}
          >
            {isDeleting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {t("deleteCategory")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
