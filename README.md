# Senior Backend Challenge — Checkout Refactoring

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/cristhian-lean-tech/senior-backend-challenge)

> 🇪🇸 Español: [README.es.md](./README.es.md)

**Stack:** Node.js · Express · TypeScript
**Estimated time:** 2–3 hours
**Role:** Senior Backend Developer

---

## Context

You are given a working Express endpoint that processes a purchase order. It meets the
current requirements, but **all the business logic and the discount rules live inside the
HTTP controller**. It violates SOLID, it is hard to test in isolation, and every new
discount means touching the same `if/else` chain.

The whole application is in a single file: [`src/index.ts`](./src/index.ts).

## Your mission

Restructure the solution applying your software architecture experience (Clean
Architecture, Hexagonal, or a similar approach) and sound design practices.

**The observable behaviour of the API must not change.** The acceptance suite is your
safety net — it must stay green at every step.

## Requirements

### 1. Separation of concerns
Extract the business logic out of the Express route into a proper folder and class
structure (e.g. use cases, handlers, domain). The HTTP layer should only translate
between HTTP and your application layer.

### 2. Strategy pattern
Discount calculation currently uses `if/else` blocks. Refactor it using the **Strategy**
pattern so that adding a new discount does not require modifying existing code.

### 3. Dependency injection
Use **manual** dependency injection (no additional frameworks or containers) to wire the
mock inventory, the discount strategies, the business logic and the HTTP controller.

### 4. TypeScript
Apply strict typing and define the interfaces/types needed to establish clear contracts
in your domain. `npm run typecheck` must pass — `strict` mode is already enabled and
`any` is not a contract.

## Rules and constraints

- **Do not change the public HTTP contract** (routes, status codes, response shapes).
- **Do not modify `tests/acceptance/`.** You are encouraged to add your own tests
  anywhere else (`src/**/*.spec.ts` is picked up automatically).
- Keep the inventory as an in-memory mock — no real database.
- No DI containers (`tsyringe`, `inversify`, …). Manual wiring is part of the exercise.
- You may add dev dependencies (linter, formatter, test helpers) if you justify them.
- Every file inside `src/` can be moved, renamed or deleted. `npm start` must keep
  booting the HTTP server and must keep honouring `process.env.PORT`.

## Getting started

### Gitpod (recommended)

Click the **Open in Gitpod** button above. Dependencies are installed automatically and
the API starts on port `3000`.

### Local

```bash
npm install
npm run dev     # http://localhost:3000
npm test
```

Requires Node.js 20+.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Boots the HTTP server (used by the acceptance suite) |
| `npm run dev` | Boots the server in watch mode |
| `npm test` | Runs the acceptance suite plus any test you add |
| `npm run test:watch` | Same, in watch mode |
| `npm run typecheck` | `tsc --noEmit` with strict mode |
| `npm run build` | Compiles to `dist/` |

## The acceptance suite

`tests/acceptance/checkout.spec.ts` is **black box**: it boots the app through
`npm start` and talks to it over HTTP. It never imports your source files, so you can
restructure `src/` however you want without touching a single test.

If a test fails, your refactor changed observable behaviour. That is a regression, not
an improvement.

## API contract

Mock inventory (stock): `prod-1: 10`, `prod-2: 5`, `prod-3: 0`.

`POST /api/checkout`

```jsonc
// request
{
  "products": [
    { "id": "prod-1", "price": 100, "requestedQuantity": 2 }
  ],
  "discountCode": "10PERCENT" // optional
}
```

| Case | Status | Body |
| --- | --- | --- |
| Valid order | `200` | `{ "totalToPay": number }` |
| `products` missing or not an array | `400` | `{ "error": string }` |
| Requested quantity above stock (or unknown product) | `400` | `{ "error": "...<product id>..." }` |
| Unexpected failure | `500` | `{ "error": string }` |

Discount codes: `10PERCENT` (10% off the total), `MINUS10` (flat 10 off the total). Any
other code is ignored and the total stays untouched.

See [`requests.http`](./requests.http) for ready-to-run examples.

## Deliverable

1. Fork this repository (or create a repository from it).
2. Work on a branch, committing in meaningful steps — we read the history.
3. Add a `DECISIONS.md` at the root explaining:
   - the architecture you chose and **why**,
   - the trade-offs you accepted and what you deliberately left out,
   - how you would add a new discount rule (e.g. `FREESHIPPING`),
   - what you would do next with more time.
4. Open a pull request against this repository, or share the link to your fork.

## How we evaluate

| Area | What we look for |
| --- | --- |
| Architecture | Clear layers, dependencies pointing inwards, domain free of Express |
| Strategy pattern | Open/Closed — a new discount is a new file, not an edited `if` |
| Dependency injection | Explicit composition root, dependencies inverted through interfaces |
| TypeScript | Precise contracts, no `any` escape hatches, validated boundaries |
| Testing | Meaningful unit tests on domain and strategies, acceptance suite green |
| Communication | Commit history and `DECISIONS.md` that explain the reasoning |

Over-engineering is not a plus. We would rather see a small, coherent design you can
defend than a stack of patterns applied by reflex.

Good luck. 🚀
