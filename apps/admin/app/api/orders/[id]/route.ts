import { NextResponse } from "next/server";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import {
  validateOrderInput,
  toOrderItems,
  assertProductsExist,
} from "../validate";

export const runtime = "nodejs";

const STATUSES = ["pendente", "confirmado", "enviado", "entregue", "cancelado"] as const;

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * Altera o status de um pedido ({ status }) ou edita o pedido inteiro
 * ({ items, customerName, customerPhone, customerAddress, customerNote,
 *   discountType, discountValue } — total recalculado no servidor).
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  try {
    const client = getWriteClient();
    const existing = await client.fetch(
      `*[_type == "order" && _id == $id][0]._id`,
      { id }
    );
    if (!existing) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    // Edição completa: itens, cliente e desconto (total recalculado)
    if (body.items !== undefined) {
      let input;
      try {
        input = validateOrderInput(body);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Dados inválidos." },
          { status: 400 }
        );
      }
      const check = await assertProductsExist(
        client,
        input.items.map((it) => it.productId)
      );
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      await client
        .patch(id)
        .set({
          items: toOrderItems(input.items),
          total: input.total,
          discountType: input.discountType,
          discountValue: input.discountValue,
          ...(input.customerName !== undefined
            ? { customerName: input.customerName || null }
            : {}),
          ...(input.customerPhone !== undefined
            ? { customerPhone: input.customerPhone || null }
            : {}),
          ...(input.customerAddress !== undefined
            ? { customerAddress: input.customerAddress || null }
            : {}),
          ...(input.customerNote !== undefined
            ? { customerNote: input.customerNote || null }
            : {}),
        })
        .commit();
      return NextResponse.json({ ok: true, total: input.total });
    }

    // Troca de status (usado pelo select da lista)
    if (
      typeof body.status !== "string" ||
      !STATUSES.includes(body.status as (typeof STATUSES)[number])
    ) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }
    await client.patch(id).set({ status: body.status }).commit();
    return NextResponse.json({ ok: true, status: body.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao atualizar." },
      { status: 500 }
    );
  }
}
