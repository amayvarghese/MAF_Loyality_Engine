import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable, transactionsTable, offersTable, brandsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCustomerBody,
  GetCustomerParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const customers = await db.select().from(customersTable).orderBy(customersTable.joinedAt);
    res.json(customers);
  } catch (err) {
    req.log.error({ err }, "Failed to list customers");
    res.status(500).json({ error: "Failed to list customers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateCustomerBody.parse(req.body);
    const [customer] = await db
      .insert(customersTable)
      .values({ ...body, tier: body.tier ?? "silver" })
      .returning();
    res.status(201).json(customer);
  } catch (err) {
    req.log.error({ err }, "Failed to create customer");
    res.status(400).json({ error: "Failed to create customer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetCustomerParams.parse({ id: Number(req.params.id) });

    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, id));

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const transactions = await db
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
      .where(eq(transactionsTable.customerId, id))
      .orderBy(transactionsTable.createdAt);

    const offers = await db
      .select({
        id: offersTable.id,
        customerId: offersTable.customerId,
        brandId: offersTable.brandId,
        brandName: brandsTable.name,
        title: offersTable.title,
        description: offersTable.description,
        discountPercent: offersTable.discountPercent,
        pointsBonus: offersTable.pointsBonus,
        validUntil: offersTable.validUntil,
        status: offersTable.status,
        aiReason: offersTable.aiReason,
        createdAt: offersTable.createdAt,
      })
      .from(offersTable)
      .leftJoin(brandsTable, eq(offersTable.brandId, brandsTable.id))
      .where(eq(offersTable.customerId, id));

    const brandSpendRows = await db
      .select({
        brandId: transactionsTable.brandId,
        brandName: brandsTable.name,
        totalSpend: sql<number>`sum(cast(${transactionsTable.amount} as float))`,
        totalPoints: sql<number>`sum(${transactionsTable.pointsEarned})`,
        visitCount: sql<number>`count(*)`,
      })
      .from(transactionsTable)
      .leftJoin(brandsTable, eq(transactionsTable.brandId, brandsTable.id))
      .where(eq(transactionsTable.customerId, id))
      .groupBy(transactionsTable.brandId, brandsTable.name);

    res.json({
      ...customer,
      transactions,
      offers,
      brandSpend: brandSpendRows,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get customer");
    res.status(500).json({ error: "Failed to get customer" });
  }
});

export default router;
