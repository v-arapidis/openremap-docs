"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { SearchIcon } from "./icons";

interface SearchDoc {
  slug: string[];
  path: string;
  title: string;
  description: string;
  tags: string[];
  section: string;
  text: string;
}

interface SearchResult {
  id: string;
  score: number;
  path: string;
  title: string;
  description: string;
  section: string;
  tags: string[];
}

let miniSearch: MiniSearch<SearchDoc> | null = null;
let indexPromise: Promise<MiniSearch<SearchDoc>> | null = null;

async function loadIndex(): Promise<MiniSearch<SearchDoc>> {
  if (miniSearch) return miniSearch;
  if (!indexPromise) {
    indexPromise = (async () => {
      const res = await fetch("/search-index.json");
      const docs = (await res.json()) as SearchDoc[];
      const idx = new MiniSearch<SearchDoc>({
        fields: ["title", "description", "tags", "text", "section"],
        storeFields: ["path", "title", "description", "section", "tags"],
        searchOptions: {
          boost: { title: 5, description: 3, tags: 4, section: 1, text: 1 },
          prefix: true,
          fuzzy: 0.2,
        },
      });
      idx.addAll(docs);
      miniSearch = idx;
      return idx;
    })();
  }
  return indexPromise;
}

export default function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const idx = await loadIndex();
      const res = idx.search(q.trim(), { prefix: true, fuzzy: 0.2 });
      setResults(
        res.slice(0, 12).map((r) => ({
          id: String(r.id),
          score: r.score,
          path: r.path,
          title: r.title,
          description: r.description,
          section: r.section,
          tags: r.tags,
        })),
      );
      setActive(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !open) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].path);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
        aria-label="Search documentation"
      >
        <SearchIcon size={15} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-neutral-700 px-1.5 text-[10px] text-neutral-500 sm:inline">
          /
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
              <SearchIcon size={18} className="text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onDialogKey}
                placeholder="Search the wiki…"
                className="w-full bg-transparent text-base text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  Searching…
                </p>
              )}
              {!loading && query && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  No results for “{query}”.
                </p>
              )}
              {!loading && !query && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  Type to search guides, commands, concepts, and manufacturers.
                </p>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => go(r.path)}
                  onMouseEnter={() => setActive(i)}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    i === active ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-100">
                      {r.title}
                    </span>
                    <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                      {r.section}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                      {r.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
