"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TreeNode } from "@/lib/content";
import { ChevronRightIcon } from "./icons";


// Persisted sidebar scroll offset across route changes (see Sidebar body).
let savedSidebarScrollTop = 0;

function ancestorKeys(pathname: string): string[] {
  const parts = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const out: string[] = [];
  let acc = "";
  for (const p of parts) {
    acc = acc ? `${acc}/${p}` : p;
    out.push(acc);
  }
  return out;
}

function initialOpen(tree: TreeNode[], pathname: string): Set<string> {
  const open = new Set<string>();
  const active = ancestorKeys(pathname);
  const walk = (nodes: TreeNode[], parent: string) => {
    for (const n of nodes) {
      const key = parent ? `${parent}/${n.segment}` : n.segment;
      if (!parent && pathname === "/" && n.segment === "getting-started")
        open.add(key);
      if (active.includes(key)) open.add(key);
      if (n.children.length) walk(n.children, key);
    }
  };
  walk(tree, "");
  return open;
}

interface BranchProps {
  node: TreeNode;
  path: string;
  activePath: string;
  openPaths: Set<string>;
  toggle: (p: string) => void;
  depth: number;
}

function Branch({
  node,
  path,
  activePath,
  openPaths,
  toggle,
  depth,
}: BranchProps) {
  const hasChildren = node.children.length > 0;
  const isOpen = hasChildren && openPaths.has(path);
  const isActive = node.route === activePath;

  return (
    <li>
      <div className="group flex items-center gap-0.5">
        {hasChildren ? (
          <button
            onClick={() => toggle(path)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}
            title={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}
            className="-ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-600 transition-colors hover:bg-[#3d4145]/70 hover:text-neutral-100"
          >
            <ChevronRightIcon
              size={13}
              className={`transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}

        {node.route ? (
          <Link
            href={node.route}
            title={node.title}
            aria-current={isActive ? "page" : undefined}
            className={`min-w-0 flex-1 truncate rounded-md py-1.5 pr-2 text-sm underline-offset-2 transition-colors ${
              isActive
                ? "bg-[#88ccff]/10 font-medium text-[#88ccff]"
                : depth === 0
                  ? "font-medium text-neutral-300 hover:bg-[#2c3035]/70 hover:text-white hover:underline"
                  : "text-neutral-400 hover:bg-[#2c3035]/50 hover:text-neutral-100 hover:underline"
            }`}
          >
            {node.title}
          </Link>
        ) : (
          <span className="block flex-1 py-1.5 pr-2 text-sm font-medium text-neutral-300">
            {node.title}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="ml-2 border-l border-[#3d4145] pl-2">
          {node.children.map((child) => (
            <Branch
              key={child.segment}
              node={child}
              path={path ? `${path}/${child.segment}` : child.segment}
              activePath={activePath}
              openPaths={openPaths}
              toggle={toggle}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({
  tree,
}: {
  tree: TreeNode[];
}) {
  const pathname = usePathname() ?? "/";

  const [openPaths, setOpenPaths] = useState<Set<string>>(() =>
    initialOpen(tree, pathname),
  );

  // One route, one page: the URL is what the sidebar highlights. Nothing else
  // can override it, so the highlight cannot disagree with the address bar.
  const activePath = pathname;
  // The sidebar is its own scroll container. Route changes can remount it
  // (or re-render it before the new page paints), which would reset the
  // scroll position and throw the reader back to the top of the nav. Keep
  // the scroll offset in module scope and restore it after every render
  // that follows a pathname change, so browsing deep items stays put.
  const navRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onScroll = () => {
      savedSidebarScrollTop = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const restore = () => {
      el.scrollTop = savedSidebarScrollTop;
    };
    // Wait a frame so the expanded branch for the new page has laid out and
    // the scroll height is final before restoring the offset.
    const raf = requestAnimationFrame(() => restore());
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      for (const key of ancestorKeys(pathname)) next.add(key);
      return next;
    });
  }, [pathname]);

  const toggle = (p: string) => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  return (
    <nav
      aria-label="Documentation navigation"
      className="h-full w-64 shrink-0 overflow-y-auto border-r border-[#3d4145] bg-[#2e3236]/40 py-6 pl-3 pr-2"
      ref={navRef}
    >
      <div className="mb-4 pr-3">
        <Link
          href="/"
          className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
            pathname === "/"
              ? "bg-[#88ccff]/10 font-medium text-[#88ccff]"
              : "text-neutral-400 hover:bg-[#2c3035]/60 hover:text-neutral-100"
          }`}
        >
          Home
        </Link>
      </div>

      <ul className="space-y-0.5">
        {tree.map((node) => (
          <Branch
            key={node.segment}
            node={node}
            path={node.segment}
            activePath={activePath}
            openPaths={openPaths}
            toggle={toggle}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}
