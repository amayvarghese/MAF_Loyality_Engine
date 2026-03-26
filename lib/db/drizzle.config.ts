import { defineConfig } from "drizzle-kit";
import path from "path";
import { resolveDatabaseUrl } from "./src/connection-string";

const url = resolveDatabaseUrl();
if (!url) {
  throw new Error(
    "Set DATABASE_URL or POSTGRES_URL (or another supported URL env) for drizzle-kit",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
