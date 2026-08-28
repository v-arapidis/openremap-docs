"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([23])[^>]*?(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  const items: TocItem[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    const id =
      match[2] ||
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    items.push({ id, text, level });
  }
  return items;
}

export default function TableOfContents({
  contentHtml,
}: {
  contentHtml: string;
}) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(contentHtml);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden w-56 shrink-0 xl:block" aria-label="Table of contents">
      <div className="sticky top-24">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          On this page
        </h4>
        <ul className="space-y-1 border-l border-neutral-800">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block border-l-2 py-1 text-xs transition-colors ${
                  h.level === 3 ? "pl-6" : "pl-3"
                } ${
                  activeId === h.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
