import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

// Mock inventory (simulating the database)
const inventory: Record<string, number> = {
  "prod-1": 10,
  "prod-2": 5,
  "prod-3": 0,
};

app.get("/", (_req: Request, res: Response) => {
  res.send("LSG!");
});

app.post("/api/checkout", (req: Request, res: Response) => {
  try {
    const { products, discountCode } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid products array" });
    }

    let total = 0;

    for (const item of products) {
      const stock = inventory[item.id] || 0;

      if (stock < item.requestedQuantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for product: ${item.id}` });
      }

      total += item.price * item.requestedQuantity;
    }

    let finalTotal = total;

    if (discountCode === "10PERCENT") {
      finalTotal = total - total * 0.1;
    } else if (discountCode === "MINUS10") {
      finalTotal = total - 10;
    }

    return res.status(200).json({ totalToPay: finalTotal });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
