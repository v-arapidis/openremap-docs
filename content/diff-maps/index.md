---
title: diff-maps
description: Compare a stock and a tuned file at the tuning-table level — which maps changed and by how much. For beginners first.
tags: [diff-maps, cli, api]
status: stable
---

# diff-maps

When a tuner modifies a file, they do not change bytes randomly — they
change **maps** (the tuning tables). `diff-maps` compares a **stock**
(original) file with a **tuned** file and answers the tuner's question:
*which maps changed, and by how much?*

It is the map-level cousin of [`cook`](../cook/index.md): `cook`
diffs at the raw byte level and builds a recipe; `diff-maps` finds the
actual tables and reports each one's change — `max +23`, `avg +1.9`,
`+18.3%` — so you can audit a tune without a manufacturer database.

Think of `cook` as "what bytes are different?" and `diff-maps` as "which
tables were touched, and how hard?".

## When do I need it?

- **Auditing a tune you did not make.** See exactly which maps a "stage 1"
  file touched, and how aggressively.
- **Checking a recipe explains everything.** With `--recipe`, `diff-maps`
  tells you which changed cells the recipe covers — and which changes are
  *untracked* (extra edits the recipe does not explain).
- **Reviewing your own work** before flashing.

## Try it (2 minutes)

```bash
openremap diff-maps stock.bin stage1.bin
```

```
  stock.bin vs stage1.bin

  1,985 tables found in stock · 1,990 in tuned · 342 matched pairs

  Map 0x000376F2   32×16   max +23   avg +1.9   +18.3%   Group A
  Map 0x002214D4   32×6    max  +8   avg +0.4   +12.1%   Group A
  ...
```

(Output shortened — by default the top 50 matched maps are shown.)

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **matched pairs** | How many tables were found in both files and paired up |
| **Map + offset** | Where the table lives (offset shown for cross-referencing) |
| **max / avg** | The biggest single-cell change and the average change per cell |
| **+18.3%** | How much the table changed overall |
| **Group A / B…** | Maps sharing the same RPM/load scale are grouped together — so fuel/timing/boost families appear side by side |
| **↺ axes changed** | The tuner *moved the breakpoints* of this map — matched by correlation, not exact values |
| **⚠ suspicious** | Near-total cell change *without* correlation — probably two different tables sharing the same scale |

Every changed byte is accounted for somewhere: a matched map, a promoted
changed block, or a "changed but not identified" region (flags, VIN,
checksum stores — the kind of thing `cook` catches at byte level).

## For developers

The same diff is one method of `openremap.api` — note the method name uses
an underscore (`diff_maps`):

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [diff-maps — CLI](cli.md) | `openremap diff-maps stock.bin stage1.bin` |
| Python code | [diff-maps — API](api.md) | `api.call("diff_maps", {"stock_path": "stock.bin", "tuned_path": "stage1.bin"})` |
| Any language (JSON-RPC) | [diff-maps — API](api.md) | a request with `"method": "diff_maps"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag (threshold, grouping, recipe cross-reference, exports) | [diff-maps — CLI](cli.md) |
| Call `diff_maps` from your own code | [diff-maps — API](api.md) |
| The byte-level diff and recipe | [`cook`](../cook/index.md) |
| How tables are found in the first place | [`scan-maps`](../scan-maps/index.md) |
