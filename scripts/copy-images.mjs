// Mirrors `content/images/` into `public/images/` so the wiki can serve them
// at `/images/*.png` in local mode. Source of truth stays in `content/images/`.
import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "content", "images");
const dst = path.join(process.cwd(), "public", "images");

if (!fs.existsSync(src)) {
  console.log("[images] no content/images directory — skipping");
  process.exit(0);
}

fs.mkdirSync(dst, { recursive: true });
const files = fs.readdirSync(src).filter((f) => !f.startsWith("."));
for (const f of files) {
  fs.copyFileSync(path.join(src, f), path.join(dst, f));
}
console.log(`[images] copied ${files.length} files → public/images/`);
