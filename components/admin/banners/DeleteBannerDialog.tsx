"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import type { AdminBannerItem } from "@/lib/queries/banners";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface DeleteBannerDialogProps {
  banner: AdminBannerItem | null;
  orgSlug: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteBannerDialog({
  banner,
  orgSlug,
  onOpenChange,
  onSuccess,
}: DeleteBannerDialogProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!banner) return null;

  async function handleConfirm() {
    if (!banner) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/${orgSlug}/banners/${banner.id}`, {
        method: "DELETE",
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to deactivate banner.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate banner.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(banner)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive font-semibold">
            {t("confirmDeactivateBannerTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("confirmDeactivateBannerDesc")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{banner.alt_text}</p>
          {banner.target_url && <p className="truncate mt-0.5">{banner.target_url}</p>}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {t("confirmDeactivate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
