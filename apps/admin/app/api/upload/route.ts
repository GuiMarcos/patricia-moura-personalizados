import { NextResponse } from "next/server";
import {
  uploadReferenceImages,
  UploadValidationError,
} from "@patricia-moura-personalizados/sanity/server";

export const runtime = "nodejs";

/** Sobe imagens e devolve assetId + url (o form usa assetId ao salvar). */
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
    return NextResponse.json({ files: uploaded });
  } catch (err) {
    console.error("Falha no upload (admin):", err);
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Falha ao enviar imagens.",
      },
      { status: 500 }
    );
  }
}
