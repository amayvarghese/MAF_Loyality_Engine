import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(
  __dirname,
  "artifacts",
  "api-server",
  "dist",
  "vercel-entry.mjs",
);

let cached = null;

export default async function handler(req, res) {
  if (!cached) {
    const mod = await import(pathToFileURL(bundlePath).href);
    cached = mod.default;
  }
  cached(req, res);
}
