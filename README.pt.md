# Desafio Técnico Senior Backend — Refatoração do Checkout

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/cristhian-lean-tech/senior-backend-challenge)

> 🌐 [English](./README.md) · [Español](./README.es.md) · **Português**

**Stack:** Node.js · Express · TypeScript
**Tempo estimado:** 2–3 horas
**Cargo:** Senior Backend Developer

---

## Contexto

Entregamos a você um endpoint funcional em Express que processa um pedido de compra.
Embora o código atenda aos requisitos atuais, **toda a lógica de negócio e as regras de
desconto estão fortemente acopladas dentro do controller principal**. Isso viola os
princípios SOLID e dificulta a escalabilidade e a manutenção.

A aplicação inteira está em um único arquivo: [`src/index.ts`](./src/index.ts).

## Sua missão

Reestruturar a solução aplicando sua experiência em arquitetura de software (Clean
Architecture, Hexagonal ou similar) e boas práticas de design.

**O comportamento observável da API não pode mudar.** A suíte de aceitação é a sua rede de
segurança: ela precisa continuar verde a cada passo.

## Requisitos

### 1. Separação de responsabilidades
Extraia a lógica de negócio da rota do Express para uma estrutura adequada de pastas e
classes (ex.: casos de uso, handlers, domínio). A camada HTTP deve apenas traduzir entre o
HTTP e a sua camada de aplicação.

### 2. Padrão Strategy
O cálculo de descontos hoje usa blocos `if/else`. Refatore essa parte implementando o
padrão **Strategy**, de modo que adicionar um novo desconto não exija modificar o código
existente.

### 3. Injeção de dependências
Use injeção de dependências **manual** (sem frameworks ou containers adicionais) para
conectar o inventário mock, as estratégias de desconto, a lógica de negócio e o controller
HTTP.

### 4. TypeScript
Aplique tipagem estrita e defina as interfaces/tipos necessários para estabelecer contratos
claros no seu domínio. `npm run typecheck` precisa passar: o modo `strict` já está ativado e
`any` não é um contrato.

## Regras e restrições

- **Não altere o contrato HTTP público** (rotas, status codes, formato das respostas).
- **Não modifique `tests/acceptance/`.** Adicionar seus próprios testes em qualquer outro
  lugar é incentivado (`src/**/*.spec.ts` é detectado automaticamente).
- Mantenha o inventário como um mock em memória — nada de banco de dados real.
- Sem containers de DI (`tsyringe`, `inversify`, …). A ligação manual faz parte do exercício.
- Você pode adicionar dependências de desenvolvimento (linter, formatter, helpers de teste)
  se justificá-las.
- Qualquer arquivo dentro de `src/` pode ser movido, renomeado ou apagado. O `npm start`
  precisa continuar subindo o servidor HTTP e respeitando `process.env.PORT`.

## Como começar

### Gitpod (recomendado)

Clique no botão **Open in Gitpod** acima. As dependências são instaladas automaticamente e
a API sobe na porta `3000`.

### Local

```bash
npm install
npm run dev     # http://localhost:3000
npm test
```

Requer Node.js 20+.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm start` | Sobe o servidor HTTP (usado pela suíte de aceitação) |
| `npm run dev` | Sobe o servidor em modo watch |
| `npm test` | Roda a suíte de aceitação mais os testes que você adicionar |
| `npm run test:watch` | O mesmo, em modo watch |
| `npm run typecheck` | `tsc --noEmit` com modo estrito |
| `npm run build` | Compila para `dist/` |

## A suíte de aceitação

`tests/acceptance/checkout.spec.ts` é **caixa-preta**: ela sobe a aplicação através do
`npm start` e conversa com ela por HTTP. Nunca importa os seus arquivos-fonte, então você
pode reestruturar `src/` como quiser sem tocar em um único teste.

Se um teste falhar, a sua refatoração mudou o comportamento observável. Isso é uma
regressão, não uma melhoria.

## Contrato da API

Inventário mock (estoque): `prod-1: 10`, `prod-2: 5`, `prod-3: 0`.

`POST /api/checkout`

```jsonc
// request
{
  "products": [
    { "id": "prod-1", "price": 100, "requestedQuantity": 2 }
  ],
  "discountCode": "10PERCENT" // opcional
}
```

| Caso | Status | Body |
| --- | --- | --- |
| Pedido válido | `200` | `{ "totalToPay": number }` |
| `products` ausente ou não é um array | `400` | `{ "error": string }` |
| Quantidade solicitada acima do estoque (ou produto inexistente) | `400` | `{ "error": "...<id do produto>..." }` |
| Falha inesperada | `500` | `{ "error": string }` |

Códigos de desconto: `10PERCENT` (10% sobre o total) e `MINUS10` (subtrai 10 do total).
Qualquer outro código é ignorado e o total permanece inalterado.

Veja [`requests.http`](./requests.http) para exemplos prontos para executar.

## Entrega

1. Use o botão **Use this template** no GitHub (ou faça um fork) para criar a sua própria cópia.
2. Trabalhe em uma branch, com commits que contem uma história — nós lemos o histórico.
3. Adicione um `DECISIONS.md` na raiz explicando:
   - qual arquitetura você escolheu e **por quê**,
   - quais trade-offs aceitou e o que deixou de fora de propósito,
   - como adicionaria uma nova regra de desconto (ex.: `FREESHIPPING`),
   - o que faria em seguida com mais tempo.
4. Abra um pull request neste repositório, ou compartilhe o link do seu repositório.

## Como avaliamos

| Área | O que observamos |
| --- | --- |
| Arquitetura | Camadas claras, dependências apontando para dentro, domínio sem Express |
| Padrão Strategy | Open/Closed: um novo desconto é um arquivo novo, não um `if` editado |
| Injeção de dependências | Composition root explícito, dependências invertidas via interfaces |
| TypeScript | Contratos precisos, sem `any` como escape, bordas validadas |
| Testes | Testes unitários relevantes no domínio e nas estratégias, aceitação verde |
| Comunicação | Histórico de commits e `DECISIONS.md` que expliquem o raciocínio |

Over-engineering não conta ponto. Preferimos um design pequeno e coerente que você consiga
defender a uma pilha de padrões aplicados por reflexo.

Boa sorte! 🚀
