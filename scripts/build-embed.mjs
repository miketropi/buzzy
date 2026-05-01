import esbuild from "esbuild";
import { existsSync, readdirSync, rmSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const buzzySubdir = join(publicDir, "buzzy");

/* Remove lazy chunks (entry stays public/buzzy.js). */
if (existsSync(buzzySubdir)) {
  rmSync(buzzySubdir, { recursive: true });
}
for (const f of readdirSync(publicDir)) {
  if (/^buzzy-[A-Za-z0-9_-]+\.js$/.test(f)) {
    try {
      unlinkSync(join(publicDir, f));
    } catch {
      /* ignore */
    }
  }
}

await esbuild.build({
  entryPoints: { buzzy: join(root, "src/embed/buzzy-bundle.ts") },
  outdir: publicDir,
  bundle: true,
  platform: "browser",
  format: "esm",
  splitting: true,
  target: ["es2018"],
  minify: true,
  logLevel: "info",
  jsx: "automatic",
  entryNames: "[name]",
  /* Subpath /buzzy/* so Next middleware can match CORS reliably (not one giant path segment). */
  chunkNames: "buzzy/embed-[hash]",
  assetNames: "buzzy/asset-[hash]",
});

console.log("build-embed: wrote public/buzzy.js + public/buzzy/embed-*.js (ESM, minified)");
