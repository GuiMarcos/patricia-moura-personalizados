import { fetchProducts } from "@patricia-moura-personalizados/sanity";
import { ProductGrid } from "@/components/product-grid";
import { CategoryFilter } from "@/components/category-filter";

interface ProductsPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const products = await fetchProducts(params.categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary-500">
        {params.categoria
          ? `${params.categoria === "caneca" ? "Canecas" : "Camisetas"}`
          : "Todos os Produtos"}
      </h1>

      <CategoryFilter />
      <ProductGrid products={products} />
    </div>
  );
}
