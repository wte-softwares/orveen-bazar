import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/core";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  loading = false,
  compact = false,
}: {
  products: Product[];
  loading?: boolean;
  compact?: boolean;
}) {
  if (loading) return <ProductGridSkeleton count={8} />;
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  );
}
