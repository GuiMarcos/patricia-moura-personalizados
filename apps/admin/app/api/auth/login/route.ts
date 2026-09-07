import { NextResponse } from "next/server";
import {
  checkPassword,
  createSession,
  getAdminPassword,
  sessionCookieHeader,
} from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "Login não configurado no servidor (ADMIN_PASSWORD)." },
      { status: 500 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (typeof body.password !== "string" || !(await checkPassword(body.password))) {
    // Resposta genérica: não revela se a senha existe ou não
    await new Promise((r) => setTimeout(r, 500)); // dificulta força bruta
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const session = await createSession();
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookieHeader(session.value, session.maxAge) } }
  );
}
