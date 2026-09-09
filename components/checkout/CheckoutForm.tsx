"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Smartphone, Truck } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useToast } from "@/providers/StoreProvider";
import { Field, TextInput, TextArea, Badge } from "@/components/ui/core";
import { LS_KEYS, cn, orderRef, readLS, writeLS } from "@/lib/utils";
import { districts } from "@/data/content";
import type { CheckoutInfo, Order } from "@/lib/types";

const initialInfo: CheckoutInfo = {
  fullName: "",
  mobile: "",
  email: "",
  district: "",
  upazila: "",
  area: "",
  address: "",
  notes: "",
};

export function CheckoutForm() {
  const { t, pick, language } = useLanguage();
  const { lines, subtotal, clear } = useCart();
  const { push } = useToast();
  const router = useRouter();

  const [info, setInfo] = useState<CheckoutInfo>(initialInfo);
  const [zone, setZone] = useState<"inside" | "outside">("inside");
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutInfo, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof CheckoutInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof CheckoutInfo, string>> = {};
    if (!info.fullName.trim()) next.fullName = t("validation.required");
    else if (info.fullName.trim().length < 3) next.fullName = t("validation.minLength", { count: 3 });
    const mobileDigits = info.mobile.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    if (!mobileDigits) next.mobile = t("validation.required");
    else if (!/^01[3-9]\d{8}$/.test(mobileDigits)) next.mobile = t("validation.invalidMobile");
    if (info.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim()))
      next.email = t("validation.invalidEmail");
    if (!info.district.trim()) next.district = t("validation.required");
    if (!info.upazila.trim()) next.upazila = t("validation.required");
    if (!info.area.trim()) next.area = t("validation.required");
    if (!info.address.trim()) next.address = t("validation.required");
    else if (info.address.trim().length < 10) next.address = t("validation.minLength", { count: 10 });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      push(t("cart.empty"), "error");
      return;
    }
    if (!validate()) {
      push(t("toasts.formError"), "error");
      return;
    }
    setSubmitting(true);

    const order: Order = {
      ref: orderRef(),
      createdAt: new Date().toISOString(),
      items: lines.map((line) => ({
        id: line.product.id,
        slug: line.product.slug,
        name: line.product.name,
        unit: line.product.unit,
        price: line.product.price,
        qty: line.qty,
      })),
      subtotal,
      deliveryZone: zone,
      deliveryFee: null,
      total: subtotal,
      customer: info,
      payment: "cod",
      demo: true,
    };

    const existing = readLS<Order[]>(LS_KEYS.orders, []);
    writeLS(LS_KEYS.orders, [order, ...existing].slice(0, 20));
    writeLS(LS_KEYS.lastOrder, order);

    window.setTimeout(() => {
      clear();
      push(t("toasts.checkoutSuccess"));
      router.push("/order-success");
    }, 500);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <section className="rounded-2xl border border-[#E2E8EA] bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-[#16339B]">{t("checkout.contactHeading")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("checkout.fullName")} htmlFor="co-name" required error={errors.fullName}>
            <TextInput
              id="co-name"
              value={info.fullName}
              invalid={Boolean(errors.fullName)}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label={t("checkout.mobile")} htmlFor="co-mobile" required error={errors.mobile}>
            <TextInput
              id="co-mobile"
              value={info.mobile}
              invalid={Boolean(errors.mobile)}
              onChange={(e) => set("mobile", e.target.value)}
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
            />
          </Field>
          <Field label={t("checkout.email")} htmlFor="co-email" error={errors.email} optionalLabel={t("checkout.notesOptional")}>
            <TextInput
              id="co-email"
              type="email"
              value={info.email}
              invalid={Boolean(errors.email)}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label={t("checkout.district")} htmlFor="co-district" required error={errors.district}>
            <TextInput
              id="co-district"
              list="orveen-districts"
              value={info.district}
              invalid={Boolean(errors.district)}
              onChange={(e) => set("district", e.target.value)}
            />
            <datalist id="orveen-districts">
              {districts.map((d) => (
                <option key={d.en} value={pick(d)} />
              ))}
            </datalist>
          </Field>
          <Field label={t("checkout.upazila")} htmlFor="co-upazila" required error={errors.upazila}>
            <TextInput
              id="co-upazila"
              value={info.upazila}
              invalid={Boolean(errors.upazila)}
              onChange={(e) => set("upazila", e.target.value)}
            />
          </Field>
          <Field label={t("checkout.area")} htmlFor="co-area" required error={errors.area}>
            <TextInput
              id="co-area"
              value={info.area}
              invalid={Boolean(errors.area)}
              onChange={(e) => set("area", e.target.value)}
            />
          </Field>
          <Field
            label={t("checkout.address")}
            htmlFor="co-address"
            required
            error={errors.address}
            className="sm:col-span-2"
          >
            <TextArea
              id="co-address"
              value={info.address}
              invalid={Boolean(errors.address)}
              onChange={(e) => set("address", e.target.value)}
              autoComplete="street-address"
            />
          </Field>
          <Field
            label={t("checkout.notes")}
            htmlFor="co-notes"
            optionalLabel={t("checkout.notesOptional")}
            className="sm:col-span-2"
          >
            <TextArea id="co-notes" value={info.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8EA] bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-[#16339B]">{t("checkout.deliveryHeading")}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("checkout.deliveryHeading")}>
          {(["inside", "outside"] as const).map((z) => (
            <label
              key={z}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
                zone === z
                  ? "border-[#1D4ED8] bg-[#E8F0FE] ring-2 ring-[#1D4ED8]/15"
                  : "border-[#E2E8EA] hover:border-[#1D4ED8]/40",
              )}
            >
              <input
                type="radio"
                name="delivery-zone"
                checked={zone === z}
                onChange={() => setZone(z)}
                className="h-4 w-4 accent-[#1D4ED8]"
              />
              <Truck className="h-4 w-4 text-[#1D4ED8]" />
              <span className="text-[13.5px] font-semibold text-[#17242A]">
                {z === "inside" ? t("checkout.insideDhaka") : t("checkout.outsideDhaka")}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[#66777D]">{t("checkout.deliveryNote")}</p>
      </section>

      <section className="rounded-2xl border border-[#E2E8EA] bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-[#16339B]">{t("checkout.paymentHeading")}</h2>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1D4ED8] bg-[#E8F0FE] px-4 py-3 ring-2 ring-[#1D4ED8]/15">
            <input type="radio" name="payment" checked readOnly className="h-4 w-4 accent-[#1D4ED8]" />
            <Banknote className="h-4 w-4 text-[#1D4ED8]" />
            <span className="flex-1">
              <span className="block text-[13.5px] font-semibold text-[#17242A]">{t("checkout.cod")}</span>
              <span className="block text-[11.5px] text-[#66777D]">{t("checkout.codDesc")}</span>
            </span>
          </label>
          {[
            { icon: Smartphone, label: t("checkout.mfs") },
            { icon: CreditCard, label: t("checkout.online") },
          ].map((opt) => (
            <div
              key={opt.label}
              className="flex items-center gap-3 rounded-xl border border-dashed border-[#E2E8EA] bg-[#F5F8FE] px-4 py-3 opacity-70"
              aria-disabled="true"
            >
              <opt.icon className="h-4 w-4 text-[#66777D]" />
              <span className="flex-1 text-[13.5px] font-semibold text-[#66777D]">{opt.label}</span>
              <Badge tone="muted">{t("checkout.comingSoon")}</Badge>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting || lines.length === 0}
        className="w-full rounded-xl bg-[#2E9E44] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#1F7A33] disabled:cursor-not-allowed disabled:bg-[#E2E8EA] disabled:text-[#66777D]"
      >
        {submitting ? t("checkout.placing") : t("checkout.placeOrder")}
      </button>
      {language === "bn" ? null : null}
    </form>
  );
}
