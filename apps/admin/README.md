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
- **Importar mensagem** do WhatsApp: cole o texto do pedido e o sistema identifica itens/cliente antes de criar
- **Exportar CSV** dos pedidos filtrados (compatível com Excel PT-BR)
- **Produtos**: cadastrar, editar e excluir com upload de imagens
- **Bot do Telegram**: encaminhe a mensagem do WhatsApp pro bot e confirme a criação pelo celular
- **Link pro Sanity Studio** pra gerenciar conteúdo

## Estrutura

```
app/
├── layout.tsx          # Layout do admin
├── page.tsx            # Dashboard
├── lib/stats.ts        # Agregados de pedidos
├── api/
│   ├── stats/          # GET: agregados p/ dashboard
│   ├── orders/         # POST: cria pedido · validate.ts: validação compartilhada
│   ├── orders/[id]/    # PATCH: altera status do pedido
│   └── telegram/webhook/ # Webhook do bot do Telegram
└── pedidos/
    ├── page.tsx            # Server: busca pedidos
    ├── orders-client.tsx   # Filtros, busca, ordenação
    ├── status-select.tsx   # Altera status com confirmação
    ├── export-button.tsx   # Exporta CSV
    ├── order-form.tsx      # Formulário criar/editar
    ├── import-form.tsx     # Parser "colar e parsear"
    ├── novo/               # Criar pedido
    ├── importar/           # Importar mensagem do WhatsApp
    └── [id]/editar/        # Editar pedido
```

## Importar pedidos do WhatsApp

Duas formas de entrar com pedidos fora do formatório do site.

### 1. Colar e parsear no painel

1. Em **Pedidos** clique em **Importar mensagem**
2. Cole a mensagem do WhatsApp (a que o site gera: `2x Produto - R$ 00.00` + `💰 Total`)
3. Clique em **Analisar mensagem**: o sistema identifica as linhas e casa com o catálogo (fuzzy via fuse.js)
4. Confira os itens, variações e o cliente, e clique em **Criar pedido**

Linhas que não casam com nenhum produto ficam com um selo vermelho — selecione o produto manualmente.

### 2. Bot do Telegram (encaminhamento manual)

Fluxo: você encaminha a mensagem do pedido pro chat do bot → o bot identifica os itens → responde o
resumo e pede confirmação → você toca **Confirmar** e o pedido é criado (status *pendente*).

**Setup (uma vez):**

1. No Telegram, fale com o [@BotFather](https://t.me/BotFather), crie o bot e copie o **token**
2. Descubra seu user id (ex.: fale com `@userinfobot`)
3. Preencha no `.env.prod` (e no painel da Vercel):
   - `TELEGRAM_BOT_TOKEN` — token do BotFather
   - `TELEGRAM_ADMIN_ID` — seu user id (só ele pode usar o bot)
   - `ADMIN_PUBLIC_URL` — URL pública do admin (ex.: `https://patricia-moura-personalizados-admin.vercel.app`)
4. Registre o webhook:
   ```bash
   pnpm telegram:webhook
   ```
5. Abra seu chat com o bot e mande `/start`, depois encaminhe um pedido

Notas:
- Se alguma linha da mensagem não casar com o catálogo, o bot NÃO cria — ele avisa qual linha falhou
  pra você reenviar (no painel dá pra criar com seleção manual).
- O rascunho fica gravado no Sanity (`orderDraft`) enquanto aguarda confirmação; é apagado ao
  confirmar ou cancelar.
- O webhook fica em `GET/POST /api/telegram/webhook`, liberado no middleware e validado por
  `from.id == TELEGRAM_ADMIN_ID`.

## Gerenciar Produtos

Os produtos podem ser gerenciados por este painel (aba Produtos) ou pelo Sanity Studio.

Acesse o Studio pelo link na página inicial do admin ou rode:

```bash
pnpm studio
```
