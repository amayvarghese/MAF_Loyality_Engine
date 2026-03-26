import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { offersTable, brandsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListOffersQueryParams, RedeemOfferParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListOffersQueryParams.parse(req.query);

    const conditions = [];
    if (query.customerId) conditions.push(eq(offersTable.customerId, query.customerId));
    if (query.status) conditions.push(eq(offersTable.status, query.status));

    const rows = await db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(offersTable.createdAt);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list offers");
    res.status(500).json({ error: "Failed to list offers" });
  }
});

router.post("/:id/redeem", async (req, res) => {
  try {
    const { id } = RedeemOfferParams.parse({ id: Number(req.params.id) });

    const [updated] = await db
      .update(offersTable)
      .set({ status: "redeemed" })
      .where(and(eq(offersTable.id, id), eq(offersTable.status, "active")))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Offer not found or already redeemed" });
    }

    const [brand] = await db
      .select({ name: brandsTable.name })
      .from(brandsTable)
      .where(eq(brandsTable.id, updated.brandId));

    res.json({ ...updated, brandName: brand?.name ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to redeem offer");
    res.status(400).json({ error: "Failed to redeem offer" });
  }
});

export default router;
