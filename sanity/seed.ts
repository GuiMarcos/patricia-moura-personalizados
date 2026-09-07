import dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "next-sanity";

// Fallback para rodar direto via `cd sanity && pnpm seed`.
// O caminho oficial é `pnpm seed` na raiz (scripts/with-env.js já injeta o env).
const useProd =
  process.env.APP_ENV === "prod" || process.env.NODE_ENV === "production";
dotenv.config({
  path: resolve(__dirname, useProd ? "../.env.prod" : "../.env.local"),
});

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_TOKEN;

if (!projectId || projectId === "seu_project_id") {
  console.error("❌ Configure SANITY_STUDIO_PROJECT_ID no .env.local da raiz");
  process.exit(1);
}

if (!token) {
  console.error("❌ Configure SANITY_TOKEN no .env.local da raiz (token com permissão de Editor)");
  process.exit(1);
}

const FRESH = process.argv.includes("--fresh");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
});

/** Slug sem acentos: "Camisa Poliéster" -> "camisa-poliester" */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Imagens placeholder - cores por categoria
const placeholderImages: Record<string, { color: string; text: string }> = {
  caneca: { color: "f0abfc", text: "Caneca" },
  camiseta: { color: "e879f9", text: "Camiseta" },
  chaveiro: { color: "fbbf24", text: "Chaveiro" },
  garrafa: { color: "34d399", text: "Garrafa" },
  toalha: { color: "60a5fa", text: "Toalha" },
};

interface ProductVariantSeed {
  name: string;
  price: number;
}

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  category: "caneca" | "camiseta" | "chaveiro" | "garrafa" | "toalha";
  customizable: boolean;
  featured: boolean;
  placeholderText: string;
  variants?: ProductVariantSeed[];
}

const products: ProductSeed[] = [
  {
    name: "Caneca Básica Branca Personalizável",
    description: "Caneca de porcelana branca, perfeita para personalizar com sua foto ou frase. Capacidade de 325ml.",
    price: 38,
    category: "caneca",
    customizable: true,
    featured: true,
    placeholderText: "Caneca\nBranca",
  },
  {
    name: "Caneca Básica Colorida Personalizável",
    description: "Caneca de porcelana em diversas cores para personalizar. Capacidade de 325ml.",
    price: 40,
    category: "caneca",
    customizable: true,
    featured: false,
    placeholderText: "Caneca\nColorida",
  },
  {
    name: "Caneca Mágica Personalizada",
    description: "Caneca mágica que revela conteúdo com líquido quente! Surpreenda com uma mensagem ou imagem. 325ml.",
    price: 48,
    category: "caneca",
    customizable: true,
    featured: true,
    placeholderText: "Caneca\nMágica ✨",
  },
  {
    name: "Caneca Jateada Personalizada",
    description: "Caneca de vidro jateado com acabamento fosco. Escolha a alça: tradicional ou de coração. 325ml.",
    price: 42.9,
    category: "caneca",
    customizable: true,
    featured: false,
    placeholderText: "Caneca\nJateada",
    variants: [
      { name: "Alça Tradicional", price: 42.9 },
      { name: "Alça de Coração", price: 45 },
    ],
  },
  {
    name: "Camisa Poliéster Sublimada",
    description: "Camisa de poliéster com sublimação total. Cores vivas que não desbotam. Ideal para times e eventos.",
    price: 44.9,
    category: "camiseta",
    customizable: true,
    featured: true,
    placeholderText: "Camisa\nSublimada",
  },
  {
    name: "Camisa Algodão Personalizada",
    description: "Camisa de algodão 100% premium. Conforto e qualidade para o dia a dia.",
    price: 39.9,
    category: "camiseta",
    customizable: true,
    featured: false,
    placeholderText: "Camisa\nAlgodão",
  },
  {
    name: "Chaveiro Retangular Personalizado",
    description: "Chaveiro retangular de acrílico com foto ou frase. Tamanho: 5x8cm.",
    price: 4,
    category: "chaveiro",
    customizable: true,
    featured: false,
    placeholderText: "Chaveiro\nRetangular",
  },
  {
    name: "Chaveiro Redondo Personalizado",
    description: "Chaveiro redondo de acrílico com foto ou frase. Tamanho: 5cm diâmetro.",
    price: 4,
    category: "chaveiro",
    customizable: true,
    featured: false,
    placeholderText: "Chaveiro\nRedondo",
  },
  {
    name: "Garrafa Térmica Personalizada",
    description: "Garrafa térmica de aço inox com personalização. Mantém a temperatura por até 12h. Capacidade: 500ml.",
    price: 44.9,
    category: "garrafa",
    customizable: true,
    featured: true,
    placeholderText: "Garrafa\nTérmica",
  },
  {
    name: "Toalha Personalizada",
    description: "Toalha de algodão felpudo com bordado ou estampa personalizada. Tamanho: 30x50cm.",
    price: 23,
    category: "toalha",
    customizable: true,
    featured: false,
    placeholderText: "Toalha\nPersonalizada",
  },
];

async function uploadPlaceholderImage(
  slug: string,
  text: string,
  bgColor: string,
  textColor: string = "701a75"
): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } }> {
  // Gera uma imagem SVG como placeholder
  const svg = `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#${bgColor}"/>
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">${text.split("\n")[0]}</text>
    <text x="50%" y="58%" font-family="Arial, sans-serif" font-size="36" fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">${text.split("\n")[1] || ""}</text>
  </svg>`;

  const buffer = Buffer.from(svg, "utf-8");

  const asset = await client.assets.upload("image", buffer, {
    filename: `${slug}.svg`,
    contentType: "image/svg+xml",
  });

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
  };
}

async function wipeProducts(): Promise<number> {
  const ids: string[] = await client.fetch(`*[_type == "product"]._id`);
  if (ids.length === 0) {
    console.log("   (nenhum produto existente)");
    return 0;
  }
  const tx = client.transaction();
  ids.forEach((id) => tx.delete(id));
  await tx.commit();
  return ids.length;
}

async function seed() {
  if (FRESH) {
    console.log("🧹 Apagando produtos existentes...\n");
    const removed = await wipeProducts();
    console.log(`   🗑️  ${removed} produto(s) apagado(s).\n`);
  }

  console.log("🚀 Iniciando seed dos produtos...\n");

  for (const product of products) {
    console.log(`📦 Criando: ${product.name}...`);

    const slug = slugify(product.name);
    const placeholder = placeholderImages[product.category];
    const image = await uploadPlaceholderImage(
      slug,
      product.placeholderText,
      placeholder.color
    );

    const doc: Record<string, unknown> = {
      _type: "product",
      name: product.name,
      slug: { _type: "slug", current: slug },
      description: product.description,
      price: product.price,
      category: product.category,
      images: [image],
      customizable: product.customizable,
      featured: product.featured,
    };
    if (product.variants?.length) {
      doc.variants = product.variants.map((v) => ({
        _key: slugify(v.name),
        name: v.name,
        price: v.price,
      }));
    }

    const created = await client.create(doc);
    console.log(`   ✅ Criado: ${created._id}`);
  }

  console.log("\n🎉 Seed concluído! Acesse o Sanity Studio para ver os produtos.");
  console.log("   Não esqueça de substituir as imagens de placeholder pelas suas fotos reais!");
}

seed().catch((err) => {
  console.error("❌ Erro durante o seed:", err);
  process.exit(1);
});
