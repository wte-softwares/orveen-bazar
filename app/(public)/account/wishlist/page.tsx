import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { WishlistGrid, type WishlistRow } from "@/components/account/WishlistGrid";
import { translate, type TranslationKey } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";

const WISHLIST_ITEM_COLUMNS =
  "created_at, item:catalog_items(id, slug, title, price, compare_at_price, status, item_images(image_path, sort_order), organization:organizations(slug, is_active))";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/wishlist");
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select(WISHLIST_ITEM_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  interface RawWishlistQueryRow {
    created_at: string;
    item: {
      id: string;
      slug: string;
      title: string;
      price: number;
      compare_at_price: number | null;
      status: string;
      item_images: Array<{
        image_path: string;
        sort_order: number;
      }> | null;
      organization: {
        slug: string;
        is_active: boolean;
      } | null;
    } | null;
  }

  const initialItems: WishlistRow[] = ((data ?? []) as unknown as RawWishlistQueryRow[]).map((row) => ({
    created_at: row.created_at,
    unavailable:
      !row.item ||
      row.item.status !== "published" ||
      !row.item.organization?.is_active,
    item: row.item
      ? {
          id: row.item.id,
          slug: row.item.slug,
          title: row.item.title,
          price: row.item.price,
          compare_at_price: row.item.compare_at_price,
          status: row.item.status,
          item_images: row.item.item_images ?? [],
          organization: {
            slug: row.item.organization?.slug ?? "",
            is_active: Boolean(row.item.organization?.is_active),
          },
        }
      : null,
  }));

  const t = (key: TranslationKey<"account">) =>
    translate("account", key, defaultLocale);

  return (
    <Container className="py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t("wishlistHeading")}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t("wishlistSubtitle")}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-1">
        <Link
          href="/account"
          className="flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-foreground transition"
        >
          <User className="h-4 w-4" />
          <span>{t("navProfile")}</span>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-2 border-b-2 border-[var(--brand-primary)] px-3 py-2 text-sm font-bold text-[var(--brand-primary)]"
        >
          <Heart className="h-4 w-4" />
          <span>{t("navWishlist")}</span>
          {initialItems.length ? (
            <span className="ml-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--brand-primary)]">
              {initialItems.length}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Wishlist Grid */}
      <WishlistGrid initialItems={initialItems} />
    </Container>
  );
}
