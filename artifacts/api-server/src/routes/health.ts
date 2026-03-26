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
  const groq = Boolean(process.env.GROQ_API_KEY?.trim());
  const openAiIntegration = Boolean(process.env.AI_INTEGRATIONS_OPENAI_API_KEY?.trim());
  res.json({
    databaseConfigured: Boolean(resolveDatabaseUrl()),
    checkedKeys: [
      "DATABASE_URL",
      "POSTGRES_URL",
      "POSTGRES_PRISMA_URL",
      "PRISMA_DATABASE_URL",
      "NEON_DATABASE_URL",
    ],
    weeklyOffersAi: groq ? "groq" : openAiIntegration ? "openai" : "none",
    weeklyOffersAiKeysHint: [
      "GROQ_API_KEY",
      "GROQ_BASE_URL",
      "GROQ_CHAT_MODEL",
      "AI_INTEGRATIONS_OPENAI_BASE_URL",
      "AI_INTEGRATIONS_OPENAI_API_KEY",
      "OPENAI_CHAT_MODEL",
    ],
  });
});

export default router;
