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
import type { AdminTestimonialItem } from "@/lib/queries/testimonials";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface DeleteTestimonialDialogProps {
  testimonial: AdminTestimonialItem | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteTestimonialDialog({
  testimonial,
  onOpenChange,
  onSuccess,
}: DeleteTestimonialDialogProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!testimonial) return null;

  async function handleConfirm() {
    if (!testimonial) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/testimonials/${testimonial.id}`, {
        method: "DELETE",
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to deactivate testimonial.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate testimonial.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(testimonial)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive font-semibold">
            {t("confirmDeactivateTestimonialTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("confirmDeactivateTestimonialDesc")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{testimonial.name_bn} ({testimonial.name_en})</p>
          <p className="line-clamp-2 mt-0.5 italic">&ldquo;{testimonial.quote_bn}&rdquo;</p>
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
