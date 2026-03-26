import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(
  __dirname,
  "..",
  "artifacts",
  "api-server",
  "dist",
  "vercel-entry.mjs",
);

let cached = null;

export default async function handler(req, res) {
  if (!cached) {
    const href = pathToFileURL(bundlePath).href;
    const mod = await import(href);
    cached = mod.default;
  }
  return cached(req, res);
}
