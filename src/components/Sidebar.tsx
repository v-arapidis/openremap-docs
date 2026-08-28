"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TreeNode } from "@/lib/content";
import { ChevronRightIcon } from "./icons";

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
      if (!parent && n.segment === "getting-started") open.add(key);
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
      <div className="group flex items-center">
        {hasChildren ? (
          <button
            onClick={() => toggle(path)}
            className="-ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-500 transition-colors hover:text-neutral-200"
            aria-expanded={isOpen}
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
            className={`block rounded-md py-1.5 pr-2 text-sm transition-colors ${
              isActive
                ? "font-medium text-emerald-400"
                : "text-neutral-400 hover:text-neutral-100"
            }`}
            style={{ paddingLeft: depth > 0 ? undefined : 0 }}
          >
            {node.title}
          </Link>
        ) : (
          <span className="block py-1.5 pr-2 text-sm font-medium text-neutral-300">
            {node.title}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="ml-2 border-l border-[#333338] pl-2">
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
      className="w-64 shrink-0 overflow-y-auto border-r border-[#333338] bg-[#222226]/40 py-6 pl-3 pr-2"
    >
      <div className="mb-4 pr-3">
        <Link
          href="/"
          className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
            pathname === "/"
              ? "bg-emerald-500/10 font-medium text-emerald-400"
              : "text-neutral-400 hover:bg-[#26262b]/60 hover:text-neutral-100"
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
            activePath={pathname}
            openPaths={openPaths}
            toggle={toggle}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}
