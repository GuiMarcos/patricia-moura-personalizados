"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@patricia-moura-personalizados/types";
import { useCart } from "./cart-provider";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
          {product.customizable && (
            <span className="absolute left-2 top-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              Personalizável
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary-600">
              R$ {product.price.toFixed(2)}
            </p>
            {product.variants && product.variants.length > 0 && (
              <p className="text-xs text-gray-500">
                {product.variants.length} opções a partir desse valor
              </p>
            )}
          </div>
          {product.variants && product.variants.length > 0 ? (
            <Link
              href={`/produtos/${product.slug}`}
              aria-label={`Escolher variação de ${product.name}`}
              className="rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700 transition"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => addItem(product)}
              aria-label={`Adicionar ${product.name} ao carrinho`}
              className="rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700 transition"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
