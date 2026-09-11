import { describe, expect, it } from "vitest";
import { BASE_URL } from "../setup/config";

type CheckoutItem = {
  id: string;
  price: number;
  requestedQuantity: number;
};

type CheckoutBody = {
  products?: unknown;
  discountCode?: string;
};

type CheckoutResponse = {
  totalToPay?: number;
  error?: string;
};

async function checkout(payload: CheckoutBody) {
  const response = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as CheckoutResponse;

  return { status: response.status, body };
}

const twoProducts: CheckoutItem[] = [
  { id: "prod-1", price: 100, requestedQuantity: 2 },
  { id: "prod-2", price: 50, requestedQuantity: 1 },
];

describe("GET /", () => {
  it("keeps the health endpoint alive", async () => {
    const response = await fetch(BASE_URL);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("LSG!");
  });
});

describe("POST /api/checkout - totals", () => {
  it("sums price by requested quantity when there is no discount code", async () => {
    const { status, body } = await checkout({ products: twoProducts });

    expect(status).toBe(200);
    expect(body.totalToPay).toBeCloseTo(250, 2);
  });

  it("accepts an empty order", async () => {
    const { status, body } = await checkout({ products: [] });

    expect(status).toBe(200);
    expect(body.totalToPay).toBeCloseTo(0, 2);
  });

  it("ignores an unknown discount code", async () => {
    const { status, body } = await checkout({
      products: twoProducts,
      discountCode: "NOT-A-REAL-CODE",
    });

    expect(status).toBe(200);
    expect(body.totalToPay).toBeCloseTo(250, 2);
  });
});

describe("POST /api/checkout - discounts", () => {
  it("applies a 10% discount with 10PERCENT", async () => {
    const { status, body } = await checkout({
      products: twoProducts,
      discountCode: "10PERCENT",
    });

    expect(status).toBe(200);
    expect(body.totalToPay).toBeCloseTo(225, 2);
  });

  it("subtracts a flat amount with MINUS10", async () => {
    const { status, body } = await checkout({
      products: twoProducts,
      discountCode: "MINUS10",
    });

    expect(status).toBe(200);
    expect(body.totalToPay).toBeCloseTo(240, 2);
  });
});

describe("POST /api/checkout - stock validation", () => {
  it("rejects an order that exceeds the available stock", async () => {
    const { status, body } = await checkout({
      products: [{ id: "prod-1", price: 100, requestedQuantity: 11 }],
    });

    expect(status).toBe(400);
    expect(body.error).toContain("prod-1");
  });

  it("rejects a product with zero stock", async () => {
    const { status, body } = await checkout({
      products: [{ id: "prod-3", price: 10, requestedQuantity: 1 }],
    });

    expect(status).toBe(400);
    expect(body.error).toContain("prod-3");
  });

  it("rejects a product that does not exist in the inventory", async () => {
    const { status, body } = await checkout({
      products: [{ id: "prod-404", price: 10, requestedQuantity: 1 }],
    });

    expect(status).toBe(400);
    expect(body.error).toContain("prod-404");
  });
});

describe("POST /api/checkout - request validation", () => {
  it("rejects a request without products", async () => {
    const { status, body } = await checkout({});

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");
  });

  it("rejects products that are not an array", async () => {
    const { status, body } = await checkout({ products: "prod-1" });

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");
  });
});
