/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },

  // Permanent moves, so links shared before the wiki was reorganised keep working.
  // Each one points at the page that now carries the same content.
  async redirects() {
    const moved = {
      // pages that changed section
      "/concepts/glossary": "/introduction/glossary",
      "/project/license": "/introduction/license",
      "/project/disclaimer": "/introduction/disclaimer",
      "/getting-started/tui": "/tui",
      "/api/concepts": "/api/methods",
      "/api/transport": "/api/calling",
      "/install/harness": "/harness",
      "/manufacturers": "/architecture/manufacturers",
      // old per-command folders -> the CLI section that replaces them
      "/identify": "/cli/look-at-a-file#identify",
      "/analyze": "/cli/look-at-a-file#analyze",
      "/health": "/cli/look-at-a-file#health",
      "/checksum": "/cli/look-at-a-file#checksum",
      "/layout": "/cli/look-at-a-file#layout",
      "/scan-vins": "/cli/look-at-a-file#scan-vins",
      "/convert": "/cli/convert-and-routine#convert",
      "/routine": "/cli/convert-and-routine#routine",
      "/scan-maps": "/cli/maps#scan-maps",
      "/diff-maps": "/cli/maps#diff-maps",
      "/cook": "/cli/cook#cook-strict",
      "/cook-volatile": "/cli/cook",
      "/merge": "/cli/cook#merge",
      "/tune": "/cli/apply#tune-strict",
      "/validate": "/cli/verify#validate",
      "/audit": "/cli/verify#audit",
      "/scan": "/cli/batch-and-fixtures#scan",
      "/synth": "/cli/batch-and-fixtures#synth",
      "/contribute": "/cli/contribute",
      "/concepts/recipe-format": "/recipe",
      // the two retired sections: everything here lives elsewhere now
      "/getting-started": "/introduction",
      "/getting-started/quickstart": "/cli",
      "/getting-started/setup": "/install",
      "/getting-started/cli": "/cli",
      "/getting-started/workflow": "/cli/getting-oriented",
      "/getting-started/interfaces": "/api",
      "/getting-started/families": "/architecture/manufacturers",
      "/getting-started/about": "/introduction",
      "/getting-started/install": "/install",
      "/getting-started/install/windows": "/install/cli/package",
      "/getting-started/install/macos-linux": "/install/cli/package",
      "/getting-started/install/developers": "/install/cli/clone",
      "/concepts": "/architecture",
      "/concepts/index": "/architecture",
      "/concepts/how-it-works": "/architecture",
      "/concepts/architecture": "/architecture",
      "/concepts/decoders": "/architecture/decoders",
      "/concepts/confidence": "/architecture/extractors",
      "/concepts/evidence": "/architecture/extractors",
      "/concepts/orst-format": "/recipe",
    };

    // Exact rules first, wildcards last: Next matches in order, so a section
    // wildcard listed early would swallow its own more specific paths.
    const entries = Object.entries(moved);
    return [
      ...entries.map(([from, to]) => ({ source: from, destination: to, permanent: true })),
      ...entries.map(([from, to]) => ({
        source: `${from}/:path*`,
        destination: to,
        permanent: true,
      })),
    ];
  },
  // The wiki reads Markdown from `content/` at request time, so trace those
  // files into the standalone/edge bundle too (not just imported modules).
  outputFileTracingIncludes: {
    "/*": ["./content/**/*"],
  },
};

export default nextConfig;
