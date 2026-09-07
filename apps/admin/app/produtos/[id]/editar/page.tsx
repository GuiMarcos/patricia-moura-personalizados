import Link from "next/link";
import { notFound } from "next/navigation";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import type { AdminProduct } from "@/app/lib/products";
import { ProductForm } from "../../product-form";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchProduct(id: string): Promise<AdminProduct | null> {
  try {
    const client = getWriteClient();
    return await client.fetch(
      `*[_type == "product" && _id == $id][0] {
        _id,
        name,
        "slug": slug.current,
        description,
        price,
        category,
        customizable,
        featured,
        variants[] { name, price },
        images[] { "assetId": asset._ref, "url": asset->url }
      }`,
      { id }
    );
  } catch {
    return null;
  }
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/produtos" className="text-sm text-primary-600 hover:underline">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-1 text-3xl font-bold">Editar produto</h1>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <ProductForm initial={product} />
        </div>
      </div>
    </div>
  );
}
