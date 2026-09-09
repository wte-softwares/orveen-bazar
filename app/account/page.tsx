"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  PackageOpen,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useToast, useWishlist } from "@/providers/StoreProvider";
import { Breadcrumb, EmptyState, Field, TextArea } from "@/components/ui/core";
import { LS_KEYS, formatPrice, readLS, removeLS, writeLS } from "@/lib/utils";
import type { Order, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "orders" | "wishlist" | "addresses" | "profile";

interface Address {
  id: number;
  text: string;
}

export default function AccountPage() {
  const { t, pick, language } = useLanguage();
  const { push } = useToast();
  const { ids } = useWishlist();
  usePageTitle(t("header.account"), "Account");

  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [addressText, setAddressText] = useState("");
  const [profile, setProfile] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = readLS<Session | null>(LS_KEYS.session, null);
    setSession(s);
    setProfile(s);
    setOrders(readLS<Order[]>(LS_KEYS.orders, []));
    setAddresses(readLS<Address[]>(LS_KEYS.addresses, []));
    setLoaded(true);
  }, []);

  const num = (value: number) => value.toLocaleString(language === "bn" ? "bn-BD" : "en-US");

  const logout = () => {
    removeLS(LS_KEYS.session);
    setSession(null);
    push(t("toasts.logout"), "info");
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    writeLS(LS_KEYS.session, profile);
    setSession(profile);
    push(t("toasts.profileSaved"));
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressText.trim()) return;
    const next = [...addresses, { id: Date.now(), text: addressText.trim() }];
    setAddresses(next);
    writeLS(LS_KEYS.addresses, next);
    setAddressText("");
    push(t("toasts.addressSaved"));
  };

  const removeAddress = (id: number) => {
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    writeLS(LS_KEYS.addresses, next);
    push(t("toasts.addressRemoved"), "info");
  };

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "dashboard", label: t("account.dashboard"), icon: LayoutDashboard },
    { key: "orders", label: t("account.orders"), icon: ReceiptText },
    { key: "wishlist", label: t("account.wishlistTab"), icon: Heart },
    { key: "addresses", label: t("account.addresses"), icon: MapPin },
    { key: "profile", label: t("account.profile"), icon: UserRound },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("header.account") }]} />
      <h1 className="mt-3 text-[22px] font-bold text-[#16339B] sm:text-[28px]">{t("header.account")}</h1>

      {!loaded ? null : !session ? (
        <div className="mt-6">
          <EmptyState
            icon={UserRound}
            title={t("account.notLogged")}
            description={t("account.notLoggedDesc")}
            action={
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#16339B]"
                >
                  {t("account.goLogin")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-[#E2E8EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
                >
                  {t("account.registerTitle")}
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr]">
          <aside className="flex gap-1.5 overflow-x-auto rounded-2xl border border-[#E2E8EA] bg-white p-2 lg:flex-col lg:overflow-visible">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={tab === item.key ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition",
                  tab === item.key
                    ? "bg-[#1D4ED8] text-white"
                    : "text-[#17242A] hover:bg-[#E8F0FE]",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#DC2626]/10"
            >
              <LogOut className="h-4 w-4" />
              {t("account.logout")}
            </button>
          </aside>

          <div className="min-w-0">
            {tab === "dashboard" ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
                  <p className="text-[13px] text-[#66777D]">{t("account.welcome")}</p>
                  <p className="text-[19px] font-bold text-[#16339B]">{session.name}</p>
                  <p className="text-[12.5px] text-[#66777D]">{session.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t("account.statsOrders"), value: orders.length },
                    { label: t("account.statsWishlist"), value: ids.length },
                    { label: t("account.statsAddresses"), value: addresses.length },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[#E2E8EA] bg-white p-4 text-center"
                    >
                      <p className="text-[22px] font-extrabold text-[#1D4ED8]">{num(stat.value)}</p>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-[#66777D]">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="rounded-xl bg-[#E8F0FE] px-4 py-2.5 text-[12px] text-[#1D4ED8]">
                  {t("account.storageNotice")}
                </p>
              </div>
            ) : null}

            {tab === "orders" ? (
              orders.length === 0 ? (
                <EmptyState icon={PackageOpen} title={t("account.noOrders")} description={t("account.noOrdersDesc")} />
              ) : (
                <ul className="space-y-3">
                  {orders.map((order) => (
                    <li key={order.ref} className="rounded-2xl border border-[#E2E8EA] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[14px] font-bold text-[#1D4ED8]">{order.ref}</p>
                        <p className="text-[12px] text-[#66777D]">
                          {new Date(order.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                        </p>
                      </div>
                      <p className="mt-1 text-[12.5px] text-[#66777D]">
                        {order.items.length} {t("order.items")} • {formatPrice(order.total, language)}
                      </p>
                      <ul className="mt-2 space-y-1 border-t border-dashed border-[#E2E8EA] pt-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between text-[12.5px] text-[#17242A]">
                            <span className="truncate">{pick(item.name)} × {num(item.qty)}</span>
                            <span className="shrink-0 font-semibold">
                              {formatPrice(item.price * item.qty, language)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "wishlist" ? (
              <EmptyState
                icon={Heart}
                title={t("wishlist.title")}
                description={`${num(ids.length)} ${t("account.statsWishlist")}`}
                action={
                  <Link
                    href="/wishlist"
                    className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#16339B]"
                  >
                    {t("wishlist.title")}
                  </Link>
                }
              />
            ) : null}

            {tab === "addresses" ? (
              <div className="space-y-4">
                <form onSubmit={addAddress} className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
                  <Field label={t("account.addAddress")} htmlFor="addr" required>
                    <TextArea
                      id="addr"
                      className="min-h-[80px]"
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                      placeholder={t("account.addressLabel")}
                    />
                  </Field>
                  <button
                    type="submit"
                    className="mt-3 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#16339B]"
                  >
                    {t("account.save")}
                  </button>
                </form>
                {addresses.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[#E2E8EA] bg-white p-5 text-[13px] text-[#66777D]">
                    {t("account.noAddresses")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {addresses.map((addr) => (
                      <li
                        key={addr.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4"
                      >
                        <span className="text-[13px] leading-relaxed text-[#17242A]">{addr.text}</span>
                        <button
                          type="button"
                          onClick={() => removeAddress(addr.id)}
                          aria-label={t("account.delete")}
                          className="rounded-lg p-1.5 text-[#66777D] transition hover:bg-[#DC2626]/10 hover:text-[#DC2626]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {tab === "profile" && profile ? (
              <form onSubmit={saveProfile} className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("account.name")} htmlFor="pf-name" required>
                    <input
                      id="pf-name"
                      className="w-full rounded-xl border border-[#E2E8EA] px-3.5 py-2.5 text-[15px] focus:border-[#1D4ED8] focus:outline-none"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </Field>
                  <Field label={t("account.mobile")} htmlFor="pf-mobile">
                    <input
                      id="pf-mobile"
                      className="w-full rounded-xl border border-[#E2E8EA] px-3.5 py-2.5 text-[15px] focus:border-[#1D4ED8] focus:outline-none"
                      value={profile.mobile}
                      onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    />
                  </Field>
                  <Field label={t("account.email")} htmlFor="pf-email" required className="sm:col-span-2">
                    <input
                      id="pf-email"
                      type="email"
                      className="w-full rounded-xl border border-[#E2E8EA] px-3.5 py-2.5 text-[15px] focus:border-[#1D4ED8] focus:outline-none"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </Field>
                </div>
                <button
                  type="submit"
                  className="mt-4 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#16339B]"
                >
                  {t("account.save")}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
