import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDoc,
  getEntries,
  getPrevNext,
  getRelated,
  getTree,
  type DocEntry,
  type TreeNode,
} from "@/lib/content";
import { editUrl, githubUrl } from "@/lib/config";
import Sidebar from "./Sidebar";
import TableOfContents from "./TableOfContents";
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from "./icons";

function findTrail(
  tree: TreeNode[],
  slug: string[],
): { title: string; route: string }[] {
  const trail: { title: string; route: string }[] = [];
  let nodes = tree;
  for (const seg of slug) {
    const node = nodes.find((n) => n.segment === seg);
    if (!node) break;
    trail.push({ title: node.entry?.title ?? node.title, route: node.route ?? "" });
    nodes = node.children;
  }
  return trail;
}

const STATUS_LABEL: Record<string, string> = {
  stub: "This page is a stub — contributions welcome.",
  outdated: "This page may be out of date. Verify against the latest release.",
  "needs-expansion": "This page needs expansion.",
};

function StatusBanner({ entry }: { entry: DocEntry }) {
  if (entry.status === "stable") return null;
  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      {STATUS_LABEL[entry.status]}
    </div>
  );
}

function RelatedArticles({ related }: { related: DocEntry[] }) {
  if (related.length === 0) return null;
  return (
    <aside className="mt-12 rounded-lg border border-[#3d4145] bg-[#2e3236]/40 p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Related articles
      </h2>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {related.map((r) => (
          <li key={r.route}>
            <Link
              href={r.route}
              className="group flex items-center gap-1.5 text-sm text-neutral-300 transition-colors hover:text-[#99ddff]"
            >
              <span className="text-neutral-600 group-hover:text-[#99ddff]">→</span>
              {r.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PageFooter({ entry }: { entry: DocEntry }) {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-[#3d4145] pt-6 text-sm">
      <Link
        href={githubUrl("content", entry.filePath)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-500 transition-colors hover:text-neutral-200"
      >
        View source
      </Link>
      <a
        href={editUrl(`content/${entry.filePath}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-[#99ddff]"
      >
        ✎ Edit on GitHub <ExternalLinkIcon size={13} />
      </a>
    </div>
  );
}

export default async function DocShell({ slug }: { slug: string[] }) {
  const [entries, tree, doc] = await Promise.all([
    getEntries(),
    getTree(),
    getDoc(slug),
  ]);

  if (!doc) notFound();

  const { entry, html } = doc;
  const [{ prev, next }, related] = await Promise.all([
    getPrevNext(entry),
    getRelated(entry),
  ]);

  const route = entry.route;
  const trail = findTrail(tree, slug);
  const advancedEntry = entries.find(
    (e) => e.slug.join("/") === [...slug, "advanced"].join("/"),
  );
  const isAdvanced = slug.length > 0 && slug[slug.length - 1] === "advanced";
  const overviewEntry = isAdvanced
    ? entries.find((e) => e.slug.join("/") === slug.slice(0, -1).join("/"))
    : null;

  return (
    <div className="mx-auto flex max-w-[1400px]">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar tree={tree} />
        </div>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex gap-10">
          <div className="min-w-0 flex-1">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500"
            >
              <Link href="/" className="transition-colors hover:text-[#99ddff]">
                Home
              </Link>
              {trail.map((item, i) => {
                const isLast = i === trail.length - 1;
                return (
                  <span key={i} className="flex items-center gap-2">
                    <span className="select-none text-neutral-700">/</span>
                    {item.route && !isLast ? (
                      <Link
                        href={item.route}
                        className="transition-colors hover:text-[#99ddff]"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className={isLast ? "text-neutral-300" : "text-neutral-400"}>
                        {item.title}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>

            {/* Two-tier advanced chip */}
            {advancedEntry && (
              <Link
                href={advancedEntry.route}
                className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#88ccff]/30 bg-[#88ccff]/10 px-3 py-1 text-xs font-medium text-[#88ccff] transition-colors hover:bg-[#88ccff]/20"
              >
                Advanced reference →
              </Link>
            )}
            {overviewEntry && (
              <Link
                href={overviewEntry.route}
                className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#45484d] bg-[#2c3035]/60 px-3 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-[#565b60] hover:text-white"
              >
                ← Overview
              </Link>
            )}

            <StatusBanner entry={entry} />

            <article
              className="prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <RelatedArticles related={related} />

            {/* Prev / Next */}
            {(prev || next) && (
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={prev.route}
                    className="group rounded-lg border border-[#3d4145] bg-[#2e3236]/50 p-4 transition-colors hover:border-[#565b60]"
                  >
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <ArrowLeftIcon size={13} /> Previous
                    </span>
                    <span className="mt-1 block text-sm font-medium text-neutral-300 transition-colors group-hover:text-[#99ddff]">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    href={next.route}
                    className="group rounded-lg border border-[#3d4145] bg-[#2e3236]/50 p-4 text-right transition-colors hover:border-[#565b60]"
                  >
                    <span className="flex items-center justify-end gap-1 text-xs text-neutral-500">
                      Next <ArrowRightIcon size={13} />
                    </span>
                    <span className="mt-1 block text-sm font-medium text-neutral-300 transition-colors group-hover:text-[#99ddff]">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}

            <PageFooter entry={entry} />
          </div>

          {/* TOC */}
          <TableOfContents contentHtml={html} />
        </div>
      </div>
    </div>
  );
}
