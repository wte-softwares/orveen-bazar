import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { translate, type TranslationKey } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Fetch profile display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch wishlist items count
  const { count: wishlistCount } = await supabase
    .from("wishlists")
    .select("item_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const t = (key: TranslationKey<"account">) =>
    translate("account", key, defaultLocale);

  return (
    <Container className="py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t("accountHeading")}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t("accountSubtitle")}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-1">
        <Link
          href="/account"
          className="flex items-center gap-2 border-b-2 border-[var(--brand-primary)] px-3 py-2 text-sm font-bold text-[var(--brand-primary)]"
        >
          <User className="h-4 w-4" />
          <span>{t("navProfile")}</span>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-foreground transition"
        >
          <Heart className="h-4 w-4" />
          <span>{t("navWishlist")}</span>
          {wishlistCount ? (
            <span className="ml-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--brand-primary)]">
              {wishlistCount}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Profile Form */}
      <AccountProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialDisplayName={profile?.display_name ?? null}
      />
    </Container>
  );
}
