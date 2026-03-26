import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Schema = typeof schema;
type Db = ReturnType<typeof drizzle<Schema>>;

let _pool: pg.Pool | undefined;
let _db: Db | undefined;

function needsSsl(connectionString: string): boolean {
  if (process.env.PGSSLMODE === "disable") return false;
  const u = connectionString.toLowerCase();
  // Hosted Postgres almost always requires TLS from serverless (Vercel).
  return (
    process.env.PGSSLMODE === "require" ||
    process.env.VERCEL === "1" ||
    u.includes("sslmode=require") ||
    u.includes("neon.tech") ||
    u.includes("supabase.co") ||
    u.includes("pooler.supabase.com") ||
    u.includes("vercel-storage.com") ||
    u.includes("amazonaws.com") ||
    u.includes("railway.app") ||
    u.includes("render.com")
  );
}

function getOrCreatePool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    const max = Number(process.env.PG_POOL_MAX ?? (process.env.VERCEL ? "5" : "10"));
    _pool = new Pool({
      connectionString,
      max: Number.isFinite(max) && max > 0 ? max : 10,
      ...(needsSsl(connectionString)
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    });
  }
  return _pool;
}

function getOrCreateDb(): Db {
  if (!_db) {
    _db = drizzle(getOrCreatePool(), { schema });
  }
  return _db;
}

/** Lazy pool — no connection until first use (avoids crashing Vercel cold start when env is missing). */
export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getOrCreatePool(), prop, receiver);
  },
});

/** Lazy Drizzle instance — same as pool. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getOrCreateDb(), prop, receiver);
  },
});

export * from "./schema";
