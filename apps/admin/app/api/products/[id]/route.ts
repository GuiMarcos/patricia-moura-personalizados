import { NextResponse } from "next/server";
import { getWriteClient } from "@mkt-digital/sanity/server";
import { slugify } from "@/app/lib/products";
import { toImageObjects, validateProductInput } from "../validate";

export const runtime = "nodejs";

const DETAIL_QUERY = `*[_type == "product" && _id == $id][0] {
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
}`;

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const client = getWriteClient();
    const product = await client.fetch(DETAIL_QUERY, { id });
    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao buscar." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  try {
    const data = validateProductInput(
      body as Parameters<typeof validateProductInput>[0],
      true
    );
    const client = getWriteClient();

    const existing = await client.fetch(
      `*[_type == "product" && _id == $id][0]._id`,
      { id }
    );
    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Só aplica os campos enviados (slug nunca muda na edição)
    const set: Record<string, unknown> = {};
    if (body !== null && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (b.name !== undefined) set.name = data.name;
      if (b.description !== undefined) set.description = data.description;
      if (b.price !== undefined) set.price = data.price;
      if (b.category !== undefined) set.category = data.category;
      if (b.customizable !== undefined) set.customizable = data.customizable;
      if (b.featured !== undefined) set.featured = data.featured;
      if (b.variants !== undefined) {
        set.variants = data.variants.map((v) => ({
          _key: slugify(v.name),
          name: v.name,
          price: v.price,
        }));
      }
      if (b.images !== undefined) set.images = toImageObjects(data.imageAssetIds);
    }

    await client.patch(id).set(set).commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao salvar.";
    const status = message.includes("não configurado") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const client = getWriteClient();
    await client.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao excluir." },
      { status: 500 }
    );
  }
}
