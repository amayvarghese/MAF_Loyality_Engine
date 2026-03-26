import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  customersTable,
  brandsTable,
  transactionsTable,
  offersTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateOffersBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/generate-offers", async (req, res) => {
  try {
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

    const systemPrompt = `You are the AI engine for the Majid Al Futtaim SHARE loyalty program, one of the Middle East's most prestigious retail loyalty platforms. Your role is to generate hyper-personalized weekly offers that:
1. Reward customers for their existing brand loyalty
2. Cross-sell to MAF brands they haven't yet visited
3. Match the customer's tier and spending patterns
4. Create compelling reasons to shop across the MAF ecosystem

MAF Brands available: ${brands.map((b) => `${b.name} (${b.category})`).join(", ")}

Always respond with valid JSON matching this exact structure:
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
}`;

    const userPrompt = `Generate 4 personalized weekly offers for this customer:

Customer Profile:
- Name: ${customer.name}
- Loyalty Tier: ${customer.tier.toUpperCase()}
- Total Points: ${customer.totalPoints.toLocaleString()}

Cross-Brand Spending History:
${
  brandSpend.length > 0
    ? brandSpend
        .map(
          (b) =>
            `- ${b.brandName} (${b.category}): AED ${Number(b.totalSpend).toFixed(0)} spent, ${b.visitCount} visits`
        )
        .join("\n")
    : "No previous purchases"
}

Brands Not Yet Visited:
${unvisitedBrands.map((b) => `- ${b.name} (${b.category})`).join("\n")}

Create 4 personalized offers:
- 2 offers for brands they already love (reward loyalty)
- 2 offers to introduce them to brands they haven't tried yet

Make the offers compelling with realistic discount percentages (5-30%) and bonus points appropriate for their tier (${customer.tier}).
Each offer should feel personally crafted based on their actual spending behavior.
The aiReason should explain why this specific offer was chosen for this customer.`;

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

    res.json({ offers: insertedOffers, summary: parsed.summary });
  } catch (err) {
    req.log.error({ err }, "Failed to generate offers");
    res.status(500).json({ error: "Failed to generate offers" });
  }
});

router.get("/analytics", async (req, res) => {
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

    res.json({
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
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
