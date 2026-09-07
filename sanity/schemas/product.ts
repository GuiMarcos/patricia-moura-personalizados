import { defineType, defineField } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Produto",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Preço",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          { title: "Caneca", value: "caneca" },
          { title: "Camiseta", value: "camiseta" },
          { title: "Chaveiro", value: "chaveiro" },
          { title: "Garrafa", value: "garrafa" },
          { title: "Toalha", value: "toalha" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Imagens",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "customizable",
      title: "Personalizável",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "variants",
      title: "Variações",
      description: "Ex: alça tradicional vs. alça de coração. Vazio = produto sem variação.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nome",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "price",
              title: "Preço",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "price" },
          },
        },
      ],
    }),
    defineField({
      name: "featured",
      title: "Destaque",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category",
      media: "images.0",
    },
  },
});
