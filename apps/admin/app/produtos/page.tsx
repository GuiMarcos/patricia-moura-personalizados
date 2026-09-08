import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import { ADMIN_LIST_QUERY } from "@/app/api/products/validate";
import { categoryLabel, type AdminProduct } from "@/app/lib/products";
import { DeleteButton } from "./delete-button";
import { LogoutButton } from "../logout-button";
import { ListRefresh } from "@/components/list-refresh";

export const dynamic = "force-dynamic";

async function fetchProducts(): Promise<AdminProduct[]> {
  try {
    const client = getWriteClient();
    return await client.fetch(ADMIN_LIST_QUERY);
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen bg-cream">
      <ListRefresh />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-primary-600 hover:underline">
              ← Painel
            </Link>
            <h1 className="mt-1 text-3xl font-bold">Produtos</h1>
            <p className="mt-1 text-gray-500">
              {products.length} produto(s) cadastrado(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton />
            <Link
              href="/produtos/novo"
              className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 font-semibold text-white hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-primary-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-primary-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            Img
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {categoryLabel(p.category)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      R$ {Number(p.price).toFixed(2)}
                      {p.variants?.length > 0 && (
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (+{p.variants.length} var.)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {p.customizable ? "✨ Personalizável" : "Padrão"}
                      </span>
                      {p.featured && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                          ★ Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/produtos/${p._id}/editar`}
                          title={`Editar ${p.name}`}
                          className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton id={p._id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
