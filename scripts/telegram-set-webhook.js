/**
 * Registra o webhook do bot do Telegram apontando para o app do admin.
 *
 * Uso (roda o with-env para injetar o .env):
 *   node scripts/with-env.js --env prod -- node scripts/telegram-set-webhook.js
 *
 * Requer: TELEGRAM_BOT_TOKEN e ADMIN_PUBLIC_URL (.env.local ou .env.prod).
 */
const token = process.env.TELEGRAM_BOT_TOKEN;
const publicUrl = process.env.ADMIN_PUBLIC_URL;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!token) fail("TELEGRAM_BOT_TOKEN não configurado.");
if (!publicUrl) fail("ADMIN_PUBLIC_URL não configurado.");

const base = `https://api.telegram.org/bot${token}`;

async function main() {
  const me = await fetch(`${base}/getMe`).then((r) => r.json());
  if (!me.ok) {
    console.error("❌ getMe falhou:", JSON.stringify(me));
    process.exit(1);
  }
  console.log(`✅ Bot: @${me.result.username}`);

  const webhookUrl = `${publicUrl.replace(/\/$/, "")}/api/telegram/webhook`;
  const res = await fetch(`${base}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  }).then((r) => r.json());

  if (!res.ok) {
    console.error("❌ setWebhook falhou:", JSON.stringify(res));
    process.exit(1);
  }

  console.log(`✅ Webhook registrado: ${webhookUrl}`);

  const info = await fetch(`${base}/getWebhookInfo`).then((r) => r.json());
  console.log("Webhook info:", JSON.stringify(info.result, null, 2));
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});