"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
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
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Loader2Icon,
  AlertCircleIcon,
  UploadCloudIcon,
  CheckCircle2Icon,
  ImageIcon,
} from "lucide-react";
import type { AdminBannerItem } from "@/lib/queries/banners";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  organizationId: string;
  banner?: AdminBannerItem | null;
  onSuccess: () => void;
}

interface BannerFormProps {
  orgSlug: string;
  organizationId: string;
  banner?: AdminBannerItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function BannerForm({
  orgSlug,
  organizationId,
  banner,
  onSuccess,
  onCancel,
}: BannerFormProps) {
  const t = useTranslations("admin");
  const isEditing = Boolean(banner);

  const [altText, setAltText] = useState(banner?.alt_text ?? "");
  const [targetUrl, setTargetUrl] = useState(banner?.target_url ?? "");
  const [sortOrder, setSortOrder] = useState<number>(banner?.sort_order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(banner?.is_active ?? true);

  // Image upload state
  const [imagePath, setImagePath] = useState<string>(banner?.image_path ?? "");
  const [previewUrl, setPreviewUrl] = useState<string>(
    banner?.image_path ? publicAssetUrl(banner.image_path) : ""
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setFormError(null);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5 MB.");
      return;
    }

    // Validate type
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PNG, JPEG, and WebP images are allowed.");
      return;
    }

    setUploadingImage(true);

    try {
      // 1. Request presigned upload URL
      const res = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          kind: "banners",
          ownerId: banner?.id ?? crypto.randomUUID(),
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to prepare image upload.");
      }

      const { signedUrl, path } = body.data;

      // 2. Direct upload to Supabase storage (org-drafts)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image file to storage.");
      }

      // Success
      setImagePath(path);
      const localBlobUrl = URL.createObjectURL(file);
      setPreviewUrl(localBlobUrl);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error uploading file.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    if (!imagePath) {
      setFormError("A banner image is required.");
      return;
    }

    if (!altText.trim()) {
      setFormError("Alt text is required for accessibility.");
      return;
    }

    const trimmedUrl = targetUrl.trim();
    if (trimmedUrl && !trimmedUrl.startsWith("/") && !trimmedUrl.startsWith("https://")) {
      setFormError("Link must be a relative path (starting with /) or an https:// URL.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        imagePath,
        altText: altText.trim(),
        targetUrl: trimmedUrl || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      const url = isEditing
        ? `/api/v1/admin/${orgSlug}/banners/${banner!.id}`
        : `/api/v1/admin/${orgSlug}/banners`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to save banner.");
      }

      setSuccessNotice(isEditing ? "Banner updated successfully!" : "Banner created successfully!");
      onSuccess();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <FieldGroup className="gap-3">
          {/* Image Upload Area */}
          <Field>
            <FieldLabel>{t("bannerImage")}</FieldLabel>
            <div className="flex flex-col gap-2">
              {previewUrl ? (
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border bg-muted/30">
                  <Image
                    src={previewUrl}
                    alt={altText || "Banner preview"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || submitting}
                      className="gap-1.5"
                    >
                      <UploadCloudIcon className="size-4" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors hover:bg-muted/50"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin text-primary" />
                      <span className="text-xs">Uploading draft image...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <ImageIcon className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {t("bannerDropOrBrowse")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {t("bannerUploadHelp")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="size-3" />
                  {uploadError}
                </p>
              )}
            </div>
          </Field>

          {/* Alt Text */}
          <Field>
            <FieldLabel htmlFor="banner-alt">{t("bannerAltText")}</FieldLabel>
            <Input
              id="banner-alt"
              type="text"
              required
              placeholder={t("bannerAltPlaceholder")}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={submitting}
            />
            <FieldDescription className="text-[11px]">
              Screen readers read this to visually impaired shoppers. Keep it concise.
            </FieldDescription>
          </Field>

          {/* Target URL */}
          <Field>
            <FieldLabel htmlFor="banner-url">{t("bannerTargetUrl")}</FieldLabel>
            <Input
              id="banner-url"
              type="text"
              placeholder={t("bannerTargetUrlPlaceholder")}
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={submitting}
            />
          </Field>

          {/* Sort Order & Active Switch */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <Field>
              <FieldLabel htmlFor="banner-sort">{t("bannerSortOrder")}</FieldLabel>
              <Input
                id="banner-sort"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                disabled={submitting}
              />
            </Field>

            <Field className="flex flex-col gap-1.5 pt-1">
              <FieldLabel>{t("bannerStatus")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={submitting}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {isActive ? t("bannerActive") : t("bannerInactive")}
                </span>
              </div>
            </Field>
          </div>
        </FieldGroup>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || uploadingImage}>
            {submitting && <Loader2Icon className="size-4 animate-spin" />}
            {isEditing
              ? submitting
                ? t("bannerUpdating")
                : t("bannerUpdate")
              : submitting
              ? t("bannerSaving")
              : t("bannerSave")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function BannerDialog({
  open,
  onOpenChange,
  orgSlug,
  organizationId,
  banner = null,
  onSuccess,
}: BannerDialogProps) {
  const t = useTranslations("admin");

  const handleSuccess = () => {
    onSuccess();
    setTimeout(() => {
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {banner ? t("editBanner") : t("addBanner")}
          </DialogTitle>
          <DialogDescription>
            {banner
              ? "Update banner details, image, display order or link."
              : "Upload an image banner for the storefront hero carousel."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BannerForm
            key={banner?.id || "new"}
            orgSlug={orgSlug}
            organizationId={organizationId}
            banner={banner}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
