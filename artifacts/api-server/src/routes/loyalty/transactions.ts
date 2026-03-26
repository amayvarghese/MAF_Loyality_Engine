import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable, customersTable, brandsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateTransactionBody, ListTransactionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListTransactionsQueryParams.parse(req.query);

    const conditions = [];
    if (query.customerId) conditions.push(eq(transactionsTable.customerId, query.customerId));
    if (query.brandId) conditions.push(eq(transactionsTable.brandId, query.brandId));

    const rows = await db
      .select({
        id: transactionsTable.id,
        customerId: transactionsTable.customerId,
        brandId: transactionsTable.brandId,
        brandName: brandsTable.name,
        amount: transactionsTable.amount,
        pointsEarned: transactionsTable.pointsEarned,
        description: transactionsTable.description,
        createdAt: transactionsTable.createdAt,
      })
      .from(transactionsTable)
      .leftJoin(brandsTable, eq(transactionsTable.brandId, brandsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(transactionsTable.createdAt);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list transactions");
    res.status(500).json({ error: "Failed to list transactions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateTransactionBody.parse(req.body);
    const pointsEarned = Math.floor(body.amount * 2);

    const [tx] = await db
      .insert(transactionsTable)
      .values({
        customerId: body.customerId,
        brandId: body.brandId,
        amount: String(body.amount),
        pointsEarned,
        description: body.description ?? null,
      })
      .returning();

    await db
      .update(customersTable)
      .set({ totalPoints: eq(customersTable.totalPoints, customersTable.totalPoints) as unknown as number })
      .where(eq(customersTable.id, body.customerId));

    res.status(201).json({ ...tx, brandName: null });
  } catch (err) {
    req.log.error({ err }, "Failed to create transaction");
    res.status(400).json({ error: "Failed to create transaction" });
  }
});

export default router;
