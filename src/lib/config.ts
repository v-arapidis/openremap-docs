export const siteConfig = {
  name: "OpenRemap Docs",
  shortName: "OpenRemap",
  description:
    "The OpenRemap wiki — guides, command reference, concepts, and manufacturer internals for the open-source ECU binary toolkit.",
  // Canonical production domain.
  domain: "https://docs.openremap.com",
  // Link back to the marketing/PR site.
  websiteUrl: "https://openremap.com",
  // Source repository (used for "Edit on GitHub" and cross-repo links).
  repo: process.env.NEXT_PUBLIC_REPO ?? "v-arapidis/openremap-docs",
  repoBranch: process.env.NEXT_PUBLIC_REPO_BRANCH ?? "main",
  // Content source: when set, content is fetched at request time from a live
  // raw mirror (GitHub raw or jsDelivr) instead of the local `content/` dir.
  // This is the "no redeploy" mechanism — content commits go live without a
  // site rebuild.
  contentBase: process.env.CONTENT_BASE ?? "",
};

export const isRemote = Boolean(siteConfig.contentBase);

export function githubUrl(...parts: string[]): string {
  const path = parts.filter(Boolean).join("/");
  return `https://github.com/${siteConfig.repo}/blob/${siteConfig.repoBranch}/${path}`;
}

export function editUrl(filePath: string): string {
  return `https://github.com/${siteConfig.repo}/edit/${siteConfig.repoBranch}/${filePath}`;
}
