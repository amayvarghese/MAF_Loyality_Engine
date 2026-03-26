import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Schema = typeof schema;
type Db = ReturnType<typeof drizzle<Schema>>;

let _pool: pg.Pool | undefined;
let _db: Db | undefined;

function getOrCreatePool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
