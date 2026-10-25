// Builds the client-side full-text search index from `content/`.
// Output: `public/search-index.json`, loaded by the search dialog.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT = path.join(process.cwd(), "public", "search-index.json");
const EXCLUDED = "internal";
const MAX_TEXT = 10000;

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

function toSearchableText(md) {
  return md
    // Fence markers only — a code block's *content* is kept: in a command
    // reference the code IS the subject (`tune-strict`, `--min-score`), and
    // dropping it made every command unfindable.
    .replace(/^```[^\n]*$/gm, " ")
    .replace(/`([^`\n]*)`/g, "$1") // inline code → its text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → label text
    .replace(/^[ \t]*[-*+][ \t]+/gm, " ") // list bullets
    .replace(/[#>*|~]+/g, " ") // markdown syntax, keeping - and _ (they are part of names)
    .replace(/\s+/g, " ")
    .trim();
}

const docs = listFiles(CONTENT_DIR).map((filePath) => {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filePath), "utf8");
  const { data, content } = matter(raw);
  const slug = slugFromFilePath(filePath);
  const title =
    data.title || content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
    (slug[slug.length - 1] ?? "Home");
  const description = data.description ?? "";
  const route = slug.length ? `/${slug.join("/")}` : "/";
  return {
    id: route, // MiniSearch requires a unique `id` field
    slug,
    path: route,
    title,
    description,
    tags: asStringArray(data.tags),
    section: slug[0] ?? "home",
    text: toSearchableText(content).slice(0, MAX_TEXT),
  };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(docs));
console.log(`[search] wrote ${docs.length} docs → public/search-index.json`);
