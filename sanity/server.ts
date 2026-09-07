import { createClient, type SanityClient } from "next-sanity";

/**
 * Helpers EXCLUSIVOS do servidor (rotas API, seed).
 * Nunca importe este módulo em Client Components — o token não pode ir ao browser.
 */

export const MAX_UPLOAD_FILES = 6;
export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export interface UploadedReference {
  assetId: string;
  name: string;
  url: string;
}

export class UploadValidationError extends Error {}

/** Client com permissão de escrita. Lança erro legível se o env estiver faltando. */
export function getWriteClient(): SanityClient {
  const projectId =
    process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_STUDIO_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    "production";
  const token = process.env.SANITY_TOKEN;

  if (!projectId || projectId === "seu_project_id") {
    throw new Error("Sanity não configurado no servidor.");
  }
  if (!token) {
    throw new Error(
      "SANITY_TOKEN não configurado no servidor. Upload indisponível."
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    token,
    useCdn: false,
  });
}

/**
 * Valida e sobe imagens ao Sanity. Retorna assetId (p/ montar docs)
 * + url (p/ mensagens/previews).
 */
export async function uploadReferenceImages(
  files: File[]
): Promise<UploadedReference[]> {
  if (files.length === 0) throw new UploadValidationError("Nenhuma imagem enviada.");
  if (files.length > MAX_UPLOAD_FILES) {
    throw new UploadValidationError(`Máximo de ${MAX_UPLOAD_FILES} imagens por vez.`);
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new UploadValidationError(`"${file.name}" não é uma imagem.`);
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new UploadValidationError(`"${file.name}" excede 8MB.`);
    }
  }

  const client = getWriteClient();
  const uploaded: UploadedReference[] = [];
  for (const file of files) {
    const asset = await client.assets.upload("image", file, {
      filename: file.name,
      contentType: file.type,
    });
    uploaded.push({ assetId: asset._id, name: file.name, url: asset.url });
  }
  return uploaded;
}
