import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  brandId: integer("brand_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  pointsBonus: integer("points_bonus").notNull().default(0),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default("active"),
  aiReason: text("ai_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
