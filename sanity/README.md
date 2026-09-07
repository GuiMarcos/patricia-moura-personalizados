# Sanity - Gerenciamento de Produtos

## Configuração

1. Criar projeto no [sanity.io](https://sanity.io)
2. Pegar o `projectId` e colocar no `.env.local` da raiz (veja o `.env.example`)
3. Criar um token com permissão **Editor** em API > Tokens e colocar em `SANITY_TOKEN`

## Rodar o Studio

```bash
pnpm studio
```

Acessa <http://localhost:3333>

## Criar Produtos

1. No Studio, clique em **Produto**
2. Clique em **Create new**
3. Preencha:
   - **Nome**: ex "Caneca Básica Branca"
   - **Slug**: gera automático
   - **Descrição**: detalhes do produto
   - **Preço**: valor em reais
   - **Categoria**: selecione (caneca, camiseta, chaveiro, garrafa, toalha)
   - **Imagens**: arraste suas fotos
   - **Personalizável**: marque se sim
   - **Destaque**: marque pra aparecer na home
4. Clique em **Publish**

## Rodar o Seed (produtos de exemplo)

```bash
pnpm seed
```

Cria produtos com imagens de placeholder. Depois é só editar as imagens no Studio.

## Variáveis de Ambiente

Não há `.env` nesta pasta — tudo fica no `.env.local` / `.env.prod` da raiz
(carregados automaticamente pelo `pnpm studio`, `pnpm seed`, etc.):

```
SANITY_STUDIO_PROJECT_ID=seu_project_id
SANITY_STUDIO_DATASET=production
SANITY_TOKEN=seu_token
```

## Deploy do Studio

```bash
pnpm studio:deploy
```

Sobe o Studio em `https://patricia-moura-personalizados.sanity.studio`
