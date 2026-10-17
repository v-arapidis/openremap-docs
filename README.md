# OpenRemap Docs

The OpenRemap wiki — the documentation for the open-source ECU binary toolkit.
Live at **[docs.openremap.com](https://docs.openremap.com)** — the source of
truth for OpenRemap documentation.

> The marketing/PR site ([openremap.com](https://openremap.com)) and the engine
> ([openremap-core](https://github.com/v-arapidis/openremap-core)) live in
> separate repos. This repo is the **wiki only**.

## Quick start

Requires **Node 20.9 or newer** (`package.json` `engines`; `.nvmrc` pins 20).

```bash
npm install
npm run dev        # http://localhost:3000 — edits to content/*.md show on refresh
```

## How content works

All wiki pages are plain Markdown under [`content/`](content/). The folder tree
**is** the navigation: the sidebar is generated from it, no manifest to edit.

- `content/index.md` — the wiki home (`/`)
- `content/getting-started/` — guides, install, CLI, TUI
- `content/concepts/` — how it works, confidence, evidence, recipe format, …
- `content/<command>/` — one `index.md` (intro) + `cli.md` (flags) + `api.md` (the API face)
- `content/manufacturers/<oem>/` — per-family pages + `internals.md`
- `content/project/` — contributing, disclaimer, license, third-party, changelog

### Frontmatter

```yaml
---
title: Getting Started
description: Start here — what OpenRemap is and the fastest path to a tune analysis.
tags: [guide, quickstart]            # powers "Related articles"
related: [concepts/how-it-works.md]  # relative paths, shown in "Related"
status: stable                       # stable | stub | outdated | needs-expansion
---
```

Missing `title`/`description` are backfilled with `npm run backfill`
(`node scripts/backfill-frontmatter.mjs`).

### Admonitions

Use GitHub-flavored alerts — they render as callouts on the site *and* on GitHub:

```markdown
> [!NOTE]
> A neutral note.

> [!TIP]
> A helpful tip.

> [!WARNING]
> Something risky — pay attention.
```

Supported types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.

## No-redeploy content flow

Content commits should never require a site rebuild. Three layers:

1. **Local dev** — `npm run dev` reads `content/` from disk; edit and refresh.
2. **Remote source (production)** — set `CONTENT_BASE` (a raw mirror such as
   `https://cdn.jsdelivr.net/gh/v-arapidis/openremap-docs@main` or
   `https://raw.githubusercontent.com/v-arapidis/openremap-docs/main`). The site
   then fetches `content/manifest.json` + Markdown at request time with ISR
   (`revalidate: 300`), so a `git push` of content goes live **without a deploy**.
3. **On-demand revalidation** — POST to `/api/revalidate` (GitHub webhook on
   `push`) to clear the cache instantly. Protect it with `REVALIDATE_SECRET`.

Generate the committed index before pushing content changes:

```bash
npm run manifest   # writes content/manifest.json
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` | run the site (auto-builds index + images first) |
| `npm run manifest` | `node scripts/build-manifest.mjs` → `content/manifest.json` |
| `npm run search` | `node scripts/build-search-index.mjs` → `public/search-index.json` |
| `npm run images` | `node scripts/copy-images.mjs` → `public/images/` |
| `npm run backfill` | add missing title/description frontmatter |
