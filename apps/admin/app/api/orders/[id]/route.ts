import { NextResponse } from "next/server";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";

export const runtime = "nodejs";

const STATUSES = ["pendente", "confirmado", "enviado", "entregue", "cancelado"] as const;

interface Ctx {
  params: Promise<{ id: string }>;
}

/** Avança (ou altera) o status de um pedido. */
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (typeof body.status !== "string" || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json(
      { error: `Status inválido. Use: ${STATUSES.join(", ")}.` },
      { status: 400 }
    );
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
    await client.patch(id).set({ status: body.status }).commit();
    return NextResponse.json({ ok: true, status: body.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao atualizar." },
      { status: 500 }
    );
  }
}
