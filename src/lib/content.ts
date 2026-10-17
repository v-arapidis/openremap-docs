import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkAlerts from "./alerts";
import { githubUrl, isRemote, siteConfig } from "./config";

const CONTENT_DIR = path.join(process.cwd(), "content");
const EXCLUDED_DIR = "internal"; // repo-only notes, not part of the wiki

export type DocStatus = "stable" | "stub" | "outdated" | "needs-expansion";

export interface DocEntry {
  slug: string[]; // route segments, [] == home
  filePath: string; // relative to content/, e.g. "getting-started/index.md"
  route: string; // "/getting-started"
  title: string;
  description: string;
  tags: string[];
  related: string[]; // raw relative markdown targets
  status: DocStatus;
  isIndex: boolean;
  depth: number;
}

export interface TreeNode {
  segment: string;
  title: string;
  route: string | null;
  entry: DocEntry | null;
  children: TreeNode[];
}

// ── helpers ────────────────────────────────────────────────────────────

function titleCase(seg: string): string {
  return seg
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function normalizeStatus(v: unknown): DocStatus {
  const s = String(v ?? "stable").toLowerCase();
  return ["stable", "stub", "outdated", "needs-expansion"].includes(s)
    ? (s as DocStatus)
    : "stable";
}

function extractFirstHeading(md: string): string | null {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function slugFromFilePath(filePath: string): string[] {
  const noExt = filePath.replace(/\.md$/i, "");
  const parts = noExt.split("/").filter(Boolean);
  if (parts.length && parts[parts.length - 1] === "index") parts.pop();
  return parts;
}

function routeFromSlug(slug: string[]): string {
  return slug.length ? `/${slug.join("/")}` : "/";
}

// ── manifest ───────────────────────────────────────────────────────────

function listMarkdownFiles(dir: string, rel = ""): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (childRel === EXCLUDED_DIR) continue;
      out.push(...listMarkdownFiles(full, childRel));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      out.push(childRel);
    }
  }
  return out;
}

function readEntryFromFs(filePath: string): DocEntry {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filePath), "utf8");
  const { data, content } = matter(raw);
  const slug = slugFromFilePath(filePath);
  return {
    slug,
    filePath,
    route: routeFromSlug(slug),
    title:
      (data.title as string) ||
      extractFirstHeading(content) ||
      titleCase(slug[slug.length - 1] ?? "Home"),
    description: (data.description as string) ?? "",
    tags: asStringArray(data.tags),
    related: asStringArray(data.related),
    status: normalizeStatus(data.status),
    isIndex: filePath.endsWith("/index.md") || filePath === "index.md",
    depth: slug.length,
  };
}

interface ManifestEntry {
  slug?: string[];
  filePath: string;
  title: string;
  description?: string;
  tags?: string[];
  related?: string[];
  status?: string;
}

function manifestEntryToDocEntry(e: ManifestEntry): DocEntry {
  const slug = e.slug ?? slugFromFilePath(e.filePath);
  return {
    slug,
    filePath: e.filePath,
    route: routeFromSlug(slug),
    title: e.title,
    description: e.description ?? "",
    tags: e.tags ?? [],
    related: e.related ?? [],
    status: normalizeStatus(e.status),
    isIndex: e.filePath.endsWith("/index.md") || e.filePath === "index.md",
    depth: slug.length,
  };
}

function buildManifestLocal(): DocEntry[] {
  return listMarkdownFiles(CONTENT_DIR)
    .map(readEntryFromFs)
    .sort((a, b) => a.filePath.localeCompare(b.filePath));
}

async function buildManifestRemote(): Promise<DocEntry[]> {
  const res = await fetch(`${siteConfig.contentBase}/content/manifest.json`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`manifest fetch failed: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as ManifestEntry[];
  return raw
    .map(manifestEntryToDocEntry)
    .sort((a, b) => a.filePath.localeCompare(b.filePath));
}

export const getEntries = cache(async (): Promise<DocEntry[]> => {
  return isRemote ? buildManifestRemote() : buildManifestLocal();
});

// ── content reading ────────────────────────────────────────────────────

async function readContent(filePath: string): Promise<string> {
  if (isRemote) {
    const res = await fetch(
      `${siteConfig.contentBase}/content/${filePath}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error(`content fetch failed: ${filePath}`);
    return res.text();
  }
  return fs.readFileSync(path.join(CONTENT_DIR, filePath), "utf8");
}

// ── markdown rendering ─────────────────────────────────────────────────

const processor = remark()
  .use(remarkGfm)
  .use(remarkAlerts)
  .use(remarkHtml, { sanitize: false });

function injectHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h[23]>/gi,
    (match, level, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      let id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!id) id = "section";
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;
      if (attrs.includes('id="')) return match;
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
    },
  );
}

function stripAnchor(target: string): { path: string; anchor: string } {
  const i = target.indexOf("#");
  if (i === -1) return { path: target, anchor: "" };
  return { path: target.slice(0, i), anchor: target.slice(i) };
}

function resolveContentPath(targetPath: string, fromFilePath: string): string {
  const fromDir = path.posix.dirname(fromFilePath);
  let resolved = path.posix.normalize(path.posix.join(fromDir, targetPath));
  if (resolved.startsWith("./")) resolved = resolved.slice(2);
  return resolved;
}

const PROJECT_FILES: Record<string, string> = {
  CONTRIBUTING: "/project/contributing",
  DISCLAIMER: "/project/disclaimer",
  "THIRD_PARTY": "/project/third-party",
  LICENSE: "/project/license",
  CHANGELOG: "/project/changelog",
  README: "/",
  INDEX: "/",
};

function projectRoute(resolved: string): string | null {
  // These files used to live at the repo root (one level above `docs/`),
  // so links like `../CONTRIBUTING.md` now resolve to `../CONTRIBUTING.md`
  // relative to `content/`. Collapse any leading `../` before matching.
  const base = resolved
    .replace(/\.(md|txt)$/i, "")
    .replace(/^(\.\.\/)+/, "");
  if (base.includes("/")) return null;
  return PROJECT_FILES[base.toUpperCase()] ?? null;
}

const fileMapCache = new Map<DocEntry[], Map<string, DocEntry>>();

function getFileMap(entries: DocEntry[]): Map<string, DocEntry> {
  let map = fileMapCache.get(entries);
  if (!map) {
    map = new Map(entries.map((e) => [e.filePath, e]));
    fileMapCache.set(entries, map);
  }
  return map;
}

function findEntryByContentPath(
  entries: DocEntry[],
  contentPath: string,
): DocEntry | null {
  const map = getFileMap(entries);
  const base = contentPath.replace(/\.md$/i, "");
  return map.get(`${base}.md`) ?? map.get(`${base}/index.md`) ?? null;
}

