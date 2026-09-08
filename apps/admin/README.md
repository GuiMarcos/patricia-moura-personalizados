# Admin - Painel Administrativo

Painel pra ver pedidos recebidos.

## Rodar

```bash
pnpm dev
```

Acessa http://localhost:3001

## Funcionalidades

- **Dashboard** com total de pedidos, pendentes, receita total/mês e últimos pedidos
- **Lista de pedidos** com filtro por status, busca, ordenação e alteração de status (pendente → confirmado → enviado → entregue, ou cancelado)
- **Criar/editar pedidos** manuais com cliente (nome, telefone, endereço), itens do catálogo e desconto (fixo R$ ou %)
- **Exportar CSV** dos pedidos filtrados (compatível com Excel PT-BR)
- **Produtos**: cadastrar, editar e excluir com upload de imagens
- **Link pro Sanity Studio** pra gerenciar conteúdo

## Estrutura

```
app/
├── layout.tsx          # Layout do admin
├── page.tsx            # Dashboard
├── lib/stats.ts        # Agregados de pedidos
├── api/
│   ├── stats/          # GET: agregados p/ dashboard
│   └── orders/[id]/    # PATCH: altera status do pedido
└── pedidos/
    ├── page.tsx            # Server: busca pedidos
    ├── orders-client.tsx   # Filtros, busca, ordenação
    ├── status-select.tsx   # Altera status com confirmação
    └── export-button.tsx   # Exporta CSV
```

## Gerenciar Produtos

Os produtos podem ser gerenciados por este painel (aba Produtos) ou pelo Sanity Studio.

Acesse o Studio pelo link na página inicial do admin ou rode:

```bash
pnpm studio
```
