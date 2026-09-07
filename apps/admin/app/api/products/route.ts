import { NextResponse } from "next/server";
import { getWriteClient } from "@mkt-digital/sanity/server";
import { slugify } from "@/app/lib/products";
import {
  ADMIN_LIST_QUERY,
  ensureUniqueSlug,
  toImageObjects,
  validateProductInput,
} from "./validate";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = getWriteClient();
    const products = await client.fetch(ADMIN_LIST_QUERY);
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao listar." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  try {
    const data = validateProductInput(
      body as Parameters<typeof validateProductInput>[0]
    );
    const client = getWriteClient();
    const slug = await ensureUniqueSlug(client, data.name);

    const created = await client.create({
      _type: "product",
      name: data.name,
      slug: { _type: "slug", current: slug },
      description: data.description,
      price: data.price,
      category: data.category,
      images: toImageObjects(data.imageAssetIds),
      customizable: data.customizable,
      featured: data.featured,
      variants: data.variants.map((v) => ({
        _key: slugify(v.name),
        name: v.name,
        price: v.price,
      })),
    });

    return NextResponse.json(
      { product: { _id: created._id, slug } },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao criar.";
    const status = message.includes("não configurado") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
