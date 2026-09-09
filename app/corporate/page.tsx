"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, CheckCircle2, Handshake, Headphones, Scale, Tag, Truck } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { marketingImages } from "@/lib/images";
import { corporateAudiences, corporateBenefits } from "@/data/content";
import { Breadcrumb, Badge, Field, TextArea, TextInput } from "@/components/ui/core";
import type { LucideIcon } from "lucide-react";

const benefitIcons: Record<string, LucideIcon> = {
  truck: Truck,
  tag: Tag,
  scale: Scale,
  headphones: Headphones,
  handshake: Handshake,
};

interface CorpForm {
  company: string;
  contactPerson: string;
  mobile: string;
  email: string;
  location: string;
  products: string;
  quantity: string;
  message: string;
}

const initial: CorpForm = {
  company: "",
  contactPerson: "",
  mobile: "",
  email: "",
  location: "",
  products: "",
  quantity: "",
  message: "",
};

export default function CorporatePage() {
  const { t, pick } = useLanguage();
  const { push } = useToast();
  usePageTitle(t("nav.corporate"), "Corporate Supply");

  const [form, setForm] = useState<CorpForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof CorpForm, string>>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof CorpForm>(key: K, value: CorpForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof CorpForm, string>> = {};
    if (!form.company.trim()) next.company = t("validation.required");
    if (!form.contactPerson.trim()) next.contactPerson = t("validation.required");
    const mobile = form.mobile.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    if (!mobile) next.mobile = t("validation.required");
    else if (!/^01[3-9]\d{8}$/.test(mobile)) next.mobile = t("validation.invalidMobile");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = t("validation.invalidEmail");
    if (!form.location.trim()) next.location = t("validation.required");
    if (!form.products.trim()) next.products = t("validation.required");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      push(t("toasts.formError"), "error");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      push(t("corporate.successTitle"));
    }, 500);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("nav.corporate") }]} />

      <section className="mt-4 grid gap-8 rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Badge tone="green">{t("corporate.kicker")}</Badge>
          <h1 className="mt-3 text-[24px] font-black leading-snug text-[#16339B] sm:text-[32px]">
            {t("corporate.heading")}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#66777D]">{t("corporate.sub")}</p>

          <h2 className="mt-6 text-[15px] font-bold text-[#16339B]">{t("corporate.audiencesHeading")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {corporateAudiences.map((aud) => (
              <li
                key={aud.en}
                className="flex items-center gap-2 rounded-xl border border-[#E2E8EA] bg-[#F5F8FE] px-3 py-2 text-[12.5px] font-semibold text-[#17242A]"
              >
                <Building2 className="h-4 w-4 shrink-0 text-[#1D4ED8]" />
                {pick(aud)}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-[#E2E8EA]">
          <Image
            src={marketingImages.warehouse.src}
            alt="Warehouse ready for institutional supply"
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 45vw, 100vw"
            placeholder="blur"
            blurDataURL={marketingImages.warehouse.blurDataURL}
            className="object-cover"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-bold text-[#16339B] sm:text-[24px]">
          {t("corporate.benefitsHeading")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {corporateBenefits.map((benefit) => {
            const Icon = benefitIcons[benefit.icon] ?? Truck;
            return (
              <div
                key={benefit.title.en}
                className="rounded-2xl border border-[#E2E8EA] bg-white p-4 transition hover:border-[#1D4ED8]/30 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[13.5px] font-bold text-[#16339B]">{pick(benefit.title)}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#66777D]">{pick(benefit.desc)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[#E2E8EA] bg-white p-5 sm:p-8">
        <h2 className="text-[20px] font-bold text-[#16339B]">{t("corporate.formHeading")}</h2>
        <p className="mt-1 text-[13px] text-[#66777D]">{t("corporate.formSub")}</p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#16A34A]" />
            <h3 className="mt-3 text-[18px] font-bold text-[#14532D]">{t("corporate.successTitle")}</h3>
            <p className="mx-auto mt-2 max-w-lg text-[13.5px] text-[#66777D]">{t("corporate.successBody")}</p>
            <button
              type="button"
              onClick={() => {
                setForm(initial);
                setDone(false);
              }}
              className="mt-5 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#16339B]"
            >
              {t("corporate.another")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t("corporate.company")} htmlFor="c-company" required error={errors.company}>
              <TextInput id="c-company" value={form.company} invalid={!!errors.company} onChange={(e) => set("company", e.target.value)} />
            </Field>
            <Field label={t("corporate.contactPerson")} htmlFor="c-person" required error={errors.contactPerson}>
              <TextInput id="c-person" value={form.contactPerson} invalid={!!errors.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
            </Field>
            <Field label={t("corporate.mobile")} htmlFor="c-mobile" required error={errors.mobile}>
              <TextInput id="c-mobile" inputMode="tel" placeholder="01XXXXXXXXX" value={form.mobile} invalid={!!errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </Field>
            <Field label={t("corporate.email")} htmlFor="c-email" error={errors.email} optionalLabel={t("checkout.notesOptional")}>
              <TextInput id="c-email" type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label={t("corporate.location")} htmlFor="c-location" required error={errors.location}>
              <TextInput id="c-location" value={form.location} invalid={!!errors.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label={t("corporate.quantity")} htmlFor="c-qty" optionalLabel={t("checkout.notesOptional")}>
              <TextInput id="c-qty" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </Field>
            <Field label={t("corporate.products")} htmlFor="c-products" required error={errors.products} className="sm:col-span-2">
              <TextArea id="c-products" className="min-h-[80px]" value={form.products} invalid={!!errors.products} onChange={(e) => set("products", e.target.value)} />
            </Field>
            <Field label={t("corporate.message")} htmlFor="c-message" optionalLabel={t("checkout.notesOptional")} className="sm:col-span-2">
              <TextArea id="c-message" value={form.message} onChange={(e) => set("message", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#2E9E44] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-[#1F7A33] disabled:bg-[#E2E8EA] disabled:text-[#66777D] sm:w-auto"
              >
                {submitting ? t("corporate.submitting") : t("corporate.submit")}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
