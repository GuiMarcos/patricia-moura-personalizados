import { NextResponse } from "next/server";
import { getOrderStats } from "@/app/lib/stats";

export const runtime = "nodejs";

/** Agregados de pedidos para o dashboard do admin. */
export async function GET() {
  try {
    return NextResponse.json(await getOrderStats());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao agregar." },
      { status: 500 }
    );
  }
}
