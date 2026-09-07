import { fetchProducts, fetchFeaturedProducts } from "@patricia-moura-personalizados/sanity";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { CategoryFilter } from "@/components/category-filter";
import { InstagramBanner } from "@/components/instagram-banner";

export default async function HomePage() {
  const [products, featured] = await Promise.all([
    fetchProducts(),
    fetchFeaturedProducts(),
  ]);

  return (
    <div>
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Produtos em Destaque</h2>
        <ProductGrid products={featured.length > 0 ? featured : products.slice(0, 4)} />
      </section>

      <InstagramBanner />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Todos os Produtos</h2>
        <CategoryFilter />
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
