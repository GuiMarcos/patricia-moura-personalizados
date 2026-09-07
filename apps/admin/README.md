# Admin - Painel Administrativo

Painel pra ver pedidos recebidos.

## Rodar

```bash
pnpm dev
```

Acessa http://localhost:3001

## Funcionalidades

- **Dashboard** com pedidos recentes
- **Lista de pedidos** com status
- **Link pro Sanity Studio** pra gerenciar produtos

## Estrutura

```
app/
├── layout.tsx          # Layout do admin
├── page.tsx            # Dashboard
└── pedidos/page.tsx    # Lista de pedidos
```

## Gerenciar Produtos

Os produtos são gerenciados pelo Sanity Studio, não por este painel.

Acesse o Studio pelo link na página inicial do admin ou rode:

```bash
pnpm studio
```
