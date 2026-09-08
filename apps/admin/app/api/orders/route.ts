import { NextResponse } from "next/server";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import {
  validateOrderInput,
  toOrderItems,
  assertProductsExist,
} from "./validate";

export const runtime = "nodejs";

/** Cria um pedido manual pelo admin (status inicial: pendente). */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  let input;
  try {
    input = validateOrderInput(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dados inválidos." },
      { status: 400 }
    );
  }

  try {
    const client = getWriteClient();
    const check = await assertProductsExist(
      client,
      input.items.map((it) => it.productId)
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const created = await client.create({
      _type: "order",
      items: toOrderItems(input.items),
      total: input.total,
      status: "pendente",
      discountType: input.discountType,
      discountValue: input.discountValue,
      ...(input.customerName ? { customerName: input.customerName } : {}),
      ...(input.customerPhone ? { customerPhone: input.customerPhone } : {}),
      ...(input.customerAddress ? { customerAddress: input.customerAddress } : {}),
      ...(input.customerNote ? { customerNote: input.customerNote } : {}),
    });

    return NextResponse.json(
      {
        orderId: created._id,
        number: created._id.slice(-8).toUpperCase(),
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao criar." },
      { status: 500 }
    );
  }
}
