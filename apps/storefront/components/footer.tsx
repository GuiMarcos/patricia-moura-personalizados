import Image from "next/image";
import { siteConfig } from "@mkt-digital/config";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logo.jpg"
            alt={siteConfig.name}
            width={640}
            height={418}
            className="h-14 w-auto rounded-lg"
          />
          <p className="text-gray-600">{siteConfig.description}</p>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition"
          >
            <Instagram className="h-5 w-5" />
            Siga no Instagram
          </a>
          <p className="text-sm text-gray-500">
            &copy; 2026 {siteConfig.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
