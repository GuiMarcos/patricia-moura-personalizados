"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product, CartItem, Customization, ProductVariant } from "@patricia-moura-personalizados/types";
import { unitPrice } from "@patricia-moura-personalizados/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, customization?: Customization, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

function newLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const hasCustomization = (c?: Customization) =>
    !!c && (!!c.note.trim() || c.images.length > 0);

  const addItem = useCallback((product: Product, customization?: Customization, variant?: ProductVariant) => {
    // Linha personalizada nunca agrupa: cada descrição/anexo é um pedido distinto
    if (hasCustomization(customization)) {
      setItems((current) => [
        ...current,
        { id: newLineId(), product, quantity: 1, customization, variant },
      ]);
      setIsOpen(true);
      return;
    }
    // Mesma variação agrupa; variação diferente = linha própria
    const lineId = variant ? `${product._id}::${variant.name}` : product._id;
    setItems((current) => {
      const existing = current.find((item) => item.id === lineId);
      if (existing) {
        return current.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { id: lineId, product, quantity: 1, variant }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      target?.customization?.images.forEach((img) =>
        URL.revokeObjectURL(img.previewUrl)
      );
      return current.filter((item) => item.id !== itemId);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.id !== itemId));
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems((current) => {
      current.forEach((item) =>
        item.customization?.images.forEach((img) =>
          URL.revokeObjectURL(img.previewUrl)
        )
      );
      return [];
    });
  }, []);

  const total = items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
