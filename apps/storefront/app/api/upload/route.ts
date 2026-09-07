import { NextResponse } from "next/server";
import {
  uploadReferenceImages,
  UploadValidationError,
} from "@mkt-digital/sanity/server";

export const runtime = "nodejs";

/**
 * Recebe imagens de referência da personalização (multipart `files`)
 * e sobe para o Sanity. O token fica só no servidor — nunca vai ao browser.
 * Retorna [{ name, url }] para montar a mensagem do WhatsApp no checkout.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  try {
    const uploaded = await uploadReferenceImages(files);
    return NextResponse.json({
      files: uploaded.map(({ name, url }) => ({ name, url })),
    });
  } catch (err) {
    console.error("Falha no upload para o Sanity:", err);
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message =
      err instanceof Error ? err.message : "Falha ao enviar imagens.";
    const notConfigured = message.includes("não configurado");
    return NextResponse.json(
      {
        error: notConfigured
          ? "Upload indisponível no momento. Anexe as imagens direto no WhatsApp."
          : "Falha ao enviar imagens. Tente de novo ou anexe direto no WhatsApp.",
      },
      { status: 500 }
    );
  }
}
