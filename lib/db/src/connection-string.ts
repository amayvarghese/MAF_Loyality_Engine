/**
 * First non-empty value wins. Matches common Vercel / Neon / Prisma / marketplace naming.
 */
export function resolveDatabaseUrl(): string | undefined {
  const keys = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "PRISMA_DATABASE_URL",
    "NEON_DATABASE_URL",
  ] as const;

  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}
