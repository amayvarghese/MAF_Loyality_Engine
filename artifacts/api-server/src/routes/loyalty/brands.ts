import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { brandsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const brands = await db.select().from(brandsTable).orderBy(brandsTable.name);
    res.json(brands);
  } catch (err) {
    req.log.error({ err }, "Failed to list brands");
    res.status(500).json({ error: "Failed to list brands" });
  }
});

export default router;