function rewriteTarget(
  target: string,
  entry: DocEntry,
  entries: DocEntry[],
): string {
  if (/^(https?:|mailto:|#|\/|data:|tel:)/i.test(target)) return target;
  const { path: p, anchor } = stripAnchor(target);
  if (!p) return target; // anchor-only

  const resolved = resolveContentPath(p, entry.filePath);

  // images
  if (/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(resolved)) {
    const base = path.posix.basename(resolved);
    return (
      (isRemote
        ? `${siteConfig.contentBase}/content/images/${base}`
        : `/images/${base}`) + anchor
    );
  }

  // wiki page
  const targetEntry = findEntryByContentPath(entries, resolved);
  if (targetEntry) return targetEntry.route + anchor;

  // top-level project files (CONTRIBUTING.md, LICENSE, …)
  const project = projectRoute(resolved);
  if (project) return project + anchor;

  // repo-only notes → browse on GitHub
  if (resolved.startsWith("internal")) {
    return githubUrl("content", resolved) + anchor;
  }

  // last resort → browse the source file on GitHub
  return githubUrl("content", resolved) + anchor;
}

function fixLinks(
  html: string,
  entry: DocEntry,
  entries: DocEntry[],
): string {
  return html
    .replace(
      /(<a\s[^>]*\bhref=")([^"]+)("[^>]*>)/gi,
      (_m, before: string, url: string, after: string) =>
        `${before}${rewriteTarget(url, entry, entries)}${after}`,
    )
    .replace(
      /(<img\s[^>]*\bsrc=")([^"]+)("[^>]*>)/gi,
      (_m, before: string, url: string, after: string) =>
        `${before}${rewriteTarget(url, entry, entries)}${after}`,
    );
}

async function renderMarkdown(
  md: string,
  entry: DocEntry,
  entries: DocEntry[],
): Promise<string> {
  const file = await processor.process(md);
  let html = file.toString();
  html = fixLinks(html, entry, entries);
  html = injectHeadingIds(html);
  return html;
}

// ── public API ─────────────────────────────────────────────────────────

export interface RenderedDoc {
  entry: DocEntry;
  html: string;
}

export async function getDoc(slug: string[]): Promise<RenderedDoc | null> {
  const entries = await getEntries();
  const key = slug.join("/");
  const entry = entries.find((e) => e.slug.join("/") === key);
  if (!entry) return null;
  const raw = await readContent(entry.filePath);
  const { content } = matter(raw);
  const html = await renderMarkdown(content, entry, entries);
  return { entry, html };
}

const SECTION_ORDER = [
  "getting-started",
  "concepts",
  "api", // API section: programmatic surface (registry, workflows, transport, reference)
  "identify", // Phase 1: identify moved out of commands/ to top level
  "health", // Phase 1: health moved out of commands/ to top level
  "checksum", // Phase 1: checksum moved out of commands/ to top level
  "scan", // Phase 1: scan moved out of commands/ to top level
  "scan-vins", // Phase 1: scan-vins moved out of commands/ to top level
  "analyze", // Phase 2: moved out of commands/ to top level
  "convert", // Phase 2: moved out of commands/ to top level
  "layout", // Phase 2: moved out of commands/ to top level
  "scan-maps", // Phase 2: moved out of commands/ to top level
  "diff-maps", // Phase 2: moved out of commands/ to top level
  "routine", // Phase 2: moved out of commands/ to top level
  "synth", // fixtures: generate an ECU-like file to feed the tooling above
  "cook", // Phase 3: moved out of commands/ to top level
  "cook-volatile", // Phase 3: moved out of commands/ to top level
  "merge", // Phase 3: moved out of commands/ to top level
  "tune", // Phase 3: moved out of commands/ to top level
  "validate", // Phase 3: moved out of commands/ to top level
  "audit", // Phase 3: moved out of commands/ to top level
  "contribute", // contribution path: add support for a new ECU family
  "manufacturers",
  "project",
];

function sortKey(seg: string): string {
  if (seg === "advanced" || seg === "internals") return `zzz_${seg}`;
  return seg.toLowerCase();
}

function sortTree(node: TreeNode, depth = 0): void {
  node.children.sort((a, b) => {
    if (depth === 0) {
      const ia = SECTION_ORDER.indexOf(a.segment);
      const ib = SECTION_ORDER.indexOf(b.segment);
      const ka = ia === -1 ? SECTION_ORDER.length : ia;
      const kb = ib === -1 ? SECTION_ORDER.length : ib;
      if (ka !== kb) return ka - kb;
    }
    return sortKey(a.segment).localeCompare(sortKey(b.segment));
  });
  for (const child of node.children) sortTree(child, depth + 1);
}

function buildTree(entries: DocEntry[]): TreeNode[] {
  const root: TreeNode = {
    segment: "",
    title: "",
    route: "/",
    entry: null,
    children: [],
  };
  for (const e of entries) {
    let node = root;
    for (let i = 0; i < e.slug.length; i++) {
      const seg = e.slug[i];
      let child = node.children.find((c) => c.segment === seg);
      if (!child) {
        child = {
          segment: seg,
          title: titleCase(seg),
          route: null,
          entry: null,
          children: [],
        };
        node.children.push(child);
      }
      if (i === e.slug.length - 1) {
        child.entry = e;
        child.title = e.title;
        child.route = e.route;
      } else {
        node = child;
      }
    }
  }
  sortTree(root);
  return root.children;
}

export async function getTree(): Promise<TreeNode[]> {
  return buildTree(await getEntries());
}

export async function getRelated(entry: DocEntry): Promise<DocEntry[]> {
  const entries = await getEntries();
  const result: DocEntry[] = [];
  const seen = new Set<string>([entry.slug.join("/")]);

  for (const target of entry.related) {
    const resolved = resolveContentPath(target.split("#")[0], entry.filePath);
    const t = findEntryByContentPath(entries, resolved);
    if (t && !seen.has(t.slug.join("/"))) {
      seen.add(t.slug.join("/"));
      result.push(t);
    }
  }

  if (entry.tags.length) {
    for (const t of entries) {
      if (seen.has(t.slug.join("/"))) continue;
      if (t.tags.some((tag) => entry.tags.includes(tag))) {
        seen.add(t.slug.join("/"));
        result.push(t);
      }
    }
  }

  return result.slice(0, 6);
}

export async function getPrevNext(
  entry: DocEntry,
): Promise<{ prev: DocEntry | null; next: DocEntry | null }> {
  const entries = await getEntries();
  const section = entry.slug[0] ?? "";
  const siblings = entries.filter((e) => (e.slug[0] ?? "") === section);
  const idx = siblings.findIndex(
    (e) => e.slug.join("/") === entry.slug.join("/"),
  );
  return {
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
  };
}

export { extractFirstHeading };
