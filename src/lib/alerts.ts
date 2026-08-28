import type { Root } from "mdast";

/**
 * remark plugin: render GitHub-flavored alert blockquotes into styled
 * callouts (`.markdown-alert-*`). Supports NOTE, TIP, IMPORTANT, WARNING,
 * CAUTION, with an optional custom title on the marker line:
 *
 *   > [!NOTE]
 *   > Body…
 *
 *   > [!WARNING] Danger ahead
 *   > Body…
 */

const MARKER_LINE_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i;

const LABELS: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type AnyNode = any;

function transformNodes(nodes: AnyNode[]): AnyNode[] {
  const out: AnyNode[] = [];
  for (const node of nodes) {
    if (node?.type === "blockquote") {
      const alert = buildAlert(node);
      if (alert) {
        out.push(...alert);
        continue;
      }
    }
    if (node && Array.isArray(node.children)) {
      node.children = transformNodes(node.children);
    }
    out.push(node);
  }
  return out;
}

function buildAlert(bq: AnyNode): AnyNode[] | null {
  const children: AnyNode[] = bq.children ?? [];
  const first = children[0];
  if (!first || first.type !== "paragraph") return null;

  const paraChildren: AnyNode[] = first.children ?? [];
  const firstChild = paraChildren[0];
  // The marker must be the very first thing in the blockquote.
  if (!firstChild || firstChild.type !== "text") return null;

  // Soft line breaks are `\n` inside the text node — split the marker line
  // from the body.
  const lines: string[] = firstChild.value.split("\n");
  const m = lines[0].match(MARKER_LINE_RE);
  if (!m) return null;

  const type = m[1].toLowerCase();
  const customTitle = m[2].trim();
  const label = escapeHtml(customTitle || LABELS[type] || m[1]);

  // Reassemble the text without the marker line.
  firstChild.value = lines.slice(1).join("\n");
  if (firstChild.value === "") {
    const idx = paraChildren.indexOf(firstChild);
    paraChildren.splice(idx, 1);
    if (paraChildren[0]?.type === "break") paraChildren.shift();
  }
  if (paraChildren.length === 0) children.shift();

  const body = transformNodes(children);

  const open: AnyNode = {
    type: "html",
    value: `<div class="markdown-alert markdown-alert-${type}"><p class="markdown-alert-title">${label}</p>`,
  };
  const close: AnyNode = { type: "html", value: `</div>` };

  return [open, ...body, close];
}

export default function remarkAlerts() {
  return (tree: Root) => {
    (tree as AnyNode).children = transformNodes((tree as AnyNode).children);
  };
}
