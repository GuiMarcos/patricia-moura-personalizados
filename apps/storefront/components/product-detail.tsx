"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Upload, X, Minus, Plus, ArrowLeft } from "lucide-react";
import type { Product, CustomizationImage } from "@patricia-moura-personalizados/types";
import { useCart } from "./cart-provider";
import { siteConfig } from "@patricia-moura-personalizados/config";

const MAX_IMAGES = 6;
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const variants = product.variants ?? [];
  const [variantName, setVariantName] = useState(variants[0]?.name ?? "");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<CustomizationImage[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVariant =
    variants.find((v) => v.name === variantName) ?? variants[0];
  const displayPrice = selectedVariant?.price ?? product.price;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList);

    if (images.length + picked.length > MAX_IMAGES) {
      setFormError(`Máximo de ${MAX_IMAGES} imagens por produto.`);
      return;
    }
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setFormError(`"${file.name}" não é uma imagem.`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setFormError(`"${file.name}" excede 8MB.`);
        return;
      }
    }
    setFormError(null);
    setImages((current) => [
      ...current,
      ...picked.map((file) => ({
        name: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (previewUrl: string) => {
    setImages((current) => {
      const target = current.find((img) => img.previewUrl === previewUrl);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((img) => img.previewUrl !== previewUrl);
    });
  };

  const clampQty = (q: number) => Math.min(99, Math.max(1, Math.floor(q) || 1));

  const handleAdd = () => {
    if (product.customizable && (note.trim() || images.length > 0)) {
      // As previewUrls passam a pertencer ao carrinho (ele libera ao remover)
      addItem(product, { note: note.trim(), images }, selectedVariant, quantity);
    } else {
      addItem(product, undefined, selectedVariant, quantity);
    }
    setNote("");
    setImages([]);
    setFormError(null);
  };

  const inquiryText = selectedVariant
    ? `Olá! Tenho interesse no produto: ${product.name} (${selectedVariant.name}) - R$ ${displayPrice.toFixed(2)}`
    : `Olá! Tenho interesse no produto: ${product.name} - R$ ${displayPrice.toFixed(2)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/produtos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para produtos
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {product.images[0] && (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-primary-50">
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg bg-primary-50"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary-600 capitalize">
            {product.category}
          </span>

          <h1 className="mt-2 text-3xl font-bold text-primary-500">{product.name}</h1>

          <p className="mt-4 text-cocoa">{product.description}</p>

          {variants.length > 0 && (
            <div className="mt-4">
              <span className="mb-2 block text-sm font-semibold text-cocoa">
                Escolha a variação:
              </span>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const active = v.name === selectedVariant?.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setVariantName(v.name)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-primary-200 bg-white text-cocoa hover:border-primary-400 hover:text-primary-600"
                      }`}
                    >
                      {v.name} · R$ {v.price.toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.customizable && (
            <div className="mt-4 rounded-lg bg-primary-50 p-3">
              <p className="text-sm text-primary-700">
                ✨ Este produto é personalizável! Descreva sua ideia abaixo.
              </p>
            </div>
          )}

          {product.customizable && (
            <div className="mt-4 space-y-3 rounded-xl border border-dashed border-primary-300 bg-primary-50/50 p-4">
              <div>
                <label
                  htmlFor="custom-note"
                  className="mb-1 block text-sm font-semibold text-cocoa"
                >
                  O que você quer que seja feito?
                </label>
                <textarea
                  id="custom-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder='Ex: "Quero a foto do meu filho com o nome Enzo e fundo azul"'
                  className="w-full resize-y rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-cocoa placeholder:text-cocoa-light focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <span className="mb-1 block text-sm font-semibold text-cocoa">
                  Imagens de referência ({images.length}/{MAX_IMAGES})
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2.5 text-sm font-medium text-cocoa hover:border-primary-400 hover:text-primary-600 transition"
                >
                  <Upload className="h-4 w-4" />
                  Anexar imagens
                </button>
                <p className="mt-1 text-xs text-cocoa-light">
                  PNG, JPG ou WEBP de até 8MB cada.
                </p>

                {formError && (
                  <p className="mt-1 text-xs font-medium text-red-600">{formError}</p>
                )}

                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {images.map((img) => (
                      <div
                        key={img.previewUrl}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-primary-50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.previewUrl)}
                          aria-label={`Remover ${img.name}`}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full border border-primary-200 bg-white px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => clampQty(q - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuir quantidade"
                className="rounded-full p-1.5 text-cocoa hover:bg-primary-50 disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(clampQty(Number(e.target.value)))}
                aria-label="Quantidade"
                className="w-10 bg-transparent text-center text-sm font-semibold text-cocoa focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => clampQty(q + 1))}
                disabled={quantity >= 99}
                aria-label="Aumentar quantidade"
                className="rounded-full p-1.5 text-cocoa hover:bg-primary-50 disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-3xl font-bold text-primary-600">
              R$ {(displayPrice * quantity).toFixed(2)}
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-full bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </button>
          </div>

          <div className="mt-4">
            <a
              href={`https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(inquiryText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full border-2 border-green-500 py-3 text-center font-semibold text-green-600 hover:bg-green-50 transition"
            >
              Tirar Dúvidas no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
