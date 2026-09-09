"use client";

import { useState } from "react";
import { CheckCircle2, Factory, Globe, Mail, MapPin, MapPinned } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { company } from "@/data/company";
import { Breadcrumb, Field, TextArea, TextInput, WhatsAppIcon } from "@/components/ui/core";
import { whatsappLink } from "@/lib/utils";

interface ContactForm {
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
}

const initial: ContactForm = { name: "", mobile: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const { t, pick, language } = useLanguage();
  const { push } = useToast();
  usePageTitle(t("nav.contact"), "Contact");

  const [form, setForm] = useState<ContactForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim()) next.name = t("validation.required");
    const mobile = form.mobile.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    if (!mobile) next.mobile = t("validation.required");
    else if (!/^01[3-9]\d{8}$/.test(mobile)) next.mobile = t("validation.invalidMobile");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = t("validation.invalidEmail");
    if (!form.message.trim()) next.message = t("validation.required");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      push(t("toasts.formError"), "error");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      push(t("contact.successTitle"));
    }, 400);
  };

  const cards = [
    {
      icon: WhatsAppIcon,
      label: t("contact.whatsapp"),
      value: company.whatsappLocal,
      href: "https://wa.me/8801335189426",
    },
    { icon: Mail, label: t("contact.email"), value: company.email, href: `mailto:${company.email}` },
    { icon: Globe, label: t("contact.website"), value: company.website, href: "https://www.orveenbazzar.com" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("nav.contact") }]} />
      <h1 className="mt-3 text-[24px] font-black text-[#16339B] sm:text-[32px]">{t("contact.heading")}</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-[#66777D]">{t("contact.sub")}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            target={card.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4 transition hover:border-[#1D4ED8]/40 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
              <card.icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-[#66777D]">
                {card.label}
              </span>
              <span className="block truncate text-[13.5px] font-semibold text-[#17242A]">
                {card.value}
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
          <div>
            <p className="text-[12.5px] font-bold text-[#16339B]">{t("contact.businessLocation")}</p>
            <p className="mt-0.5 text-[13px] text-[#66777D]">{pick(company.businessAddress)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4">
          <Factory className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
          <div>
            <p className="text-[12.5px] font-bold text-[#16339B]">{t("contact.productionLocation")}</p>
            <p className="mt-0.5 text-[13px] text-[#66777D]">{pick(company.productionAddress)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-3xl border border-[#E2E8EA] bg-white p-5 sm:p-8">
          <h2 className="text-[19px] font-bold text-[#16339B]">{t("contact.formHeading")}</h2>
          <p className="mt-1 text-[13px] text-[#66777D]">{t("contact.formSub")}</p>

          {done ? (
            <div className="mt-6 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#16A34A]" />
              <h3 className="mt-3 text-[17px] font-bold text-[#14532D]">{t("contact.successTitle")}</h3>
              <p className="mt-2 text-[13.5px] text-[#66777D]">{t("contact.successBody")}</p>
              <button
                type="button"
                onClick={() => {
                  setForm(initial);
                  setDone(false);
                }}
                className="mt-4 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#16339B]"
              >
                {t("contact.submit")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("contact.name")} htmlFor="ct-name" required error={errors.name}>
                <TextInput id="ct-name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label={t("contact.mobile")} htmlFor="ct-mobile" required error={errors.mobile}>
                <TextInput id="ct-mobile" inputMode="tel" placeholder="01XXXXXXXXX" value={form.mobile} invalid={!!errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
              </Field>
              <Field label={t("contact.emailField")} htmlFor="ct-email" error={errors.email} optionalLabel={t("checkout.notesOptional")}>
                <TextInput id="ct-email" type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label={t("contact.subject")} htmlFor="ct-subject" optionalLabel={t("checkout.notesOptional")}>
                <TextInput id="ct-subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
              </Field>
              <Field label={t("contact.message")} htmlFor="ct-message" required error={errors.message} className="sm:col-span-2">
                <TextArea id="ct-message" value={form.message} invalid={!!errors.message} onChange={(e) => set("message", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#1D4ED8] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-[#16339B] disabled:bg-[#E2E8EA] disabled:text-[#66777D] sm:w-auto"
                >
                  {submitting ? t("contact.submitting") : t("contact.submit")}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-dashed border-[#E2E8EA] bg-white p-6 text-center">
            <MapPinned className="mx-auto h-8 w-8 text-[#1D4ED8]" />
            <h2 className="mt-2 text-[15px] font-bold text-[#16339B]">{t("contact.mapTitle")}</h2>
            <p className="mt-1 text-[12.5px] text-[#66777D]">{t("contact.mapNote")}</p>
          </div>
          <a
            href={whatsappLink(language === "bn" ? company.whatsappMessage.bn : company.whatsappMessage.en)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#2E9E44] px-5 py-3.5 text-[14px] font-bold text-white transition hover:bg-[#1F7A33]"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
            {t("contact.whatsappCta")}
          </a>
        </aside>
      </div>
    </div>
  );
}
