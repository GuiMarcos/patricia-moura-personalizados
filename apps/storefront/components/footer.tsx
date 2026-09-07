import Image from "next/image";
import { siteConfig } from "@patricia-moura-personalizados/config";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-primary-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logo.jpg"
            alt={siteConfig.name}
            width={640}
            height={418}
            className="h-14 w-auto rounded-lg"
          />
          <p className="text-cocoa">{siteConfig.description}</p>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cocoa hover:text-primary-600 transition"
          >
            <Instagram className="h-5 w-5" />
            Siga no Instagram
          </a>
          <p className="text-sm text-cocoa-light">
            &copy; 2026 {siteConfig.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
