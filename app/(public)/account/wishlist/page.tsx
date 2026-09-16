import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Saved items across brands, item links, remove action. Must explain or
// safely remove items that became unavailable (unpublished/archived) since
// being saved — never a broken link (Phase 2).
export default function WishlistPage() {
  return (
    <ScreenPlaceholder
      title="Wishlist"
      route="/account/wishlist"
      description="Saved items across brands with a remove action."
    />
  );
}
