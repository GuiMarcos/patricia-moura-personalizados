import Link from "next/link";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import { OrderForm, type CatalogProduct } from "../order-form";

export const dynamic = "force-dynamic";

async function fetchCatalog(): Promise<CatalogProduct[]> {
  try {
    const client = getWriteClient();
    return await client.fetch(
      `*[_type == "product"] | order(name asc) {
        _id, name, price, variants[] { name, price }
      }`
    );
  } catch {
    return [];
  }
}

export default async function NewOrderPage() {
  const products = await fetchCatalog();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/pedidos" className="text-sm text-primary-600 hover:underline">
          ← Voltar para pedidos
        </Link>
        <h1 className="mt-1 text-3xl font-bold">Novo pedido</h1>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <OrderForm products={products} />
        </div>
      </div>
    </div>
  );
}
