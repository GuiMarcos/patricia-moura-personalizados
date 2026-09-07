import { Instagram } from "lucide-react";
import { siteConfig } from "@patricia-moura-personalizados/config";

export function InstagramBanner() {
  return (
    <section className="bg-primary-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <Instagram className="mx-auto h-12 w-12 text-primary-500" />
        <h2 className="mt-4 text-2xl font-bold text-primary-500">Siga no Instagram</h2>
        <p className="mt-2 text-cocoa">
          Acompanhe nossos novos produtos e promoções!
        </p>
        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-primary-600 px-8 py-3 font-semibold text-white shadow-lg hover:bg-primary-700 transition"
        >
          @patriciamourapersonalizados
        </a>
      </div>
    </section>
  );
}
