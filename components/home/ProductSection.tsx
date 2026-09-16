import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardItem } from "@/components/home/ProductCard";

/** One brand's "popular products" strip on the family homepage. Server-rendered; ProductCard itself is the interactive part. */
export function ProductSection({
  orgSlug,
  orgName,
  tagline,
  items,
}: {
  orgSlug: string;
  orgName: string;
  tagline: string;
  items: ProductCardItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-(--container-max) px-[5vw] py-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold">{orgName}&rsquo;s popular products</h3>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{tagline}</p>
        </div>
        <Link
          href={`/catalog?org=${orgSlug}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          See more <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
