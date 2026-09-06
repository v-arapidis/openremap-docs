---
title: diff-maps — CLI
description: The openremap diff-maps command — every flag, matching pipeline, suspicious flag, recipe cross-reference, JSON output.
tags: [diff-maps, cli]
status: stable
---

# `openremap diff-maps`

Calibration-level diff: scans a stock and a tuned binary for calibration
tables, matches them by axis fingerprint, and reports cell-by-cell changes
for each matched pair — the map-level counterpart to `cook` (byte-level
diff). Useful for auditing a tune without a manufacturer database.

New here? Read the [plain-English introduction](index.md) first.

It is the same diff you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc) (where the method is
called `diff_maps`).

## Usage

```bash
openremap diff-maps <STOCK> <TUNED> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `STOCK` | Yes | The original (unmodified) binary. |
| `TUNED` | Yes | The modified binary to compare against the stock. |

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--min-score S` | `-s` | `0.55` | Minimum table score in `[0, 1]`. Lower than `scan-maps`' default to avoid missing changed maps. |
| `--threshold T` | `-t` | `0.0` | Only show maps with max absolute cell change ≥ threshold. |
| `--top N` | `-n` | `50` | Max matched maps to show. |
| `--compact` | | off | Group output — show only the top-3 changed maps per axis group. |
| `--verbose` | `-v` | off | Show before/after cell grids for each changed map. |
| `--export DIR` | | off | Write a Markdown report (`diff.md`) with before/after grids, changed cells highlighted. |
| `--region RANGE` | `-r` | (calibration region) | Restrict scanning to a byte range: `0xSTART-0xEND`. Overrides the calibration-region default. |
| `--whole-file` | | off | Scan the whole file instead of only the detected calibration region. |
| `--max-series-tables N` | | `16` | Max consecutive shared-axis tables to probe (`1` = off). |
| `--recipe PATH` | | off | Cross-reference a `.remap` recipe (see below). |
| `--annotate PATH` | | off | With `--recipe`: write the recipe augmented with a schema 4.4 `maps` layer to this path. |
| `--json` | | off | Output as JSON instead of human-readable text. |
| `--help` | | | Show help and exit. |

## How matching works

Both files are scanned **by default in their detected calibration region**
(junk tables from code/erased sectors are hidden and counted as
`stock_tables_hidden` / `tuned_tables_hidden` in JSON; a note in the human
header). Use `--whole-file` to scan everything; if no calibration signal
is found the scan falls back to the whole file. A wrong layout estimate
can only change what the *report* shows — never the recipe or patch
output.

1. Both files are scanned with the same structural scanner as
   [`scan-maps`](../scan-maps/cli.md).
2. Tables are matched in two passes:
   - **Exact fingerprint match** — identical X and Y axis breakpoint
     tuples, with offset-proximity disambiguation when two tables share
     axes.
   - **Correlation near-match** — when exact matching fails, a stock table
     with the same shape whose axes are close (breakpoints edited, within
     ~15% of the axis range) and whose grids correlate strongly
     (Pearson `r ≥ 0.95`) is paired up and flagged `↺ axes changed`.
     Without this pass, a tuner moving breakpoints would silently drop the
     map out of the report as if nothing changed there.
3. Matched pairs are diffed cell-by-cell: `tuned − stock`, plus per-cell
   percentage change.

Every match carries a **correlation** value (`r`) between its stock and
tuned grids. It drives the `⚠ suspicious` flag: near-total cell change is
flagged only when the grids do *not* correlate (low `r` — probably two
different maps sharing the same axes). A heavily retuned map (100% of
cells changed but `r ≈ 1.0`) is a legitimate retune, not a misalignment.

The report also lists:

- **Unmatched maps** — only-in-stock / only-in-tuned tables.
- **Changed-block promotion** — changed bytes in tables the axis scanner
  missed (e.g. flat-Y layouts).
- **Changed but not identified** — changed byte regions no matched table
  covers and that are not table-shaped. Every changed byte is therefore
  accounted for: matched map, promoted table, or listed here.

## Recipe cross-reference (`--recipe`)

Pass a `.remap` recipe to connect the byte-level and map-level views.
Every changed cell is checked against the recipe instructions
(byte-range overlap on the stock side):

```
◆ Recipe cross-reference (tune.remap)
  79 instruction(s) touch 29 map(s) — 738 of the changed cells are covered.
  Untracked: 0 changed cell(s) not present in the recipe.
```

Changed cells **not** covered by any recipe instruction are *untracked* —
bytes that changed in the tuned file but the recipe does not explain
(extra edits, flags, checksums). Add `--annotate out.remap` to write the
recipe back with a schema 4.4 `maps` layer (map descriptors + instruction
refs).

## Example output

```
  stock.bin vs tuned.bin

  1,985 tables found in stock · 1,990 in tuned · 342 matched pairs

  Map 0x000376F2   32×16   max +23   avg +1.9   +18.3%   Group A
  Map 0x002214D4   32×6    max  +8   avg +0.4   +12.1%   Group A
  …
```

Grouping is by axis fingerprint — maps that share RPM×Load breakpoint
axes (fuel, timing, boost families) appear together instead of scattered
by delta.

## JSON output

```bash
openremap diff-maps stock.bin tuned.bin --json
```

```json
{
  "stock": "stock.bin",
  "tuned": "tuned.bin",
  "matched_count": 342,
  "only_in_stock_count": 12,
  "only_in_tuned_count": 9,
  "unidentified_changed_count": 3,
  "unidentified_changed": [
    {"offset": 4096, "size": 32}
  ],
  "groups": [
    {"group": "A", "maps": 2, "cols": 32, "rows": 16, "x_axis": [0, 500, 800, "…"], "y_axis": ["…"]}
  ],
  "matches": [
    {
      "offset_stock": 227058,
      "cols": 32,
      "rows": 16,
      "group": "A",
      "max_abs": 23,
      "avg_abs": 1.9,
      "changed_cells": 180,
      "total_cells": 512,
      "correlation": 0.99,
      "suspicious": false,
      "near_match": false,
      "axis_changed": false
    }
  ]
}
```

Near-matched (axis-changed) maps additionally carry `"near_match": true`,
`"axis_changed": true` and the old/new axis values under `axis_stock` /
`axis_tuned`.

## Notes

- The scanner is **structural, not semantic** — it does not know whether a
  map is fuel, timing or boost. `--classify` on
  [`scan-maps`](../scan-maps/cli.md) gives probabilistic labels.
- Large scans take a few seconds per file; results are deterministic.
- Changes in flags, checksums, or VIN areas appear as **changed but not
  identified** regions rather than maps — use
  [`cook`](../cook/index.md) for the complete byte-level picture.

## See also

- [diff-maps — API](api.md) — the same diff from Python and JSON-RPC
- [scan-maps — CLI](../scan-maps/cli.md) — how tables are found first
- [cook — CLI](../cook/index.md) — the byte-level diff and recipe
