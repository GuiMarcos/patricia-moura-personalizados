"use client";

import Link from "next/link";
import { siteConfig } from "@patricia-moura-personalizados/config";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
            Canecas, camisetas, chaveiros e muito mais personalizados com carinho.
            Faça seu pedido pelo WhatsApp!
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/produtos"
              className="rounded-full bg-white px-8 py-3 font-semibold text-primary-600 shadow-lg hover:bg-primary-50 transition"
            >
              Ver Catálogo
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
