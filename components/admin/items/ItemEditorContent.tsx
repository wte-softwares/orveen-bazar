"use client";

import { useState, useRef, useSyncExternalStore, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  UploadCloudIcon,
  Trash2Icon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { slugify } from "@/lib/utils";
import type { AdminCatalogItemDetail } from "@/lib/queries/catalog";

interface ItemEditorContentProps {
  initialItem?: AdminCatalogItemDetail | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  orgSlug: string;
  organizationId: string;
  brandName: string;
}

interface ImageState {
  path: string;
  previewUrl: string;
  altText: string;
  sortOrder: number;
}

interface VariantState {
  label: string;
  value: string;
  sortOrder: number;
}

const emptySubscribe = () => () => {};

export function ItemEditorContent({
  initialItem,
  categories,
  orgSlug,
  organizationId,
  brandName,
}: ItemEditorContentProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isEditing = Boolean(initialItem);

  // Form states
  const [title, setTitle] = useState(initialItem?.title ?? "");
  const [slug, setSlug] = useState(initialItem?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialItem));
  const [categoryId, setCategoryId] = useState(initialItem?.category_id ?? (categories[0]?.id || ""));
  const [type, setType] = useState<"product" | "service">(initialItem?.type ?? "product");
  const [description, setDescription] = useState(initialItem?.description ?? "");
  const [price, setPrice] = useState<string>(
    initialItem?.price !== undefined ? String(initialItem.price) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialItem?.compare_at_price != null ? String(initialItem.compare_at_price) : ""
  );
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialItem?.status ?? "draft"
  );

  // Images state
  const [images, setImages] = useState<ImageState[]>(() => {
    if (!initialItem?.item_images) return [];
    return initialItem.item_images.map((img) => ({
      path: img.image_path,
      previewUrl: publicAssetUrl(img.image_path),
      altText: img.alt_text ?? "",
      sortOrder: img.sort_order,
    }));
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Variants state (Descriptive only: Size = 500ml, never SKU or stock)
  const [variants, setVariants] = useState<VariantState[]>(() => {
    if (!initialItem?.item_variants) return [];
    return initialItem.item_variants.map((v) => ({
      label: v.label,
      value: v.value,
      sortOrder: v.sort_order,
    }));
  });

  // Submission & feedback states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title (handles Bangla transliteration and unicode characters)
  const generateSlug = () => {
    const generated = slugify(title);
    setSlug(generated);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited && !isEditing) {
      setSlug(slugify(val));
    }
  };

  // Image upload handler
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError(null);

    if (images.length >= 10) {
      setImageUploadError("Maximum 10 images allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image must be smaller than 5 MB.");
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setImageUploadError("Only PNG, JPEG, and WebP images are allowed.");
      return;
    }

    setUploadingImage(true);

    try {
      // 1. Request presigned upload URL from /api/v1/uploads
      const res = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          kind: "items",
          ownerId: initialItem?.id ?? crypto.randomUUID(),
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        let errorMsg = body.error?.message || "Failed to prepare image upload.";
        if (body.error?.fields) {
          const fieldDetails = Object.entries(body.error.fields)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          errorMsg += ` (${fieldDetails})`;
        }
        throw new Error(errorMsg);
      }

      const { signedUrl, path } = body.data;

      // 2. Direct upload to Supabase storage (org-drafts)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image file to storage.");
      }

      // Success: add to gallery
      const localBlobUrl = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        {
          path,
          previewUrl: localBlobUrl,
          altText: title || file.name,
          sortOrder: prev.length,
        },
      ]);
    } catch (err: unknown) {
      setImageUploadError(err instanceof Error ? err.message : "Error uploading file.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) =>
      prev
        .filter((_, idx) => idx !== indexToRemove)
        .map((img, idx) => ({ ...img, sortOrder: idx }))
    );
  };

  const setCoverImage = (indexToCover: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(indexToCover, 1);
      copy.unshift(selected);
      return copy.map((img, idx) => ({ ...img, sortOrder: idx }));
    });
  };

  // Variant helpers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { label: "", value: "", sortOrder: prev.length },
    ]);
  };

  const updateVariant = (index: number, field: "label" | "value", val: string) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: val } : v))
    );
  };

  const removeVariant = (indexToRemove: number) => {
    setVariants((prev) =>
      prev
        .filter((_, idx) => idx !== indexToRemove)
        .map((v, idx) => ({ ...v, sortOrder: idx }))
    );
  };

  // Form submit handler
  async function handleSubmit(e: FormEvent, targetStatus?: "draft" | "published") {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const submissionStatus = targetStatus || status;

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError(isHydrated ? t("itemTitle") + " is required." : "Item title is required.");
      return;
    }

    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) {
      setFormError(isHydrated ? t("itemSlug") + " is required." : "URL slug is required.");
      return;
    }

    if (!categoryId) {
      setFormError(isHydrated ? t("selectCategory") : "Please select a category.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Valid price in BDT is required.");
      return;
    }

    let parsedCompareAt: number | null = null;
    if (compareAtPrice.trim() !== "") {
      parsedCompareAt = parseFloat(compareAtPrice);
      if (isNaN(parsedCompareAt) || parsedCompareAt < 0) {
        setFormError("Compare-at price must be a valid positive number.");
        return;
      }
      if (parsedCompareAt < parsedPrice) {
        setFormError("Compare-at price must be greater than or equal to current price.");
        return;
      }
    }

    // Filter non-empty variants
    const validVariants = variants
      .filter((v) => v.label.trim() && v.value.trim())
      .map((v, idx) => ({
        label: v.label.trim(),
        value: v.value.trim(),
        sortOrder: idx,
      }));

    const payload = {
      title: trimmedTitle,
      slug: trimmedSlug,
      type,
      categoryId,
      description: description.trim() || null,
      price: parsedPrice,
      compareAtPrice: parsedCompareAt,
      status: submissionStatus,
      images: images.map((img, idx) => ({
        path: img.path,
        altText: img.altText.trim() || trimmedTitle,
        sortOrder: idx,
      })),
      variants: validVariants,
    };

    setSubmitting(true);

    try {
      const url = isEditing
        ? `/api/v1/admin/${orgSlug}/items/${initialItem?.id}`
        : `/api/v1/admin/${orgSlug}/items`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        let errorMsg = body.error?.message || "Failed to save item.";
        if (body.error?.fields) {
          const fieldDetails = Object.entries(body.error.fields)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          errorMsg += ` (${fieldDetails})`;
        }
        throw new Error(errorMsg);
      }

      setSuccessMessage(
        isHydrated ? t("itemSavedSuccess") : "Item saved successfully!"
      );
      setStatus(submissionStatus);

      setTimeout(() => {
        router.push(`/admin/${orgSlug}/items`);
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link
              href={`/admin/${orgSlug}/items`}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{isHydrated ? t("itemsHeading") : "Catalog Items"}</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">
              {isEditing ? initialItem?.title : isHydrated ? t("addItem") : "Add Item"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing
              ? isHydrated
                ? t("editItem")
                : "Edit Item"
              : isHydrated
              ? t("addItem")
              : "Add Item"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/admin/${orgSlug}/items`} />}
            disabled={submitting}
          >
            Cancel
          </Button>
          {status !== "published" && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={submitting}
            >
              {submitting ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : null}
              {isHydrated ? t("saveDraft") : "Save as Draft"}
            </Button>
          )}
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, "published")}
            disabled={submitting}
            className="bg-primary text-primary-foreground"
          >
            {submitting ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : null}
            {isEditing && status === "published"
              ? isHydrated
                ? t("saveChanges")
                : "Save Changes"
              : isHydrated
              ? t("publishNow")
              : "Publish Now"}
          </Button>
        </div>
      </div>

      {/* Global Form Alerts */}
      {formError && (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircleIcon className="h-5 w-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
          <CheckCircle2Icon className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Information</CardTitle>
              <CardDescription>
                Title, permalink slug, category, item type, and description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="item-title">
                  {isHydrated ? t("itemTitle") : "Item Title"} *
                </FieldLabel>
                <Input
                  id="item-title"
                  placeholder={
                    isHydrated ? t("itemTitlePlaceholder") : "e.g. Pure Mustard Oil 1L"
                  }
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  disabled={submitting}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="item-slug">
                    {isHydrated ? t("itemSlug") : "URL Slug"} *
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary gap-1"
                    onClick={generateSlug}
                    disabled={submitting || !title.trim()}
                  >
                    <SparklesIcon className="h-3 w-3" />
                    Auto-generate
                  </Button>
                </div>
                <Input
                  id="item-slug"
                  placeholder={
                    isHydrated ? t("itemSlugPlaceholder") : "pure-mustard-oil-1l"
                  }
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  disabled={submitting}
                  required
                />
                <FieldDescription>
                  Permitted characters: lowercase letters, numbers, and hyphens.
                </FieldDescription>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="item-category">
                    {isHydrated ? t("itemCategory") : "Category"} *
                  </FieldLabel>
                  <select
                    id="item-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={submitting}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="" disabled>
                      {isHydrated ? t("selectCategory") : "Select a category"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel>{isHydrated ? t("itemType") : "Item Type"}</FieldLabel>
                  <div className="flex items-center gap-4 h-9">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="itemType"
                        value="product"
                        checked={type === "product"}
                        onChange={() => setType("product")}
                        disabled={submitting}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{isHydrated ? t("typeProduct") : "Product"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="itemType"
                        value="service"
                        checked={type === "service"}
                        onChange={() => setType("service")}
                        disabled={submitting}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{isHydrated ? t("typeService") : "Service"}</span>
                    </label>
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="item-desc">
                  {isHydrated ? t("itemDescription") : "Description"}
                </FieldLabel>
                <Textarea
                  id="item-desc"
                  rows={4}
                  placeholder={
                    isHydrated
                      ? t("itemDescriptionPlaceholder")
                      : "Detailed description of the product or service..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Pricing Display Fields Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHydrated ? t("itemPrice") : "Price (BDT)"}</CardTitle>
              <CardDescription>
                Plain display prices rendered on the storefront. No cart, discounts, or tax calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="item-price">
                    {isHydrated ? t("itemPrice") : "Price (BDT)"} *
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="item-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={submitting}
                      className="pl-7"
                      required
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="item-compare-price">
                    {isHydrated ? t("itemCompareAtPrice") : "Compare-at Price (Optional)"}
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="item-compare-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      disabled={submitting}
                      className="pl-7"
                    />
                  </div>
                  <FieldDescription>
                    {isHydrated ? t("itemCompareAtHelp") : "Must be greater than or equal to current price."}
                  </FieldDescription>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Descriptive Variants Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">
                  {isHydrated ? t("itemVariants") : "Descriptive Variants"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isHydrated
                    ? t("itemVariantsHelp")
                    : "Descriptive attributes only (e.g. Size = 500ml). Never stock or SKU."}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                disabled={submitting}
                className="gap-1 text-xs"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>{isHydrated ? t("addVariant") : "+ Add Variant"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No variants added. Click &quot;Add Variant&quot; to add specifications like size or pack.
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border"
                    >
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <Input
                          placeholder={isHydrated ? t("variantLabel") : "Label (e.g. Size)"}
                          value={v.label}
                          onChange={(e) => updateVariant(idx, "label", e.target.value)}
                          disabled={submitting}
                          className="h-8 text-sm"
                        />
                        <Input
                          placeholder={isHydrated ? t("variantValue") : "Value (e.g. 500ml)"}
                          value={v.value}
                          onChange={(e) => updateVariant(idx, "value", e.target.value)}
                          disabled={submitting}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(idx)}
                        disabled={submitting}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Gallery & Status */}
        <div className="space-y-6">
          {/* Status & Organization Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  variant={
                    status === "published"
                      ? "default"
                      : status === "archived"
                      ? "destructive"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {status}
                </Badge>
              </div>

              <Field>
                <FieldLabel htmlFor="item-status">Change Status</FieldLabel>
                <select
                  id="item-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published" | "archived")
                  }
                  disabled={submitting}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus:ring-ring"
                >
                  <option value="draft">
                    {isHydrated ? t("statusDraft") : "Draft"}
                  </option>
                  <option value="published">
                    {isHydrated ? t("statusPublished") : "Published"}
                  </option>
                  <option value="archived">
                    {isHydrated ? t("statusArchived") : "Archived"}
                  </option>
                </select>
                <FieldDescription>
                  Draft images are stored privately in org-drafts. Publishing promotes images to the public bucket.
                </FieldDescription>
              </Field>

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>Brand: <strong className="text-foreground">{brandName}</strong></p>
                <p className="mt-1">Organization Slug: <code className="bg-muted px-1 py-0.5 rounded">{orgSlug}</code></p>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isHydrated ? t("itemImages") : "Gallery Images"}
              </CardTitle>
              <CardDescription>
                {isHydrated
                  ? t("itemImagesHelp")
                  : "First image serves as cover. PNG, JPG, WebP up to 5MB."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUploadError && (
                <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {imageUploadError}
                </div>
              )}

              {/* Gallery Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.path}
                      className="group relative aspect-square rounded-lg border overflow-hidden bg-muted flex items-center justify-center"
                    >
                      <Image
                        src={img.previewUrl}
                        alt={img.altText || `Image ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {/* Cover Badge */}
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <Badge className="bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5">
                            {isHydrated ? t("itemCoverBadge") : "Cover"}
                          </Badge>
                        </div>
                      )}

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setCoverImage(idx)}
                            title="Make Cover Image"
                          >
                            Cover
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeImage(idx)}
                          title="Remove Image"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Trigger */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingImage || submitting || images.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed h-24 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || submitting || images.length >= 10}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs">Uploading to draft storage...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon className="h-6 w-6" />
                      <span className="text-xs">
                        {images.length >= 10
                          ? "Maximum images reached"
                          : "Upload Image (PNG, JPG, WebP)"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
