/** Só dígitos: aceita "+55 (41) 99698-1425" e cai no padrão se inválido. */
function phoneDigits(value: string | undefined, fallback: string): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : fallback;
}

const whatsappNumber = phoneDigits(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  "5541996981425"
);

const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://instagram.com/patriciamourapersonalizados";

export const siteConfig = {
  name: "Patrícia Moura Personalizados",
  description: "Canecas, camisetas, chaveiros, garrafas e toalhas personalizados. Faça seu pedido pelo WhatsApp!",
  whatsapp: {
    number: whatsappNumber,
    message: "Olá! Gostaria de fazer um pedido!",
  },
  instagram: instagramUrl,
  categories: [
    { label: "Canecas", value: "caneca" as const },
    { label: "Camisetas", value: "camiseta" as const },
    { label: "Chaveiros", value: "chaveiro" as const },
    { label: "Garrafas", value: "garrafa" as const },
    { label: "Toalhas", value: "toalha" as const },
  ],
};

export interface WhatsAppOrderItem {
  name: string;
  price: number;
  quantity: number;
  /** Descrição da personalização (só produtos personalizáveis) */
  note?: string;
  /** URLs das imagens de referência (após upload) */
  artworkUrls?: string[];
}

export function generateWhatsAppLink(
  items: WhatsAppOrderItem[],
  phone: string = siteConfig.whatsapp.number,
  orderNumber?: string
): string {
  const lines = items.map((item) => {
    const base = `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`;
    const extras: string[] = [];
    if (item.note?.trim()) {
      extras.push(`   ✏️ Personalização: ${item.note.trim()}`);
    }
    if (item.artworkUrls?.length) {
      extras.push(`   🖼️ Referências: ${item.artworkUrls.join(" ")}`);
    }
    return extras.length ? `${base}\n${extras.join("\n")}` : base;
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const header = orderNumber ? `🧾 *Pedido #${orderNumber}:*` : `📦 *Pedido:*`;
  const text = `${siteConfig.whatsapp.message}\n\n${header}\n${lines.join("\n")}\n\n💰 *Total: R$ ${total.toFixed(2)}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
