import { NextResponse } from "next/server";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import {
  matchCatalog,
  parseWhatsAppOrder,
  type MatchableProduct,
} from "@patricia-moura-personalizados/parser";
import {
  assertProductsExist,
  toOrderItems,
  validateOrderInput,
  type ValidOrderItem,
  type ValidOrderInput,
} from "../../orders/validate";

export const runtime = "nodejs";

const botToken = () => process.env.TELEGRAM_BOT_TOKEN || "";
const adminId = () => process.env.TELEGRAM_ADMIN_ID?.trim() || "";

interface TelegramLine {
  quantity: number;
  matchedName: string;
  variantName?: string;
  unitPrice: number;
  customNote?: string;
}

async function callApi(method: string, payload: Record<string, unknown>) {
  const token = botToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // falha ao responder o Telegram não deve derrubar o webhook
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function inlineKeyboard(draftId: string) {
  return {
    inline_keyboard: [
      [{ text: "✅ Confirmar pedido", callback_data: `order:${draftId}` }],
      [{ text: "🗑 Cancelar", callback_data: `cancel:${draftId}` }],
    ],
  };
}

function buildPreview(
  lines: TelegramLine[],
  data: ValidOrderInput,
  customerPhone: string,
  customerAddress: string,
  notes: string
): string {
  const itemsHtml = lines
    .map((l, i) => {
      const variant = l.variantName ? ` (${escapeHtml(l.variantName)})` : "";
      const note = l.customNote ? `\n✏️ ${escapeHtml(l.customNote)}` : "";
      const linesB = [
        `<b>${i + 1}.</b> ${l.quantity}x ${escapeHtml(l.matchedName)}${variant}`,
        `   ${money(l.unitPrice)} × ${l.quantity} = <b>${money(l.unitPrice * l.quantity)}</b>${note}`,
      ];
      return linesB.join("\n");
    })
    .join("\n");

  const parts: string[] = ["<b>Pedido importado do WhatsApp</b>", "", "<b>Itens:</b>", itemsHtml, ""];
  if (customerPhone) parts.push(`📞 <b>Cliente:</b> ${escapeHtml(customerPhone)}`);
  if (customerAddress) parts.push(`📍 <b>Endereço:</b> ${escapeHtml(customerAddress)}`);
  if (notes) parts.push(`${escapeHtml(notes)}`);
  parts.push("");
  parts.push(`<b>Total: ${money(data.total)}</b>`);
  parts.push("");
  parts.push("Confirma a criação do pedido? ⬇️");

  return parts.filter((p) => p !== null).join("\n");
}

async function catalog(client: ReturnType<typeof getWriteClient>) {
  return (await client.fetch(
    `*[_type == "product"] | order(name asc) {
      _id, name, price, variants[] { name, price }
    }`
  )) as MatchableProduct[];
}

async function handleMessage(chatId: number, text: string) {
  if (text.trim() === "/start" || text.trim() === "/help") {
    await callApi("sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text: [
        "<b>Bem-vindo!</b>",
        "",
        "Encaminhe a mensagem do pedido do WhatsApp (a mesma que o site gera, ou similar).",
        "Eu identifico os itens e monto o pedido para confirmação.",
        "",
        "Formato reconhecido:",
        "<code>2x Caneca Básica - R$ 120.00</code>",
        "<code>   ✏️ Personalização: Nome Ana</code>",
        "<code>💰 Total: R$ 145.00</code>",
      ].join("\n"),
    });
    return;
  }

  const order = parseWhatsAppOrder(text);
  if (order.lines.length === 0) {
    await callApi("sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        "Não identifiquei itens nessa mensagem.\nUse linhas no formato <code>2x Produto - R$ 00.00</code>.",
    });
    return;
  }

  const client = getWriteClient();
  const products = await catalog(client);

  const items: ValidOrderItem[] = [];
  const lines: TelegramLine[] = [];
  const unmatched: { name: string; quantity: number }[] = [];

  for (const l of order.lines) {
    const match = matchCatalog(products, l.nameRaw);
    if (!match.productId || !match.matchedName) {
      unmatched.push({ name: l.nameRaw, quantity: l.quantity });
      continue;
    }
    const unitPrice = l.unitPrice !== null && l.unitPrice > 0 ? l.unitPrice : (match.price ?? 0);
    items.push({
      productId: match.productId,
      quantity: l.quantity,
      price: unitPrice,
      variantName: match.variantName,
      customNote: l.customNote,
    });
    lines.push({
      quantity: l.quantity,
      matchedName: match.matchedName,
      variantName: match.variantName ?? undefined,
      unitPrice,
      customNote: l.customNote ?? undefined,
    });
  }

  if (unmatched.length > 0) {
    const text2 = [
      "Não consegui identificar <b>todos</b> os itens no catálogo:",
      "",
      ...unmatched.map(
        (u) =>
          `• ${u.quantity}x ${escapeHtml(u.name)} — <i>sem correspondência no catálogo</i>`
      ),
      "",
      "Reenvie a mensagem com os itens no formato do site ou crie o pedido manualmente no painel: /pedidos.",
    ].join("\n");
    await callApi("sendMessage", { chat_id: chatId, parse_mode: "HTML", text: text2 });
    return;
  }

  let input: ValidOrderInput;
  try {
    input = validateOrderInput({
      items,
      customerName: undefined,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerNote: order.notes.length ? order.notes.join("\n") : undefined,
      discountType: "none",
      discountValue: 0,
    });
  } catch (err) {
    await callApi("sendMessage", {
      chat_id: chatId,
      text:
        err instanceof Error
          ? `Não validei o pedido: ${err.message}`
          : "Não validei o pedido. Confira a mensagem e reenvie.",
    });
    return;
  }

  const draft = await client.create({
    _type: "orderDraft",
    chatId,
    data: input,
    createdAt: new Date().toISOString(),
  });

  const preview = buildPreview(
    lines,
    input,
    order.customerPhone ?? "",
    order.customerAddress ?? "",
    order.notes.join("\n")
  );
  await callApi("sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    reply_markup: inlineKeyboard(draft._id),
    text: preview,
  });
}

