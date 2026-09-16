"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Save, UserRound } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useToast, useWishlist } from "@/providers/StoreProvider";
import { Breadcrumb, Badge, EmptyState, Field, TextInput } from "@/components/ui/core";

export default function AccountPage() {
  const { t } = useLanguage();
  const { user, updateName, logout } = useAuth();
  const router = useRouter();
  const { ids } = useWishlist();
  const { push } = useToast();
  usePageTitle(t("account.title"), "My Account");

  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "customer") router.replace("/admin");
  }, [router, user]);

  if (user && user.role !== "customer") return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={UserRound}
          title={t("account.guestTitle")}
          description={t("account.guestDesc")}
          action={
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-xl bg-[#075ED1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0346A5]"
              >
                {t("auth.loginTitle")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-[#E2E8EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#17242A] transition hover:bg-[#F7F9FA]"
              >
                {t("auth.registerTitle")}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError(t("validation.minLength", { count: 3 }));
      return;
    }
    setError("");
    updateName(name.trim());
    push(t("account.saved"));
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 sm:px-4 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("account.title") }]} />
      <h1 className="mt-3 text-[22px] font-bold text-[#0346A5] sm:text-[28px]">{t("account.title")}</h1>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl border border-[#E2E8EA] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[17px] font-black text-[#0346A5]">{user.name}</p>
              <p className="text-[13px] text-[#66777D]">{user.email}</p>
            </div>
            <Badge tone="teal">{t(`auth.role${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`)}</Badge>
          </div>
          <p className="mt-3 text-[11.5px] text-[#66777D]">{t("account.memberNote")}</p>
        </div>

        <form onSubmit={save} className="rounded-3xl border border-[#E2E8EA] bg-white p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-[#0346A5]">{t("account.editName")}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label={t("account.displayName")} htmlFor="ac-name" required error={error}>
              <TextInput
                id="ac-name"
                value={name}
                invalid={!!error}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
              />
            </Field>
            <Field label={t("account.emailLabel")} htmlFor="ac-email">
              <TextInput id="ac-email" value={user.email} disabled readOnly />
              <p className="mt-1.5 text-[11.5px] text-[#66777D]">{t("account.emailNote")}</p>
            </Field>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#075ED1] px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#0346A5]"
          >
            <Save className="h-4 w-4" />
            {t("account.save")}
          </button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/wishlist"
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4 transition hover:border-[#075ED1]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3FE] text-[#075ED1]">
                <Heart className="h-4.5 w-4.5" />
              </span>
              <span className="text-[14px] font-bold text-[#0346A5]">{t("account.wishlistLink")}</span>
            </span>
            <Badge tone="green">{ids.length}</Badge>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              push(t("auth.signedOut"), "info");
            }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4 text-left transition hover:border-[#DC2626]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DC2626]/10 text-[#DC2626]">
                <LogOut className="h-4.5 w-4.5" />
              </span>
              <span className="text-[14px] font-bold text-[#0346A5]">{t("account.signOut")}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
