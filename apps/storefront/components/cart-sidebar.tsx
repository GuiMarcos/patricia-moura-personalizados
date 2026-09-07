"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useCart } from "./cart-provider";
import { generateWhatsAppLink, type WhatsAppOrderItem } from "@mkt-digital/config";
import { unitPrice } from "@mkt-digital/types";

interface UploadedFile {
  name: string;
  url: string;
}

async function uploadImages(files: File[]): Promise<UploadedFile[]> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Falha ao enviar imagens.");
  }
  return data.files as UploadedFile[];
}

export function CartSidebar() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } =
    useCart();
  const [isSending, setIsSending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0 || isSending) return;
    setIsSending(true);
    setCheckoutError(null);
    try {
      // Sobe as imagens de referência de cada item personalizado
      const artworkByItem = new Map<string, string[]>();
      await Promise.all(
        items.map(async (item) => {
          const files = item.customization?.images.map((img) => img.file) ?? [];
          if (files.length === 0) return;
          const uploaded = await uploadImages(files);
          artworkByItem.set(item.id, uploaded.map((f) => f.url));
        })
      );

      const orderItems: WhatsAppOrderItem[] = items.map((item) => ({
        name: item.variant
          ? `${item.product.name} (${item.variant.name})`
          : item.product.name,
        price: unitPrice(item),
        quantity: item.quantity,
        note: item.customization?.note || undefined,
        artworkUrls: artworkByItem.get(item.id),
      }));

      window.open(generateWhatsAppLink(orderItems), "_blank", "noopener");
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Não foi possível finalizar. Tente de novo."
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-lg font-semibold">Carrinho</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Seu carrinho está vazio
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Img
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm">{item.product.name}</h3>
                        {item.variant && (
                          <p className="text-xs font-medium text-primary-700">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          R$ {unitPrice(item).toFixed(2)}
                        </p>
                      </div>

                      {item.customization && (
                        <div className="rounded-md bg-primary-50 p-2">
                          {item.customization.note && (
                            <p className="text-xs text-gray-700">
                              <span className="font-semibold">✏️ Ideia: </span>
                              {item.customization.note}
                            </p>
                          )}
                          {item.customization.images.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {item.customization.images.map((img) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={img.previewUrl}
                                  src={img.previewUrl}
                                  alt={img.name}
                                  title={img.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="rounded-full border p-1 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="rounded-full border p-1 hover:bg-gray-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            R$ {(unitPrice(item) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              {checkoutError && (
                <p className="text-center text-sm font-medium text-red-600">
                  {checkoutError}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSending}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 font-semibold text-white hover:bg-green-600 transition disabled:cursor-wait disabled:opacity-70"
              >
                {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSending
                  ? "Enviando imagens..."
                  : "Finalizar via WhatsApp"}
              </button>

              <button
                onClick={clearCart}
                className="block w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Limpar carrinho
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
