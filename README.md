# Patrícia Moura Personalizados

Catálogo online de produtos personalizados com checkout via WhatsApp.

## Estrutura do Projeto

```
mkt-digital/
├── apps/
│   ├── storefront/          # Site público (port 3002)
│   └── admin/               # Painel admin (port 3001)
├── packages/
│   ├── types/               # Tipos TypeScript compartilhados
│   ├── config/              # Config WhatsApp, Instagram, categorias
│   └── sanity/              # Cliente Sanity, queries, schemas
├── sanity/
│   └── schemas/             # Produto e Pedido
├── .env.local               # Variáveis de ambiente (dev)
├── .env.prod                # Variáveis de ambiente (produção)
├── turbo.json               # Config Turborepo
└── pnpm-workspace.yaml
```

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15 + React 19 |
| Estilo | Tailwind CSS 3 |
| CMS | Sanity v3 |
| Monorepo | Turborepo + pnpm |
| Deploy | Vercel |

## Como Rodar

### Instalar dependências

```bash
pnpm install
```

### Rodar o site

```bash
pnpm dev
```

- Site público: http://localhost:3002
- Admin: http://localhost:3001

### Sanity Studio

```bash
pnpm studio
```

Acessa http://localhost:3333 pra gerenciar produtos.

## Produtos Cadastrados

| Produto | Categoria | Preço |
|---------|-----------|-------|
| Caneca Básica Branca Personalizável | Caneca | R$ 38,00 |
| Caneca Básica Colorida Personalizável | Caneca | R$ 40,00 |
| Caneca Mágica Personalizada | Caneca | R$ 48,00 |
| Caneca Jateada Personalizada | Caneca | R$ 42,90 |
| Camisa Poliéster Sublimada | Camiseta | R$ 44,90 |
| Camisa Algodão Personalizada | Camiseta | R$ 39,90 |
| Chaveiro Retangular Personalizado | Chaveiro | R$ 4,00 |
| Chaveiro Redondo Personalizado | Chaveiro | R$ 4,00 |
| Garrafa Térmica Personalizada | Garrafa | R$ 44,90 |
| Toalha Personalizada | Toalha | R$ 23,00 |

## Variáveis de Ambiente

Todos os envs ficam só na raiz (não há `.env` dentro de `sanity/` nem de `apps/`).
O `scripts/with-env.js` carrega o arquivo certo e injeta nos comandos:

| Arquivo      | Quando usa                        |
|--------------|-----------------------------------|
| `.env.local` | dev: `pnpm dev`, `pnpm studio`, `pnpm seed` |
| `.env.prod`  | prod: `pnpm build`, `pnpm studio:deploy`, `pnpm seed:prod` |

```
SANITY_STUDIO_PROJECT_ID=seu_project_id
SANITY_STUDIO_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=seu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_WHATSAPP_NUMBER=5541996981425
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/patriciamourapersonalizados
SANITY_TOKEN=seu_token
ADMIN_PASSWORD=sua_senha_forte_do_painel_admin
```

Veja o `.env.example` como modelo. Para testar a build de prod localmente
sem mexer nos arquivos: `APP_ENV=prod pnpm dev`.

## Deploy no Vercel

São 2 projetos (storefront e admin). Crie um projeto Vercel para cada,
apontando para o mesmo repositório mas com **Root Directory** diferente
(`apps/storefront` e `apps/admin`).

1. Criar conta no [vercel.com](https://vercel.com)
2. Enviar código pro GitHub
3. Importar o repositório 2x (um projeto por app, com Root Directory próprio)
4. Configurar env vars em cada projeto (mesmas chaves do `.env.prod`):
   - `SANITY_STUDIO_PROJECT_ID` = seu project id
   - `SANITY_STUDIO_DATASET` = production
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = seu project id
   - `NEXT_PUBLIC_SANITY_DATASET` = production
   - `NEXT_PUBLIC_SITE_URL` = URL do deploy daquele projeto
     (loja: https://patricia-moura-personalizados-store.vercel.app)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = 5541996981425
   - `NEXT_PUBLIC_INSTAGRAM_URL` = URL do Instagram
   - `SANITY_TOKEN` = token com permissão de escrita (upload de imagens + admin)
   - `ADMIN_PASSWORD` = senha forte do painel (**só precisa no projeto admin**, mas pode repetir)
5. Deploy

O admin exige login com a `ADMIN_PASSWORD` em todas as páginas e APIs.

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Rodar site + admin (com `.env.local`) |
| `pnpm build` | Build de produção (com `.env.prod`) |
| `pnpm studio` | Abrir Sanity Studio |
| `pnpm seed` | Criar produtos no Sanity (dev) |
| `pnpm seed:prod` | Criar produtos no Sanity (prod) |
