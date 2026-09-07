import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: "Patrícia Moura Personalizados - Canecas, Camisetas e mais",
  description: "Produtos personalizados com seu nome, foto ou frase. Canecas, camisetas, chaveiros, garrafas e toalhas. Faça seu pedido pelo WhatsApp!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
