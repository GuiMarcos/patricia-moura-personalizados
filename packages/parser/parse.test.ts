import { describe, expect, it } from "vitest";
import { parsePrice, parseWhatsAppOrder } from "./parse";

describe("parsePrice", () => {
  it("parses pt-BR comma decimals", () => {
    expect(parsePrice("76,00")).toBe(76);
  });

  it("parses dot decimals", () => {
    expect(parsePrice("80.50")).toBe(80.5);
  });

  it("parses thousand separators", () => {
    expect(parsePrice("1.250,90")).toBe(1250.9);
  });

  it("parses plain integers", () => {
    expect(parsePrice("185")).toBe(185);
  });
});

describe("parseWhatsAppOrder", () => {
  it("parses the site-generated order message", () => {
    const text = [
      "Olá! Gostaria de fazer um pedido!",
      "",
      "🧾 *Pedido #ABC12345:*",
      "2x Caneca Básica Personalizável - R$ 120.00",
      "   ✏️ Personalização: Nome \"Ana\" no verso",
      "1x Chaveiro Redondo Personalizado - R$ 25.00",
      "",
      "💰 *Total: R$ 145.00*",
    ].join("\n");

    const order = parseWhatsAppOrder(text);

    expect(order.orderNumber).toBe("ABC12345");
    expect(order.lines).toHaveLength(2);
    expect(order.lines[0]).toMatchObject({
      quantity: 2,
      nameRaw: "Caneca Básica Personalizável",
      linePrice: 120,
      unitPrice: 60,
      customNote: 'Nome "Ana" no verso',
    });
    expect(order.lines[1]).toMatchObject({
      quantity: 1,
      nameRaw: "Chaveiro Redondo Personalizado",
      linePrice: 25,
      unitPrice: 25,
    });
    expect(order.total).toBe(145);
  });

  it("detects phone, address and CEP in free text", () => {
    const text = [
      "Boa tarde! Meu pedido:",
      "2x Caneca Branca com nome da Maria - R$ 80.00",
      "Meu telefone é (41) 99698-1425",
      "Endereço: Rua das Flores, 123, Curitiba - PR, 80000-000",
      "",
      "Total: R$ 80.00",
    ].join("\n");

    const order = parseWhatsAppOrder(text);

    expect(order.customerPhone).toBe("5541996981425");
    expect(order.customerAddress).toBe(
      "Endereço: Rua das Flores, 123, Curitiba - PR, 80000-000"
    );
    expect(order.cep).toBe("80000000");
    expect(order.lines).toHaveLength(1);
    expect(order.lines[0]).toMatchObject({
      quantity: 2,
      nameRaw: "Caneca Branca com nome da Maria",
      linePrice: 80,
      unitPrice: 40,
    });
    expect(order.total).toBe(80);
  });

  it("attaches references to the previous item", () => {
    const text = [
      "1x Camiseta Personalizada - R$ 60.00",
      "   🖼️ Referências: https://exemplo.com/arte.png",
    ].join("\n");

    const order = parseWhatsAppOrder(text);

    expect(order.lines[0].customNote).toBe(
      "Referências: https://exemplo.com/arte.png"
    );
  });

  it("falls back to items without price", () => {
    const text = ["1x chaveiro coração", "2x caneca branca"].join("\n");

    const order = parseWhatsAppOrder(text);

    expect(order.lines).toHaveLength(2);
    expect(order.lines[0]).toMatchObject({ quantity: 1, nameRaw: "chaveiro coração" });
    expect(order.lines[0].linePrice).toBeNull();
    expect(order.lines[1]).toMatchObject({ quantity: 2, nameRaw: "caneca branca" });
  });

  it("keeps unmatched prose as notes", () => {
    const order = parseWhatsAppOrder(
      "2x Chaveiro Redondo - R$ 30.00\nNa cor rosa, por favor!"
    );

    expect(order.lines).toHaveLength(1);
    expect(order.notes).toEqual(["Na cor rosa, por favor!"]);
  });

  it("derives total from a single item", () => {
    const order = parseWhatsAppOrder("1x Garrafa Personalizada - R$ 45.00");

    expect(order.lines).toHaveLength(1);
    expect(order.total).toBe(45);
  });

  it("handles x with caption", () => {
    const order = parseWhatsAppOrder("1X Caneca Preta - R$ 55,00\n💰 Total: R$ 55,00");
    expect(order.lines[0]).toMatchObject({ quantity: 1, linePrice: 55 });
    expect(order.total).toBe(55);
  });
});