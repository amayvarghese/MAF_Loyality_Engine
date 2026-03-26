import { db } from "@workspace/db";
import {
  brandsTable,
  customersTable,
  transactionsTable,
  offersTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

const MAF_BRANDS = [
  { name: "Carrefour", category: "Grocery & Retail", logoColor: "#1B4F8A", description: "The leading hypermarket chain across MAF's portfolio" },
  { name: "VOX Cinemas", category: "Entertainment", logoColor: "#E30613", description: "Premium cinema experience across the Middle East" },
  { name: "Ski Dubai", category: "Leisure & Entertainment", logoColor: "#00AEEF", description: "The Middle East's first indoor ski resort" },
  { name: "Mall of the Emirates", category: "Retail & Lifestyle", logoColor: "#C9A84C", description: "Dubai's premier lifestyle destination" },
  { name: "City Centre Malls", category: "Retail & Lifestyle", logoColor: "#003DA5", description: "Network of premium shopping destinations" },
  { name: "Géant", category: "Grocery & Retail", logoColor: "#E3001B", description: "French hypermarket brand offering quality products" },
  { name: "Magic Planet", category: "Family Entertainment", logoColor: "#FF6B00", description: "Family entertainment centres with games and rides" },
  { name: "Dreamscape", category: "Virtual Reality", logoColor: "#6B2D8B", description: "Immersive VR entertainment experiences" },
  { name: "ENOVA", category: "Energy & Sustainability", logoColor: "#00A651", description: "Sustainable energy and facilities management" },
];

const CUSTOMERS = [
  { name: "Ahmed Al Mansouri", email: "ahmed.mansouri@example.com", phone: "+971 50 123 4567", tier: "diamond" as const, totalPoints: 125000 },
  { name: "Sarah Johnson", email: "sarah.johnson@example.com", phone: "+971 55 234 5678", tier: "platinum" as const, totalPoints: 87500 },
  { name: "Mohammed Al Rashid", email: "m.rashid@example.com", phone: "+971 56 345 6789", tier: "gold" as const, totalPoints: 42000 },
  { name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+971 52 456 7890", tier: "gold" as const, totalPoints: 38500 },
  { name: "James Wilson", email: "james.wilson@example.com", phone: "+971 50 567 8901", tier: "platinum" as const, totalPoints: 76000 },
  { name: "Fatima Al Zaabi", email: "fatima.zaabi@example.com", phone: "+971 55 678 9012", tier: "silver" as const, totalPoints: 15000 },
  { name: "David Chen", email: "david.chen@example.com", phone: "+971 56 789 0123", tier: "silver" as const, totalPoints: 8500 },
  { name: "Aisha Al Hamdan", email: "aisha.hamdan@example.com", phone: "+971 52 890 1234", tier: "gold" as const, totalPoints: 55000 },
  { name: "Roberto Martini", email: "roberto.martini@example.com", phone: "+971 50 901 2345", tier: "silver" as const, totalPoints: 12000 },
  { name: "Nour Al Khoury", email: "nour.khoury@example.com", phone: "+971 55 012 3456", tier: "diamond" as const, totalPoints: 198000 },
];

async function seed() {
  console.log("Seeding MAF Loyalty Engine...");

  await db.execute(sql`TRUNCATE TABLE offers, transactions, customers, brands RESTART IDENTITY CASCADE`);

  const insertedBrands = await db.insert(brandsTable).values(MAF_BRANDS).returning();
  console.log(`Inserted ${insertedBrands.length} brands`);

  const insertedCustomers = await db.insert(customersTable).values(CUSTOMERS).returning();
  console.log(`Inserted ${insertedCustomers.length} customers`);

  const brandMap = new Map(insertedBrands.map((b) => [b.name, b.id]));
  const carreId = brandMap.get("Carrefour")!;
  const voxId = brandMap.get("VOX Cinemas")!;
  const skiId = brandMap.get("Ski Dubai")!;
  const mallId = brandMap.get("Mall of the Emirates")!;
  const cityId = brandMap.get("City Centre Malls")!;
  const geantId = brandMap.get("Géant")!;
  const magicId = brandMap.get("Magic Planet")!;
  const dreamId = brandMap.get("Dreamscape")!;

  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const txData = [
    { customerId: 1, brandId: carreId, amount: "2450.00", pointsEarned: 4900, description: "Weekly groceries", createdAt: daysAgo(2) },
    { customerId: 1, brandId: voxId, amount: "180.00", pointsEarned: 360, description: "IMAX movie night", createdAt: daysAgo(5) },
    { customerId: 1, brandId: skiId, amount: "620.00", pointsEarned: 1240, description: "Family ski session", createdAt: daysAgo(10) },
    { customerId: 1, brandId: mallId, amount: "3200.00", pointsEarned: 6400, description: "Luxury shopping", createdAt: daysAgo(15) },
    { customerId: 1, brandId: carreId, amount: "1850.00", pointsEarned: 3700, description: "Monthly groceries", createdAt: daysAgo(30) },
    { customerId: 1, brandId: dreamId, amount: "280.00", pointsEarned: 560, description: "VR experience", createdAt: daysAgo(45) },
    { customerId: 2, brandId: carreId, amount: "1200.00", pointsEarned: 2400, description: "Grocery shopping", createdAt: daysAgo(3) },
    { customerId: 2, brandId: voxId, amount: "95.00", pointsEarned: 190, description: "Movie tickets", createdAt: daysAgo(7) },
    { customerId: 2, brandId: mallId, amount: "5600.00", pointsEarned: 11200, description: "Designer purchases", createdAt: daysAgo(12) },
    { customerId: 2, brandId: cityId, amount: "780.00", pointsEarned: 1560, description: "Shopping", createdAt: daysAgo(20) },
    { customerId: 3, brandId: geantId, amount: "680.00", pointsEarned: 1360, description: "Weekly grocery", createdAt: daysAgo(1) },
    { customerId: 3, brandId: carreId, amount: "450.00", pointsEarned: 900, description: "Top-up groceries", createdAt: daysAgo(8) },
    { customerId: 3, brandId: magicId, amount: "220.00", pointsEarned: 440, description: "Family fun day", createdAt: daysAgo(20) },
    { customerId: 4, brandId: voxId, amount: "340.00", pointsEarned: 680, description: "Movies", createdAt: daysAgo(4) },
    { customerId: 4, brandId: carreId, amount: "890.00", pointsEarned: 1780, description: "Grocery run", createdAt: daysAgo(11) },
    { customerId: 4, brandId: mallId, amount: "1200.00", pointsEarned: 2400, description: "Shopping trip", createdAt: daysAgo(25) },
    { customerId: 5, brandId: skiId, amount: "1240.00", pointsEarned: 2480, description: "Ski lessons package", createdAt: daysAgo(6) },
    { customerId: 5, brandId: dreamId, amount: "420.00", pointsEarned: 840, description: "VR adventure", createdAt: daysAgo(14) },
    { customerId: 5, brandId: mallId, amount: "4500.00", pointsEarned: 9000, description: "Luxury purchases", createdAt: daysAgo(22) },
    { customerId: 5, brandId: voxId, amount: "270.00", pointsEarned: 540, description: "Cinema evening", createdAt: daysAgo(35) },
    { customerId: 6, brandId: carreId, amount: "380.00", pointsEarned: 760, description: "Grocery shopping", createdAt: daysAgo(5) },
    { customerId: 7, brandId: geantId, amount: "220.00", pointsEarned: 440, description: "Quick shop", createdAt: daysAgo(9) },
    { customerId: 8, brandId: carreId, amount: "1650.00", pointsEarned: 3300, description: "Monthly groceries", createdAt: daysAgo(3) },
    { customerId: 8, brandId: voxId, amount: "190.00", pointsEarned: 380, description: "Movie night", createdAt: daysAgo(18) },
    { customerId: 8, brandId: mallId, amount: "2800.00", pointsEarned: 5600, description: "Shopping", createdAt: daysAgo(28) },
    { customerId: 9, brandId: carreId, amount: "320.00", pointsEarned: 640, description: "Grocery", createdAt: daysAgo(7) },
    { customerId: 10, brandId: carreId, amount: "3800.00", pointsEarned: 7600, description: "Premium groceries", createdAt: daysAgo(2) },
    { customerId: 10, brandId: skiId, amount: "2400.00", pointsEarned: 4800, description: "VIP ski day", createdAt: daysAgo(8) },
    { customerId: 10, brandId: mallId, amount: "12000.00", pointsEarned: 24000, description: "Luxury shopping", createdAt: daysAgo(15) },
    { customerId: 10, brandId: voxId, amount: "650.00", pointsEarned: 1300, description: "Premium cinema", createdAt: daysAgo(22) },
    { customerId: 10, brandId: dreamId, amount: "850.00", pointsEarned: 1700, description: "VR experience", createdAt: daysAgo(30) },
  ];

  await db.insert(transactionsTable).values(txData);
  console.log(`Inserted ${txData.length} transactions`);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const offerData = [
    { customerId: 1, brandId: geantId, title: "20% Off Your Next Géant Shop", description: "Exclusive discount for diamond members at Géant hypermarkets", discountPercent: "20", pointsBonus: 5000, validUntil: nextWeek, status: "active" as const, aiReason: "You frequent Carrefour but haven't tried Géant yet — same premium quality with better deals on imported goods." },
    { customerId: 1, brandId: magicId, title: "Family Fun Bundle at Magic Planet", description: "2-hour unlimited play pass for the whole family", discountPercent: "15", pointsBonus: 2500, validUntil: nextWeek, status: "active" as const, aiReason: "Your leisure spending at Ski Dubai shows you love family experiences. Magic Planet is the perfect weekend complement." },
    { customerId: 2, brandId: skiId, title: "First-Time Ski Dubai Experience", description: "Special introductory offer for new Ski Dubai visitors", discountPercent: "25", pointsBonus: 8000, validUntil: nextWeek, status: "active" as const, aiReason: "As a platinum member with high mall spending, you're ready for the ultimate MAF leisure experience at Ski Dubai." },
    { customerId: 5, brandId: carreId, title: "Triple Points Weekend at Carrefour", description: "Earn 3x points on all purchases this weekend", discountPercent: "0", pointsBonus: 12000, validUntil: nextWeek, status: "active" as const, aiReason: "Your high entertainment spending suggests you'd appreciate bonus points from daily essentials to fund more experiences." },
  ];

  await db.insert(offersTable).values(offerData);
  console.log(`Inserted ${offerData.length} sample offers`);

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
