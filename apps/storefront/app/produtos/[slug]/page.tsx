import { fetchProductBySlug } from "@patricia-moura-personalizados/sanity";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
