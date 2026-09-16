import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Family homepage — header, three brand cards, brand links, approved banners,
// footer. Real content lands once lib/queries/brands.ts and the banner data
// exist (Phase 2) and the client's designs are ready (later phase).
export default function HomePage() {
  return (
    <ScreenPlaceholder
      title="Family homepage"
      route="/"
      description="Brand cards for ORVEEN BAZAR, ECO FAST BD, and RELIABLE MULTI PRODUCTS plus approved banners."
    />
  );
}