async function handleCallback(
  callbackId: string,
  chatId: number,
  messageId: number,
  data: string
) {
  const [action, draftId] = data.split(":");
  if (!draftId) return;

  const client = getWriteClient();
  const draft = await client.fetch<{ _id: string; data: ValidOrderInput } | null>(
    `*[_id == $id && _type == "orderDraft"][0] { _id, data }`,
    { id: draftId }
  );

  if (!draft) {
    await callApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: "Rascunho não encontrado ou já processado.",
    });
    return;
  }

  if (action === "cancel") {
    await client.delete(draftId);
    await callApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: "Rascunho descartado.",
    });
    await callApi("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId });
    return;
  }

  if (action !== "order") return;

  try {
    const input = validateOrderInput(draft.data as unknown as Record<string, unknown>);
    const check = await assertProductsExist(
      client,
      input.items.map((it) => it.productId)
    );
    if (!check.ok) throw new Error(check.error);

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
    await client.delete(draftId);

    const number = created._id.slice(-8).toUpperCase();
    await callApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: `Pedido criado!`,
    });
    await callApi("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId });
    await callApi("sendMessage", {
      chat_id: chatId,
      text: `✅ Pedido criado com sucesso! O número do pedido é <b>#${number}</b> (status: pendente).`,
      parse_mode: "HTML",
    });
  } catch (err) {
    await callApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: `Erro ao criar: ${err instanceof Error ? err.message : "tente novamente"}`,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "admin",
    endpoint: "telegram/webhook",
  });
}

export async function POST(req: Request) {
  const token = botToken();
  const owner = adminId();
  if (!token || !owner) {
    return NextResponse.json({ ok: false, error: "Telegram não configurado." });
  }

  let update: {
    message?: { chat?: { id?: number }; from?: { id?: number }; text?: string };
    callback_query?: {
      id?: string;
      from?: { id?: number };
      data?: string;
      message?: { chat?: { id?: number }; message_id?: number };
    };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload inválido." });
  }

  const message = update.message;
  if (message) {
    const senderId = message.from?.id;
    if (senderId === undefined || String(senderId) !== owner) {
      return NextResponse.json({ ok: true });
    }
    const chatId = message.chat?.id;
    if (chatId !== undefined && message.text) {
      await handleMessage(chatId, message.text);
    }
    return NextResponse.json({ ok: true });
  }

  const callback = update.callback_query;
  if (callback) {
    const senderId = callback.from?.id;
    if (senderId === undefined || String(senderId) !== owner) {
      return NextResponse.json({ ok: true });
    }
    const chatId = callback.message?.chat?.id;
    if (
      callback.id &&
      chatId !== undefined &&
      callback.message?.message_id !== undefined &&
      callback.data
    ) {
      await handleCallback(
        callback.id,
        chatId,
        callback.message.message_id,
        callback.data
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}