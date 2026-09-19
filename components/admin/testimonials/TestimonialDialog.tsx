"use client";

import { useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Loader2Icon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import type { AdminTestimonialItem } from "@/lib/queries/testimonials";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const PRESET_AVATARS = [
  "/testimonials/rakib-ahmed.png",
  "/testimonials/nusrat-jahan.png",
  "/testimonials/tanvir-hasan.png",
  "/testimonials/samia-rahman.png",
];

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: AdminTestimonialItem | null;
  onSuccess: () => void;
}

interface TestimonialFormProps {
  testimonial?: AdminTestimonialItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function TestimonialForm({ testimonial, onSuccess, onCancel }: TestimonialFormProps) {
  const t = useTranslations("admin");
  const isEditing = Boolean(testimonial);

  const [nameBn, setNameBn] = useState(testimonial?.name_bn ?? "");
  const [nameEn, setNameEn] = useState(testimonial?.name_en ?? "");
  const [cityBn, setCityBn] = useState(testimonial?.city_bn ?? "");
  const [cityEn, setCityEn] = useState(testimonial?.city_en ?? "");
  const [quoteBn, setQuoteBn] = useState(testimonial?.quote_bn ?? "");
  const [quoteEn, setQuoteEn] = useState(testimonial?.quote_en ?? "");
  const [avatarPath, setAvatarPath] = useState(
    testimonial?.avatar_path ?? PRESET_AVATARS[0]
  );
  const [sortOrder, setSortOrder] = useState<number>(testimonial?.sort_order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(testimonial?.is_active ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    if (!nameBn.trim() || !nameEn.trim()) {
      setFormError("Author name is required in both Bengali and English.");
      return;
    }

    if (!cityBn.trim() || !cityEn.trim()) {
      setFormError("City/Location is required in both Bengali and English.");
      return;
    }

    if (!quoteBn.trim() || !quoteEn.trim()) {
      setFormError("Testimonial quote is required in both Bengali and English.");
      return;
    }

    if (!avatarPath.trim()) {
      setFormError("Avatar path is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nameBn: nameBn.trim(),
        nameEn: nameEn.trim(),
        cityBn: cityBn.trim(),
        cityEn: cityEn.trim(),
        quoteBn: quoteBn.trim(),
        quoteEn: quoteEn.trim(),
        avatarPath: avatarPath.trim(),
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      const url = isEditing
        ? `/api/v1/admin/testimonials/${testimonial!.id}`
        : "/api/v1/admin/testimonials";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to save testimonial.");
      }

      setSuccessNotice(
        isEditing
          ? "Testimonial updated successfully!"
          : "Testimonial created successfully!"
      );
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
          {/* Avatar Selection */}
          <Field>
            <FieldLabel>{t("testimonialAvatarPath")}</FieldLabel>
            <div className="flex items-center gap-3 py-1">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = avatarPath === avatar;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setAvatarPath(avatar)}
                    className={`relative size-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={avatar}
                      alt="Avatar preset"
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
            <Input
              type="text"
              value={avatarPath}
              onChange={(e) => setAvatarPath(e.target.value)}
              placeholder="/testimonials/custom.png"
              className="mt-1.5 font-mono text-xs"
              required
              disabled={submitting}
            />
            <FieldDescription className="text-[11px]">
              Select a preset portrait or specify a public asset path.
            </FieldDescription>
          </Field>

          {/* Name BN & EN */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="name-bn">{t("testimonialNameBn")}</FieldLabel>
              <Input
                id="name-bn"
                type="text"
                required
                placeholder="যেমন: সাকিব আহমেদ"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                disabled={submitting}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="name-en">{t("testimonialNameEn")}</FieldLabel>
              <Input
                id="name-en"
                type="text"
                required
                placeholder="e.g. Sakib Ahmed"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          {/* City BN & EN */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="city-bn">{t("testimonialCityBn")}</FieldLabel>
              <Input
                id="city-bn"
                type="text"
                required
                placeholder="যেমন: ঢাকা"
                value={cityBn}
                onChange={(e) => setCityBn(e.target.value)}
                disabled={submitting}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="city-en">{t("testimonialCityEn")}</FieldLabel>
              <Input
                id="city-en"
                type="text"
                required
                placeholder="e.g. Dhaka"
                value={cityEn}
                onChange={(e) => setCityEn(e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          {/* Quote BN */}
          <Field>
            <FieldLabel htmlFor="quote-bn">{t("testimonialQuoteBn")}</FieldLabel>
            <Textarea
              id="quote-bn"
              required
              rows={2}
              placeholder="গ্রাহকের বাংলা রিভিউ বা মতামত..."
              value={quoteBn}
              onChange={(e) => setQuoteBn(e.target.value)}
              disabled={submitting}
            />
          </Field>

          {/* Quote EN */}
          <Field>
            <FieldLabel htmlFor="quote-en">{t("testimonialQuoteEn")}</FieldLabel>
            <Textarea
              id="quote-en"
              required
              rows={2}
              placeholder="Customer English review or quote..."
              value={quoteEn}
              onChange={(e) => setQuoteEn(e.target.value)}
              disabled={submitting}
            />
          </Field>

          {/* Sort Order & Active Switch */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <Field>
              <FieldLabel htmlFor="test-sort">{t("testimonialSortOrder")}</FieldLabel>
              <Input
                id="test-sort"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                disabled={submitting}
              />
            </Field>

            <Field className="flex flex-col gap-1.5 pt-1">
              <FieldLabel>{t("testimonialStatus")}</FieldLabel>
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
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2Icon className="size-4 animate-spin" />}
            {isEditing
              ? submitting
                ? t("testimonialUpdating")
                : t("testimonialUpdate")
              : submitting
              ? t("testimonialSaving")
              : t("testimonialSave")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TestimonialDialog({
  open,
  onOpenChange,
  testimonial = null,
  onSuccess,
}: TestimonialDialogProps) {
  const t = useTranslations("admin");

  const handleSuccess = () => {
    onSuccess();
    setTimeout(() => {
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {testimonial ? t("editTestimonial") : t("addTestimonial")}
          </DialogTitle>
          <DialogDescription>
            {testimonial
              ? "Update customer testimonial details, quote, or display order."
              : "Add a new verified customer review for the storefront and auth pages."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TestimonialForm
            key={testimonial?.id || "new"}
            testimonial={testimonial}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
