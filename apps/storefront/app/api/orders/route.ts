import { NextResponse } from "next/server";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";

export const runtime = "nodejs";

interface OrderItemInput {
  productId?: unknown;
  quantity?: unknown;
  price?: unknown;
  variantName?: unknown;
  customNote?: unknown;
  artworkUrls?: unknown;
}

/**
 * Registra o pedido no Sanity com status "pendente".
 * O pagamento/conferência continua no WhatsApp — aqui fica o registro.
 */
export async function POST(req: Request) {
  let body: { items?: unknown; customerNote?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Pedido sem itens." }, { status: 400 });
  }
  if (body.items.length > 50) {
    return NextResponse.json({ error: "Pedido grande demais." }, { status: 400 });
  }

  const items = [];
  for (const [i, raw] of body.items.entries()) {
    const in_ = raw as OrderItemInput;
    if (typeof in_.productId !== "string" || !in_.productId) {
      return NextResponse.json({ error: `Item ${i + 1}: produto inválido.` }, { status: 400 });
    }
    const quantity = Number(in_.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: `Item ${i + 1}: quantidade inválida.` }, { status: 400 });
    }
    const price = Number(in_.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: `Item ${i + 1}: preço inválido.` }, { status: 400 });
    }
    const variantName =
      typeof in_.variantName === "string" && in_.variantName.trim()
        ? in_.variantName.trim().slice(0, 100)
        : undefined;
    const customNote =
      typeof in_.customNote === "string" && in_.customNote.trim()
        ? in_.customNote.trim().slice(0, 1000)
        : undefined;
    let artworkUrls: string[] | undefined;
    if (in_.artworkUrls !== undefined) {
      if (
        !Array.isArray(in_.artworkUrls) ||
        in_.artworkUrls.some(
          (u) => typeof u !== "string" || !u.startsWith("http")
        )
      ) {
        return NextResponse.json({ error: `Item ${i + 1}: imagens inválidas.` }, { status: 400 });
      }
      artworkUrls = (in_.artworkUrls as string[]).slice(0, 6);
    }
    items.push({
      productId: in_.productId,
      quantity,
      price: Math.round(price * 100) / 100,
      variantName,
      customNote,
      artworkUrls,
    });
  }

  try {
    const client = getWriteClient();

    // Garante que os produtos existem (evita lixo no banco)
    const ids = [...new Set(items.map((it) => it.productId))];
    const found: string[] = await client.fetch(
      `*[_type == "product" && _id in $ids]._id`,
      { ids }
    );
    if (found.length !== ids.length) {
      return NextResponse.json(
        { error: "Pedido contém produto inexistente." },
        { status: 400 }
      );
    }

    const total =
      Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) /
      100;

    const created = await client.create({
      _type: "order",
      items: items.map((it, i) => ({
        _key: `item${i}`,
        product: { _type: "reference", _ref: it.productId },
        quantity: it.quantity,
        price: it.price,
        ...(it.variantName ? { variantName: it.variantName } : {}),
        ...(it.customNote ? { customNote: it.customNote } : {}),
        ...(it.artworkUrls?.length ? { artworkUrls: it.artworkUrls } : {}),
      })),
      total,
      status: "pendente",
      ...(typeof body.customerNote === "string" && body.customerNote.trim()
        ? { customerNote: body.customerNote.trim().slice(0, 1000) }
        : {}),
    });

    return NextResponse.json(
      {
        orderId: created._id,
        number: created._id.slice(-8).toUpperCase(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Falha ao registrar pedido:", err);
    const message = err instanceof Error ? err.message : "Falha ao registrar.";
    const status = message.includes("não configurado") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
