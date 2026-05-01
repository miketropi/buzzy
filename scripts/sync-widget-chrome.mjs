/**
 * Reads src/embed/widget-chrome.css and emits TS modules with __S__ replaced.
 * Run: node scripts/sync-widget-chrome.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = readFileSync(join(root, "src/embed/widget-chrome.css"), "utf8");

function toTsConst(name, css) {
  const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `/** Auto-generated from src/embed/widget-chrome.css — do not edit. */\nexport const ${name} = \`${escaped}\`;\n`;
}

const shadow = src.replace(/__S__/g, "");
const scoped = src.replace(/__S__/g, ".buzzy-widget-scope ");

const outDir = join(root, "src/lib/generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "widget-chrome-shadow.ts"), toTsConst("WIDGET_CHROME_STRUCTURAL_SHADOW", shadow));
writeFileSync(join(outDir, "widget-chrome-scoped.ts"), toTsConst("WIDGET_CHROME_STRUCTURAL_SCOPED", scoped));

console.log("widget-chrome: wrote widget-chrome-shadow.ts + widget-chrome-scoped.ts");
