/**
 * Patches the Vercel Build Output config to use Node.js 20.x
 * instead of the 18.x that @astrojs/vercel@7 hardcodes.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = ".vercel/output";
const CONFIG_PATH = join(OUTPUT_DIR, "config.json");
const FUNCTIONS_DIR = join(OUTPUT_DIR, "functions");

// Patch config.json
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  let patched = false;
  const raw = JSON.stringify(config);
  const fixed = raw.replaceAll('"nodejs18.x"', '"nodejs20.x"');
  if (raw !== fixed) {
    writeFileSync(CONFIG_PATH, JSON.stringify(JSON.parse(fixed), null, 2));
    patched = true;
  }
  console.log(patched ? "Patched config.json: nodejs18.x → nodejs20.x" : "config.json: no patch needed");
} catch (e) {
  console.log("Skipping config.json:", e.message);
}

// Patch .vc-config.json in each function directory
try {
  const dirs = readdirSync(FUNCTIONS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const vcConfig = join(FUNCTIONS_DIR, dir.name, ".vc-config.json");
    try {
      const raw = readFileSync(vcConfig, "utf8");
      const fixed = raw.replaceAll('"nodejs18.x"', '"nodejs20.x"');
      if (raw !== fixed) {
        writeFileSync(vcConfig, fixed);
        console.log(`Patched ${dir.name}/.vc-config.json`);
      }
    } catch {}
  }
} catch (e) {
  console.log("Skipping functions dir:", e.message);
}
