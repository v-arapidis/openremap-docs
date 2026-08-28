// Generates `content/manifest.json` — the pre-computed index consumed by the
// remote (no-redeploy) content source. Run before committing content changes
// (wired into `predev`/`prebuild`), or let CI regenerate it.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const EXCLUDED = "internal";

function slugFromFilePath(filePath) {
  const noExt = filePath.replace(/\.md$/i, "");
  const parts = noExt.split("/").filter(Boolean);
  if (parts.length && parts[parts.length - 1] === "index") parts.pop();
  return parts;
}

function asStringArray(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function listFiles(dir, rel = "") {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (childRel === EXCLUDED) continue;
      out.push(...listFiles(full, childRel));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      out.push(childRel);
    }
  }
  return out;
}

const entries = listFiles(CONTENT_DIR).map((filePath) => {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filePath), "utf8");
  const { data, content } = matter(raw);
  const slug = slugFromFilePath(filePath);
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return {
    slug,
    filePath,
    title:
      data.title || heading || (slug[slug.length - 1] ?? "Home"),
    description: data.description ?? "",
    tags: asStringArray(data.tags),
    related: asStringArray(data.related),
    status: data.status ?? "stable",
  };
});

const out = path.join(CONTENT_DIR, "manifest.json");
fs.writeFileSync(out, JSON.stringify(entries, null, 2) + "\n");
console.log(`[manifest] wrote ${entries.length} entries → content/manifest.json`);
