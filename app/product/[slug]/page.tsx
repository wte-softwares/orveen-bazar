import type { Metadata } from "next";
import { productBySlug } from "@/data/products";
import { ProductPageClient } from "@/components/pages/ProductPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: `${product.name.bn} | ${product.name.en}`,
    description: `${product.shortDescription.bn} ${product.shortDescription.en}`,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: "website",
      title: `${product.name.bn} | ORVEEN BAZZAR`,
      description: product.shortDescription.en,
      url: `https://www.orveenbazzar.com/product/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
