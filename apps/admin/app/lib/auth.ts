/**
 * Sessão do admin — stateless (HMAC), funciona no serverless da Vercel.
 * Cookie: `<exp>.<rand>.<sig>` onde sig = HMAC_SHA256(ADMIN_PASSWORD, `<exp>.<rand>`).
 * Usa Web Crypto para rodar no Edge (middleware) e no Node (rotas).
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const enc = new TextEncoder();

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return toHex(sig);
}

/** Comparação em tempo constante (evita timing attack). */
function safeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

/** Confere a senha sem vazar por timing (compara hashes SHA-256). */
export async function checkPassword(input: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(input)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return safeEqual(toHex(a), toHex(b));
}

/** Cria o valor do cookie de sessão. */
export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const password = getAdminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD não configurado.");
  const exp = Date.now() + SESSION_TTL_MS;
  const rand = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const data = `${exp}.${rand}`;
  const sig = await hmacHex(password, data);
  return { value: `${data}.${sig}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

/** Valida o valor do cookie. */
export async function verifySession(value: string | undefined | null): Promise<boolean> {
  const password = getAdminPassword();
  if (!password || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expStr, rand, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  if (!/^[0-9a-f]{32}$/.test(rand)) return false;
  const expected = await hmacHex(password, `${expStr}.${rand}`);
  return safeEqual(sig, expected);
}

export function sessionCookieHeader(value: string, maxAge: number): string {
  const secure =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
