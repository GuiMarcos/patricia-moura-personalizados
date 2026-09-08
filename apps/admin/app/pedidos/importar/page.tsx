import Link from "next/link";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import { ImportForm, type ImportProduct } from "../import-form";

export const dynamic = "force-dynamic";

async function fetchCatalog(): Promise<ImportProduct[]> {
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

export default async function ImportOrderPage() {
  const products = await fetchCatalog();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/pedidos" className="text-sm text-primary-600 hover:underline">
          ← Voltar para pedidos
        </Link>
        <h1 className="mt-1 text-3xl font-bold">Importar mensagem</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cole aqui a mensagem do WhatsApp (no formato gerado pelo site ou semelhante). O sistema
          identifica os itens e o cliente e você confere antes de criar.
        </p>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <ImportForm products={products} />
        </div>
      </div>
    </div>
  );
}