import { createClient } from "@/lib/supabase/server";
import { listActiveOrganizations, listActiveBanners } from "@/lib/queries/brands";
import { listPublishedCatalogItems } from "@/lib/queries/catalog";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { HeroBanner } from "@/components/home/HeroBanner";
import { BrandCards } from "@/components/home/BrandCards";
import { ProductSection } from "@/components/home/ProductSection";
import { Testimonials } from "@/components/home/Testimonials";

// Family homepage — header, three brand cards, brand links, approved
// banners, and footer, per the brief's screen map for `/`. A Server
// Component reading Supabase directly (see docs/ARCHITECTURE.md, "Read
// path") via the same lib/queries modules the /api/v1 routes use, so this
// page and the API can never quietly disagree about what's visible.
export default async function HomePage() {
  const supabase = await createClient();

  const [organizations, banners, testimonials] = await Promise.all([
    listActiveOrganizations(supabase),
    listActiveBanners(supabase),
    listActiveTestimonials(supabase),
  ]);

  const productSections = await Promise.all(
    organizations.map(async (org) => {
      const { items } = await listPublishedCatalogItems(supabase, {
        organizationSlug: org.slug,
        from: 0,
        to: 5,
      });
      return { org, items };
    }),
  );

  return (
    <div className="pb-10">
      <HeroBanner banners={banners} />
      <BrandCards organizations={organizations} />

      {productSections.map(({ org, items }) => (
        <ProductSection
          key={org.slug}
          orgSlug={org.slug}
          orgName={org.name}
          tagline={org.description}
          items={items}
        />
      ))}

      <Testimonials testimonials={testimonials} />
    </div>
  );
}
