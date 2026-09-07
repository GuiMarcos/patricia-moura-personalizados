export type ProductCategory = "caneca" | "camiseta" | "chaveiro" | "garrafa" | "toalha";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: ProductImage[];
  customizable: boolean;
  featured: boolean;
  variants?: ProductVariant[];
}

export interface CustomizationImage {
  /** Nome original do arquivo */
  name: string;
  /** Arquivo selecionado (só existe no browser, antes do upload) */
  file: File;
  /** Preview local via URL.createObjectURL (só existe no browser) */
  previewUrl: string;
}

export interface Customization {
  /** Descrição do que o cliente quer que seja feito */
  note: string;
  /** Imagens de referência anexadas pelo cliente */
  images: CustomizationImage[];
}

export interface CartItem {
  /** Linha: product._id (+ ::variante) para simples, uuid para personalizados */
  id: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  customization?: Customization;
}

/** Preço unitário efetivo (variação ou base) */
export function unitPrice(item: Pick<CartItem, "product" | "variant">): number {
  return item.variant?.price ?? item.product.price;
}

export interface Order {
  _id: string;
  items: CartItem[];
  total: number;
  status: "pendente" | "confirmado" | "enviado" | "entregue";
  createdAt: string;
}
