# Evaluation Guide (for the interviewer)

> This file is for whoever reviews the submission. The rubric is intentionally public:
> knowing the criteria does not solve the exercise. If you prefer a blind evaluation,
> delete this file before sharing the repository.

## What the exercise actually measures

The refactor is mechanical enough that any mid-level developer can produce *something*.
What separates a senior is **where they draw the boundaries, what they refuse to do, and
how they explain it**.

## Scoring (100 points)

| Area | Weight | Looks like a pass | Looks like a strong senior |
| --- | --- | --- | --- |
| Separation of concerns | 25 | Logic moved out of the route into a use case | Domain has zero knowledge of Express/HTTP; controller only maps in/out; composition root isolated |
| Strategy pattern | 20 | A `DiscountStrategy` interface with two implementations | Strategies resolved through a registry/factory injected as a port; adding `FREESHIPPING` touches no existing file |
| Dependency injection | 20 | Constructor injection, wiring in a single file | Depends on interfaces owned by the domain, not on concrete adapters; inventory behind a repository port; easy to swap for a fake in tests |
| TypeScript contracts | 15 | `strict` passes, explicit types on public methods | Unknown input narrowed at the boundary, no `any`, domain types that make invalid states hard to express |
| Testing | 10 | Acceptance suite still green | Unit tests on the use case and each strategy using injected fakes — proof the seams are real |
| Communication | 10 | `DECISIONS.md` exists | Honest trade-offs, explicit scope cuts, names the smells they chose not to fix and why |

**Suggested bar:** ≥ 75 strong hire · 60–74 discuss · < 60 no hire.

## Green flags

- Inventory reached through a port (e.g. `InventoryRepository`) instead of importing a module-level object.
- The use case returns a result/domain error and the controller decides the status code.
- Discount resolution is data-driven (map/registry), and an unknown code resolves to a `NoDiscount` null-object instead of an `if` fallback.
- They notice the base code **trusts `price` coming from the client** and either fix it or flag it in `DECISIONS.md`.
- They notice the endpoint **never reserves or decrements stock** and that duplicated product ids are not aggregated.
- Commits tell a story: behaviour-preserving steps, suite green at each one.
- They validate the request body at the edge and keep the domain free of validation noise.

## Red flags

- Same `if/else`, now in another file, wearing the word "Strategy".
- Folders named `services/`, `helpers/`, `utils/` holding the same procedural code.
- Domain classes importing `express`, `Request` or `Response`.
- A hand-rolled DI container — the brief explicitly asked for manual wiring.
- `any`, `as unknown as`, or turning off `strict` to make it compile.
- Modified or deleted acceptance tests.
- Changed the HTTP contract "to make it cleaner" (e.g. `201`, renamed `totalToPay`).
- Zero tests of their own, or tests that just re-test the framework.

## Smells deliberately left in the base code

Do not require them to be fixed — the brief is about structure. Use them as conversation
starters, and reward candidates who **spot and document** them:

1. `price` is taken from the request instead of the inventory (trust boundary).
2. Stock is checked but never decremented or reserved (race condition, no transaction).
3. Duplicated product ids in the same order bypass the stock check.
4. Money handled as floating point (`total - total * 0.1`).
5. `requestedQuantity` is never validated (negative or non-numeric values are accepted).
6. `500` responses leak `error.message` to the client.
7. Discounts can drive the total below zero (`MINUS10` on a 5 total).
8. Missing `express.json()` in the original snippet — added here so the endpoint works.

## Follow-up questions for the debrief

1. Where does a new discount live, and what existing file would you touch to add it?
2. Your discount is `20PERCENT but capped at 50`. Does your design absorb it?
3. How would you swap the mock inventory for Postgres without touching the use case?
4. Where would you handle stock reservation, and what happens under concurrent checkouts?
5. Which of these smells did you see and decide not to fix? Why?
6. What did you over-engineer here that you would not ship in production?

## Running a submission

```bash
npm install
npm run typecheck
npm test
git log --oneline    # read the history, it is part of the answer
```
