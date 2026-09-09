"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Building2, Store, Home, Monitor, MapPin } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { businessTypes, dealerLevels, districts, investmentRanges } from "@/data/content";
import { categories } from "@/data/categories";
import { Breadcrumb, Badge, Field, Select, TextArea, TextInput } from "@/components/ui/core";
import type { LucideIcon } from "lucide-react";

const levelIcons: Record<string, LucideIcon> = {
  globe: Globe,
  map: MapPin,
  store: Store,
  home: Home,
  monitor: Monitor,
  building: Building2,
};

interface DealerFormState {
  fullName: string;
  businessName: string;
  mobile: string;
  email: string;
  district: string;
  upazila: string;
  businessType: string;
  currentBusiness: string;
  cats: string[];
  investment: string;
  message: string;
}

const initial: DealerFormState = {
  fullName: "",
  businessName: "",
  mobile: "",
  email: "",
  district: "",
  upazila: "",
  businessType: "",
  currentBusiness: "",
  cats: [],
  investment: "",
  message: "",
};

export default function DealerPage() {
  const { t, pick } = useLanguage();
  const { push } = useToast();
  usePageTitle(t("nav.dealer"), "Dealer & Distributor");

  const [form, setForm] = useState<DealerFormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof DealerFormState, string>>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof DealerFormState>(key: K, value: DealerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof DealerFormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = t("validation.required");
    if (!form.businessName.trim()) next.businessName = t("validation.required");
    const mobile = form.mobile.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    if (!mobile) next.mobile = t("validation.required");
    else if (!/^01[3-9]\d{8}$/.test(mobile)) next.mobile = t("validation.invalidMobile");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = t("validation.invalidEmail");
    if (!form.district.trim()) next.district = t("validation.required");
    if (!form.upazila.trim()) next.upazila = t("validation.required");
    if (!form.businessType) next.businessType = t("validation.required");
    if (form.cats.length === 0) next.cats = t("validation.selectOne");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      push(t("toasts.formError"), "error");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      push(t("dealer.successTitle"));
    }, 500);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("nav.dealer") }]} />

      <section className="mt-4 rounded-3xl bg-[#1D4ED8] p-6 text-white sm:p-10">
        <Badge tone="green" className="bg-white/10 text-[#8ED060]">
          {t("dealer.kicker")}
        </Badge>
        <h1 className="mt-3 max-w-3xl text-[24px] font-black leading-snug sm:text-[32px]">
          {t("dealer.heading")}
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] text-white/80">{t("dealer.sub")}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-bold text-[#16339B] sm:text-[24px]">{t("dealer.modelHeading")}</h2>
        <p className="mt-1 text-[13px] text-[#66777D]">{t("dealer.modelSub")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dealerLevels.map((level, i) => {
            const Icon = levelIcons[level.icon] ?? Store;
            return (
              <div
                key={level.level.en + i}
                className="relative overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white p-5 transition hover:border-[#1D4ED8]/40 hover:shadow-md"
              >
                <span className="absolute right-4 top-4 text-[26px] font-black text-[#E2E8EA]">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[14.5px] font-bold text-[#16339B]">{pick(level.level)}</p>
                <p className="mt-0.5 text-[13px] text-[#66777D]">→ {pick(level.role)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[#E2E8EA] bg-white p-5 sm:p-8">
        <h2 className="text-[20px] font-bold text-[#16339B]">{t("dealer.formHeading")}</h2>
        <p className="mt-1 text-[13px] text-[#66777D]">{t("dealer.formSub")}</p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#16A34A]" />
            <h3 className="mt-3 text-[18px] font-bold text-[#14532D]">{t("dealer.successTitle")}</h3>
            <p className="mx-auto mt-2 max-w-lg text-[13.5px] leading-relaxed text-[#66777D]">
              {t("dealer.successBody")}
            </p>
            <button
              type="button"
              onClick={() => {
                setForm(initial);
                setDone(false);
              }}
              className="mt-5 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#16339B]"
            >
              {t("dealer.another")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t("dealer.fullName")} htmlFor="d-name" required error={errors.fullName}>
              <TextInput id="d-name" value={form.fullName} invalid={!!errors.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <Field label={t("dealer.businessName")} htmlFor="d-business" required error={errors.businessName}>
              <TextInput id="d-business" value={form.businessName} invalid={!!errors.businessName} onChange={(e) => set("businessName", e.target.value)} />
            </Field>
            <Field label={t("dealer.mobile")} htmlFor="d-mobile" required error={errors.mobile}>
              <TextInput id="d-mobile" inputMode="tel" placeholder="01XXXXXXXXX" value={form.mobile} invalid={!!errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </Field>
            <Field label={t("dealer.email")} htmlFor="d-email" error={errors.email} optionalLabel={t("checkout.notesOptional")}>
              <TextInput id="d-email" type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label={t("dealer.district")} htmlFor="d-district" required error={errors.district}>
              <Select id="d-district" value={form.district} onChange={(e) => set("district", e.target.value)}>
                <option value="">—</option>
                {districts.map((d) => (
                  <option key={d.en} value={pick(d)}>
                    {pick(d)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("dealer.upazila")} htmlFor="d-upazila" required error={errors.upazila}>
              <TextInput id="d-upazila" value={form.upazila} invalid={!!errors.upazila} onChange={(e) => set("upazila", e.target.value)} />
            </Field>
            <Field label={t("dealer.businessType")} htmlFor="d-type" required error={errors.businessType}>
              <Select id="d-type" value={form.businessType} onChange={(e) => set("businessType", e.target.value)}>
                <option value="">—</option>
                {businessTypes.map((b) => (
                  <option key={b.en} value={pick(b)}>
                    {pick(b)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("dealer.investment")} htmlFor="d-invest" optionalLabel={t("checkout.notesOptional")}>
              <Select id="d-invest" value={form.investment} onChange={(e) => set("investment", e.target.value)}>
                <option value="">—</option>
                {investmentRanges.map((r) => (
                  <option key={r.en} value={pick(r)}>
                    {pick(r)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("dealer.currentBusiness")} htmlFor="d-current" optionalLabel={t("checkout.notesOptional")} className="sm:col-span-2">
              <TextInput id="d-current" value={form.currentBusiness} onChange={(e) => set("currentBusiness", e.target.value)} />
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="mb-1.5 block text-[13px] font-semibold text-[#17242A]">
                {t("dealer.categories")} <span className="text-[#DC2626]">*</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => !c.comingSoon)
                  .map((cat) => {
                    const active = form.cats.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          set(
                            "cats",
                            active ? form.cats.filter((c) => c !== cat.slug) : [...form.cats, cat.slug],
                          )
                        }
                        className={
                          active
                            ? "rounded-full bg-[#1D4ED8] px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                            : "rounded-full border border-[#E2E8EA] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#17242A] transition hover:border-[#1D4ED8]/40 hover:bg-[#E8F0FE]"
                        }
                      >
                        {pick(cat.name)}
                      </button>
                    );
                  })}
              </div>
              {errors.cats ? (
                <p role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
                  {errors.cats}
                </p>
              ) : null}
            </fieldset>
            <Field label={t("dealer.message")} htmlFor="d-message" optionalLabel={t("checkout.notesOptional")} className="sm:col-span-2">
              <TextArea id="d-message" value={form.message} onChange={(e) => set("message", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#2E9E44] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-[#1F7A33] disabled:bg-[#E2E8EA] disabled:text-[#66777D] sm:w-auto"
              >
                {submitting ? t("dealer.submitting") : t("dealer.submit")}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
