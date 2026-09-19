"use client";

import { useState } from "react";
import { ArchiveIcon, Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminCatalogItemSummary } from "@/lib/queries/catalog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface ArchiveItemDialogProps {
  item: AdminCatalogItemSummary | null;
  orgSlug: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (archivedId: string) => void;
}

export function ArchiveItemDialog({
  item,
  orgSlug,
  isOpen,
  onOpenChange,
  onSuccess,
}: ArchiveItemDialogProps) {
  const t = useTranslations("admin");
  const [isArchiving, setIsArchiving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!item) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/items/${item.id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error?.message || json.error || "Failed to archive item.");
      }

      onSuccess(item.id);
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to archive item.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <ArchiveIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("confirmArchiveItemTitle")}</DialogTitle>
              <DialogDescription className="text-xs">
                {item.title} ({item.slug})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="text-muted-foreground">{t("confirmArchiveItemDesc")}</p>
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            {isArchiving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirmArchive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
