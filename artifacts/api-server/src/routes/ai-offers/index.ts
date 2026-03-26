import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  customersTable,
  brandsTable,
  transactionsTable,
  offersTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GenerateOffersBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/generate-offers", async (req, res) => {
  try {
    const { openai } = await import("@workspace/integrations-openai-ai-server");

    const { customerId } = GenerateOffersBody.parse(req.body);

    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, customerId));

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const brands = await db.select().from(brandsTable);

    const brandSpend = await db
      .select({
        brandId: transactionsTable.brandId,
        brandName: brandsTable.name,
        category: brandsTable.category,
        totalSpend: sql<number>`sum(cast(${transactionsTable.amount} as float))`,
        visitCount: sql<number>`count(*)`,
        totalPoints: sql<number>`sum(${transactionsTable.pointsEarned})`,
      })
      .from(transactionsTable)
      .leftJoin(brandsTable, eq(transactionsTable.brandId, brandsTable.id))
      .where(eq(transactionsTable.customerId, customerId))
      .groupBy(transactionsTable.brandId, brandsTable.name, brandsTable.category);

    const visitedBrandIds = new Set(brandSpend.map((b) => b.brandId));
    const unvisitedBrands = brands.filter((b) => !visitedBrandIds.has(b.id));

    const firstName = customer.name.split(" ")[0];
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-AE", { weekday: "long" });
    const dateStr = now.toLocaleDateString("en-AE", { day: "numeric", month: "long" });

    const uaeEvents = [
      "UAE National Day is coming up",
      "Eid holidays are approaching",
      "Dubai Shopping Festival is on",
      "Dubai Summer Surprises is happening",
      "the weekend is almost here",
      "it's a long weekend coming up",
      "school is back in season",
      "the weather is finally cooling down",
    ];
    const randomEvent = uaeEvents[Math.floor(Math.random() * uaeEvents.length)];

    const systemPrompt = `You are the personal shopping intelligence behind the Majid Al Futtaim SHARE loyalty program. You write offers that sound like they're from a brilliant friend who knows the customer personally — warm, direct, and genuinely useful. Not corporate. Not generic.

Writing rules for titles and descriptions:
- Always address the customer by their first name ("${firstName}") in the title, like a text message from a friend
- Titles should be short, punchy hooks — a question, observation or nudge. Example: "Hey ${firstName} — Friday grocery run incoming?" or "${firstName}, Dune 3 drops this weekend 🎬"
- Descriptions complete the offer naturally in 1–2 sentences. Weave in the actual offer details conversationally. Reference real timing (the weekend, Friday, today, ${dateStr}), cross-brand storytelling, or current events where it fits naturally
- Cross-brand offers should feel like natural extensions: "Since you love Carrefour, grab popcorn and catch a movie at VOX on us"
- Tone: like a savvy friend who works in retail — helpful, a little cheeky, never pushy
- Never use corporate buzzwords like "elevate", "exclusive", "curated", "indulge", "bespoke", "tailor-made"
- Discounts for loyalty brands: 10–25%. For new brands: 15–30% to entice trial
- Points bonus should scale with tier: silver 200–500, gold 500–1000, platinum 1000–2000, diamond 2000–5000

MAF Brands available: ${brands.map((b) => `${b.name} (${b.category})`).join(", ")}

Respond ONLY with valid JSON in this exact shape:
{
  "offers": [
    {
      "brandId": number,
      "title": string,
      "description": string,
      "discountPercent": number,
      "pointsBonus": number,
      "aiReason": string
    }
  ],
  "summary": string
}

The summary should be 1 friendly sentence addressed to ${firstName} explaining the theme of this week's picks.`;

    const userPrompt = `Today is ${dayOfWeek}, ${dateStr}. Context: ${randomEvent}.

Generate 4 offers for this customer:

Name: ${firstName} (${customer.name})
Loyalty Tier: ${customer.tier.toUpperCase()}
Total Points: ${customer.totalPoints.toLocaleString()}

Their spending history across MAF brands:
${
  brandSpend.length > 0
    ? brandSpend
        .map(
          (b) =>
            `- ${b.brandName} (${b.category}): AED ${Number(b.totalSpend).toFixed(0)} spent, ${b.visitCount} visit${Number(b.visitCount) !== 1 ? "s" : ""}`
        )
        .join("\n")
    : "- No previous purchases yet"
}

Brands they haven't tried yet:
${unvisitedBrands.length > 0 ? unvisitedBrands.map((b) => `- ${b.name} (${b.category})`).join("\n") : "- They've visited all brands"}

Craft exactly 4 offers:
- 2 offers for brands ${firstName} already shops at — make them feel like a reward for being a regular
- 2 offers to nudge them towards brands they haven't tried, with a compelling cross-brand story or real-world reason to go

The aiReason field should explain in 1 sentence (not addressed to the customer) why the data led you to choose this specific offer for this person.`;


    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    
    let parsed: {
      offers: Array<{
        brandId: number;
        title: string;
        description: string;
        discountPercent: number;
        pointsBonus: number;
        aiReason: string;
      }>;
      summary: string;
    };

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      return res.status(500).json({ error: "AI response parsing failed" });
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    await db
      .update(offersTable)
      .set({ status: "expired" })
      .where(eq(offersTable.customerId, customerId));

    const insertedOffers = [];
    for (const offer of parsed.offers) {
      const brand = brands.find((b) => b.id === offer.brandId);
      if (!brand) continue;

      const [inserted] = await db
        .insert(offersTable)
        .values({
          customerId,
          brandId: offer.brandId,
          title: offer.title,
          description: offer.description,
          discountPercent: String(offer.discountPercent),
          pointsBonus: offer.pointsBonus,
          validUntil,
          status: "active",
          aiReason: offer.aiReason,
        })
        .returning();

      insertedOffers.push({
        ...inserted,
        brandName: brand.name,
      });
    }

    return res.json({ offers: insertedOffers, summary: parsed.summary });
  } catch (err) {
    req.log.error({ err }, "Failed to generate offers");
    return res.status(500).json({ error: "Failed to generate offers" });
  }
});

