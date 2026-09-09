"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { useCart } from "@/providers/StoreProvider";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

/** Reusable order summary used on cart, checkout and order success. */
export function OrderSummary({ order }: { order?: Order | null }) {
  const { t, pick, language } = useLanguage();
  const { lines, subtotal } = useCart();

  const items = order
    ? order.items.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      }))
    : lines.map((line) => ({
        id: line.product.id,
        name: line.product.name,
        qty: line.qty,
        price: line.product.price,
      }));

  const sub = order ? order.subtotal : subtotal;
  const zone = order?.deliveryZone;

  return (
    <div className="rounded-2xl border border-[#E2E8EA] bg-white p-4 sm:p-5">
      <h2 className="text-base font-bold text-[#16339B]">{t("checkout.summaryTitle")}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 text-[13px]">
            <span className="min-w-0">
              <span className="block truncate font-medium text-[#17242A]">{pick(item.name)}</span>
              <span className="text-[11.5px] text-[#66777D]">
                {t("order.quantity")}: {item.qty.toLocaleString(language === "bn" ? "bn-BD" : "en-US")} ×{" "}
                {formatPrice(item.price, language)}
              </span>
            </span>
            <span className="shrink-0 font-semibold text-[#17242A]">
              {formatPrice(item.price * item.qty, language)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-dashed border-[#E2E8EA] pt-3 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-[#66777D]">{t("order.subtotal")}</dt>
          <dd className="font-semibold text-[#17242A]">{formatPrice(sub, language)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#66777D]">
            {t("order.delivery")}
            {zone ? ` (${zone === "inside" ? t("order.insideDhaka") : t("order.outsideDhaka")})` : ""}
          </dt>
          <dd className="font-semibold text-[#8A6400]">{t("order.deliveryTbd")}</dd>
        </div>
        <div className="flex justify-between border-t border-[#E2E8EA] pt-2 text-base">
          <dt className="font-bold text-[#16339B]">{t("order.total")}</dt>
          <dd className="font-extrabold text-[#1D4ED8]">{formatPrice(sub, language)}</dd>
        </div>
      </dl>
      <p className="mt-3 rounded-xl bg-[#E8F0FE] px-3 py-2 text-[11.5px] leading-relaxed text-[#1D4ED8]">
        {t("checkout.deliveryNote")}
      </p>
    </div>
  );
}
