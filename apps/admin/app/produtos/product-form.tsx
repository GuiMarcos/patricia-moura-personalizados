"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Upload, X } from "lucide-react";
import {
  CATEGORIES,
  type AdminImage,
  type AdminProduct,
  type AdminVariant,
} from "@/app/lib/products";

const MAX_IMAGES = 6;
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

interface NewImage {
  file: File;
  previewUrl: string;
}

interface Props {
  initial?: AdminProduct;
}

export function ProductForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [category, setCategory] = useState(initial?.category ?? "caneca");
  const [customizable, setCustomizable] = useState(initial?.customizable ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [variants, setVariants] = useState<AdminVariant[]>(
    initial?.variants ?? []
  );
  const [existingImages, setExistingImages] = useState<AdminImage[]>(
    initial?.images ?? []
  );
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalImages = existingImages.length + newImages.length;

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    if (totalImages + picked.length > MAX_IMAGES) {
      setError(`Máximo de ${MAX_IMAGES} imagens por produto.`);
      return;
    }
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" não é uma imagem.`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" excede 8MB.`);
        return;
      }
    }
    setError(null);
    setNewImages((cur) => [
      ...cur,
      ...picked.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExisting = (assetId: string) =>
    setExistingImages((cur) => cur.filter((img) => img.assetId !== assetId));

  const removeNew = (previewUrl: string) =>
    setNewImages((cur) => {
      const target = cur.find((img) => img.previewUrl === previewUrl);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return cur.filter((img) => img.previewUrl !== previewUrl);
    });

  const updateVariant = (
    index: number,
    field: "name" | "price",
    value: string
  ) =>
    setVariants((cur) =>
      cur.map((v, i) =>
        i === index
          ? field === "name"
            ? { ...v, name: value }
            : { ...v, price: Number(value) || 0 }
          : v
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (name.trim().length < 3) return setError("Nome muito curto (mín. 3 letras).");
    if (description.trim().length < 10)
      return setError("Descrição muito curta (mín. 10 letras).");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setError("Preço inválido.");
    if (totalImages < 1) return setError("Adicione pelo menos 1 imagem.");

    setSaving(true);
    try {
      // 1. Sobe as imagens novas
      let uploaded: { assetId: string; url: string }[] = [];
      if (newImages.length > 0) {
        const form = new FormData();
        newImages.forEach((img) => form.append("files", img.file));
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Falha no upload das imagens.");
        uploaded = data.files;
      }

      // 2. Salva o produto
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        customizable,
        featured,
        variants: variants
          .filter((v) => v.name.trim())
          .map((v) => ({ name: v.name.trim(), price: v.price })),
        images: [
          ...existingImages.map((img) => img.assetId),
          ...uploaded.map((f) => f.assetId),
        ],
      };

      const url = isEdit ? `/api/products/${initial._id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar.");

      router.push("/produtos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          Nome *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Caneca Mágica Personalizada"
          className={inputCls}
        />
        {isEdit && (
          <p className="mt-1 text-xs text-gray-500">
            Slug: /{initial.slug} (não muda na edição)
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          Descrição *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Detalhes do produto, capacidade, material..."
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Preço (R$) *
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            placeholder="42.90"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Categoria *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={customizable}
            onChange={(e) => setCustomizable(e.target.checked)}
            className="h-4 w-4 accent-fuchsia-600"
          />
          ✨ Personalizável
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-fuchsia-600"
          />
          ★ Destaque na home
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">
            Variações (opcional)
          </span>
          <button
            type="button"
            onClick={() => setVariants((cur) => [...cur, { name: "", price: 0 }])}
            className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-xs text-gray-500">
            Ex: Alça Tradicional / Alça de Coração com preços diferentes.
          </p>
        ) : (
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(i, "name", e.target.value)}
                  placeholder="Nome (ex: Alça de Coração)"
                  className={inputCls}
                />
                <input
                  value={String(v.price)}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  inputMode="decimal"
                  placeholder="45.00"
                  className={`${inputCls} w-28`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setVariants((cur) => cur.filter((_, j) => j !== i))
                  }
                  aria-label="Remover variação"
                  className="rounded-lg border p-2 text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm font-semibold text-gray-800">
          Imagens * ({totalImages}/{MAX_IMAGES})
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 transition"
        >
          <Upload className="h-4 w-4" />
          Anexar imagens
        </button>
        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {existingImages.map((img) => (
              <div
                key={img.assetId}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExisting(img.assetId)}
                  aria-label="Remover imagem"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newImages.map((img) => (
              <div
                key={img.previewUrl}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-2 ring-primary-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNew(img.previewUrl)}
                  aria-label="Remover imagem nova"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition disabled:opacity-70"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/produtos")}
          className="rounded-full border px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
