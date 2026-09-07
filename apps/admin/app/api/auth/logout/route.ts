import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookieHeader() } }
  );
}
