import { defineType, defineField } from "sanity";

export const orderSchema = defineType({
  name: "order",
  title: "Pedido",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Itens",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Produto",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantidade",
              type: "number",
              validation: (rule) => rule.min(1),
            }),
            defineField({
              name: "price",
              title: "Preço",
              type: "number",
            }),
            defineField({
              name: "variantName",
              title: "Variação",
              description: "Ex: Alça de Coração. Vazio = sem variação.",
              type: "string",
            }),
            defineField({
              name: "customNote",
              title: "Descrição da Personalização",
              type: "text",
            }),
            defineField({
              name: "artworkUrls",
              title: "Imagens de Referência",
              description: "Links das imagens enviadas pelo cliente.",
              type: "array",
              of: [{ type: "url" }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "total",
      title: "Total",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pendente", value: "pendente" },
          { title: "Confirmado", value: "confirmado" },
          { title: "Enviado", value: "enviado" },
          { title: "Entregue", value: "entregue" },
          { title: "Cancelado", value: "cancelado" },
        ],
        layout: "radio",
      },
      initialValue: "pendente",
    }),
    defineField({
      name: "customerNote",
      title: "Observação do Cliente",
      type: "text",
    }),
    defineField({
      name: "customerName",
      title: "Nome do Cliente",
      type: "string",
    }),
    defineField({
      name: "customerPhone",
      title: "Telefone do Cliente",
      type: "string",
    }),
    defineField({
      name: "customerAddress",
      title: "Endereço de Entrega",
      type: "text",
    }),
    defineField({
      name: "discountType",
      title: "Tipo de Desconto",
      type: "string",
      options: {
        list: [
          { title: "Sem desconto", value: "none" },
          { title: "Valor fixo (R$)", value: "fixed" },
          { title: "Percentual (%)", value: "percent" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
    defineField({
      name: "discountValue",
      title: "Valor do Desconto",
      description: "Em R$ se fixo, em % se percentual.",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "_id",
      subtitle: "status",
    },
  },
});
