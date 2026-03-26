import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { resolveDatabaseUrl } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/** Safe debug: confirms serverless sees a DB URL (no secrets returned). */
router.get("/env-check", (_req, res) => {
  res.json({
    databaseConfigured: Boolean(resolveDatabaseUrl()),
    checkedKeys: [
      "DATABASE_URL",
      "POSTGRES_URL",
      "POSTGRES_PRISMA_URL",
      "PRISMA_DATABASE_URL",
      "NEON_DATABASE_URL",
    ],
  });
});

export default router;
