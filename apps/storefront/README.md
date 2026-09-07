# Storefront - Site Público

O site que os clientes veem. Catálogo de produtos com carrinho e checkout via WhatsApp.

## Rodar

```bash
pnpm dev
```

Acessa http://localhost:3002

## Funcionalidades

- **Home** com banner e produtos em destaque
- **Catálogo** com filtro por categoria
- **Detalhe do produto** com galeria
- **Carrinho** sidebar
- **Checkout WhatsApp** - gera mensagem pré-formatada
- **Link Instagram**

## Estrutura

```
app/
├── layout.tsx              # Layout raiz
├── page.tsx                # Home
├── globals.css             # Estilos globais
└── produtos/
    ├── page.tsx            # Catálogo
    └── [slug]/page.tsx     # Detalhe do produto

components/
├── navbar.tsx              # Menu superior
├── footer.tsx              # Rodapé
├── hero-section.tsx        # Banner principal
├── product-card.tsx        # Card do produto
├── product-grid.tsx        # Grid de produtos
├── product-detail.tsx      # Página do produto
├── category-filter.tsx     # Filtro de categorias
├── cart-provider.tsx       # Context do carrinho
├── cart-sidebar.tsx        # Sidebar do carrinho
└── instagram-banner.tsx    # Banner do Instagram
```

## Personalização

### Mudar número do WhatsApp

No `.env.local` da raiz (e nas env vars da Vercel):

```
NEXT_PUBLIC_WHATSAPP_NUMBER=5541996981425
```

Só dígitos (o `+55 (41) 99698-1425` também vale — os dígitos são extraídos).

### Mudar @ do Instagram

No `.env.local` da raiz (e nas env vars da Vercel):

```
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/patriciamourapersonalizados
```

### Mudar nome do site

Em `packages/config/index.ts`:

```ts
name: "Patrícia Moura Personalizados",
```

## Deploy

O Vercel faz deploy automático a cada push no GitHub.

Env vars necessárias no Vercel (mesmas chaves do `.env.prod` da raiz):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` = seu project id
- `NEXT_PUBLIC_SANITY_DATASET` = production
- `NEXT_PUBLIC_SITE_URL` = URL do deploy
