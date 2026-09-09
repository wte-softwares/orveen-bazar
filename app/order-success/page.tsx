"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ReceiptText } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { Breadcrumb, EmptyState, WhatsAppIcon } from "@/components/ui/core";
import { LS_KEYS, formatPrice, readLS, whatsappLink } from "@/lib/utils";
import { company } from "@/data/company";
import type { Order } from "@/lib/types";

export default function OrderSuccessPage() {
  const { t, pick, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  usePageTitle(t("order.successTitle"), "Order Received");

  useEffect(() => {
    setOrder(readLS<Order | null>(LS_KEYS.lastOrder, null));
    setLoaded(true);
  }, []);

  const num = (value: number) => value.toLocaleString(language === "bn" ? "bn-BD" : "en-US");

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 lg:py-10">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("order.successTitle") }]} />

      {!loaded ? null : !order ? (
        <div className="mt-6">
          <EmptyState
            icon={ReceiptText}
            title={t("order.notFound")}
            description={t("order.notFoundDesc")}
            action={
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16339B]"
              >
                {t("common.browseProducts")}
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-3xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-6 text-center sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A] text-white">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-[22px] font-bold text-[#14532D] sm:text-[28px]">
              {t("order.successTitle")}
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#66777D]">{t("order.successSub")}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
                {t("order.orderNumber")}
              </h2>
              <p className="mt-1 text-lg font-extrabold text-[#1D4ED8]">{order.ref}</p>
              <p className="mt-1 text-[12px] text-[#66777D]">
                {t("order.orderDate")}: {new Date(order.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}
              </p>
              <h2 className="mt-4 text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
                {t("order.payment")}
              </h2>
              <p className="mt-1 text-[13.5px] font-semibold text-[#17242A]">{t("order.cod")}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
                {t("order.customer")}
              </h2>
              <p className="mt-1 text-[14px] font-semibold text-[#17242A]">{order.customer.fullName}</p>
              <p className="text-[13px] text-[#66777D]">
                {t("order.mobile")}: {order.customer.mobile}
              </p>
              <h2 className="mt-3 text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
                {t("order.address")}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[#66777D]">
                {order.customer.area}, {order.customer.upazila}, {order.customer.district} —{" "}
                {order.customer.address}
              </p>
              <p className="mt-1 text-[12.5px] font-semibold text-[#1D4ED8]">
                {t("order.delivery")}:{" "}
                {order.deliveryZone === "inside" ? t("order.insideDhaka") : t("order.outsideDhaka")} •{" "}
                {t("order.deliveryTbd")}
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white">
            <h2 className="border-b border-[#E2E8EA] bg-[#F5F8FE] px-5 py-3 text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
              {t("order.items")}
            </h2>
            <ul className="divide-y divide-[#E2E8EA]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[13.5px]">
                  <span className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="block truncate font-semibold text-[#17242A] hover:text-[#1D4ED8]"
                    >
                      {pick(item.name)}
                    </Link>
                    <span className="text-[11.5px] text-[#66777D]">
                      {t("order.quantity")}: {num(item.qty)} × {formatPrice(item.price, language)}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-[#17242A]">
                    {formatPrice(item.price * item.qty, language)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-[#E2E8EA] bg-[#F5F8FE] px-5 py-4 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-[#66777D]">{t("order.subtotal")}</dt>
                <dd className="font-semibold">{formatPrice(order.subtotal, language)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#66777D]">{t("order.delivery")}</dt>
                <dd className="font-semibold text-[#8A6400]">{t("order.deliveryTbd")}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-bold text-[#16339B]">{t("order.total")}</dt>
                <dd className="font-extrabold text-[#1D4ED8]">{formatPrice(order.total, language)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/shop"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#16339B]"
            >
              {t("order.continue")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink(language === "bn" ? company.whatsappMessage.bn : company.whatsappMessage.en)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2E9E44]/50 bg-[#2E9E44]/10 px-5 py-3 text-[14px] font-bold text-[#1F7A33] transition hover:bg-[#2E9E44]/20"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("order.whatsappHelp")}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
