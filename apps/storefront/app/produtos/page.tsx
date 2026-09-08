import { fetchProducts } from "@patricia-moura-personalizados/sanity";
import { ProductGrid } from "@/components/product-grid";
import { CategoryFilter } from "@/components/category-filter";
import { siteConfig } from "@patricia-moura-personalizados/config";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const products = await fetchProducts(params.categoria);
  const categoryLabel = siteConfig.categories.find(
    (cat) => cat.value === params.categoria
  )?.label;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o início
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-center mb-8 text-primary-500">
        {params.categoria ? categoryLabel ?? "Todos os Produtos" : "Todos os Produtos"}
      </h1>

      <CategoryFilter />
      <ProductGrid products={products} />
    </div>
  );
}