router.get("/analytics", async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      error: "Database not configured",
      title: "Database not configured",
      detail:
        "Add DATABASE_URL in Vercel → Settings → Environment Variables (Production), redeploy, then run DB push and seed.",
    });
  }

  try {
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customersTable);

    const [txCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactionsTable);

    const [pointsTotal] = await db
      .select({ total: sql<number>`sum(${transactionsTable.pointsEarned})` })
      .from(transactionsTable);

    const topBrands = await db
      .select({
        brandName: brandsTable.name,
        revenue: sql<number>`sum(cast(${transactionsTable.amount} as float))`,
        customerCount: sql<number>`count(distinct ${transactionsTable.customerId})`,
      })
      .from(transactionsTable)
      .leftJoin(brandsTable, eq(transactionsTable.brandId, brandsTable.id))
      .groupBy(brandsTable.name)
      .orderBy(sql`sum(cast(${transactionsTable.amount} as float)) desc`)
      .limit(5);

    const tierRows = await db
      .select({
        tier: customersTable.tier,
        count: sql<number>`count(*)`,
      })
      .from(customersTable)
      .groupBy(customersTable.tier);

    const tierDistribution = { silver: 0, gold: 0, platinum: 0, diamond: 0 };
    for (const row of tierRows) {
      const tier = row.tier as keyof typeof tierDistribution;
      if (tier in tierDistribution) {
        tierDistribution[tier] = Number(row.count);
      }
    }

    const [totalOffers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offersTable);

    const [redeemedOffers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offersTable)
      .where(eq(offersTable.status, "redeemed"));

    const generated = Number(totalOffers?.count ?? 0);
    const redeemed = Number(redeemedOffers?.count ?? 0);

    return res.json({
      totalCustomers: Number(customerCount?.count ?? 0),
      totalTransactions: Number(txCount?.count ?? 0),
      totalPointsIssued: Number(pointsTotal?.total ?? 0),
      topBrands: topBrands.map((b) => ({
        brandName: b.brandName ?? "Unknown",
        revenue: Number(b.revenue ?? 0),
        customerCount: Number(b.customerCount ?? 0),
      })),
      tierDistribution,
      weeklyOfferStats: {
        generated,
        redeemed,
        redemptionRate: generated > 0 ? Math.round((redeemed / generated) * 100) : 0,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get analytics");
    const detail = err instanceof Error ? err.message : String(err);
    const hint =
      detail.includes("password") || detail.includes("authentication failed")
        ? "Check DATABASE_URL user/password."
        : detail.includes("does not exist") && detail.includes("relation")
          ? 'Run `pnpm --filter @workspace/db run push` and `pnpm --filter @workspace/scripts run seed-maf` against this database.'
          : detail.includes("timeout") || detail.includes("ECONNREFUSED")
            ? "Database host refused connection or timed out. Check URL, SSL, and IP allowlists."
            : undefined;
    return res.status(500).json({
      error: "Failed to get analytics",
      title: "Failed to get analytics",
      detail: hint ? `${detail} — ${hint}` : detail,
    });
  }
});

export default router;
