import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categoryBySlug } from "@/data/categories";
import { ShopView } from "@/components/product/ShopView";
import { ProductGridSkeleton } from "@/components/ui/core";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: `${category.name.bn} | ${category.name.en}`,
    description: `${category.description.bn} ${category.description.en}`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.name.bn} | ORVEEN BAZZAR`,
      description: category.description.en,
      url: `https://www.orveenbazzar.com/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <ProductGridSkeleton />
        </div>
      }
    >
      <ShopView categorySlug={slug} />
    </Suspense>
  );
}
