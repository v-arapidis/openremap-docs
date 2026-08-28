// Adds `title` + `description` frontmatter to any wiki page missing them.
// Idempotent: pages with both fields are left untouched.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const EXCLUDED = "internal";

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

function firstParagraph(content) {
  const lines = content.split("\n");
  const para = [];
  for (const line of lines) {
    const t = line.trim();
    if (
      t === "" ||
      t.startsWith("#") ||
      t.startsWith("```") ||
      t.startsWith("|") ||
      /^[-*+]\s/.test(t) ||
      /^\d+\.\s/.test(t)
    ) {
      if (para.length) break;
      continue;
    }
    para.push(t);
    if (para.join(" ").length > 300) break;
  }
  return para.join(" ").replace(/\s+/g, " ").trim();
}

function firstSentence(text) {
  if (!text) return "";
  const m = text.match(/^[^.!?]+[.!?](?:\s|$)/);
  if (m) return m[0].trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

let changed = 0;
for (const filePath of listFiles(CONTENT_DIR)) {
  const full = path.join(CONTENT_DIR, filePath);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  if (data.title && data.description) continue;

  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = data.title || heading || path.basename(filePath, ".md");
  const description =
    data.description || firstSentence(firstParagraph(content));

  fs.writeFileSync(
    full,
    matter.stringify(content, { ...data, title, description }),
  );
  changed++;
}

console.log(`[backfill] added title/description to ${changed} files`);
