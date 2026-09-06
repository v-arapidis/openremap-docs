---
title: scan-maps — CLI
description: The openremap scan-maps command — every flag, regions, classify, code references, CSV export, batch mode, JSON output.
tags: [scan-maps, cli]
status: stable
---

# `openremap scan-maps`

Structural calibration-map scanner: finds monotonically-increasing 16-bit
sequences (RPM/load breakpoints) and the 2D data tables that follow them —
**no manufacturer identification required**. Works on any binary regardless
of ECU family.

New here? Read the [plain-English introduction](index.md) first.

It is the same scan you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc) (there the method is
called `scan_maps`).

## Usage

```bash
openremap scan-maps <FILE|DIRECTORY> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `PATH` | Yes | An ECU binary (`.bin` / `.ori` / `.hex` / `.s19` / `.srec` / `.mot`) **or a directory** of binaries to scan. |

With a directory, use `--recursive` and/or `--export` for batch work (see
below).

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--top N` | `-n` | `20` | Number of top-scoring tables to show per file. |
| `--min-score S` | `-s` | `0.85` | Minimum table score in `[0, 1]`. Higher = fewer false positives. |
| `--region RANGE` | `-r` | (calibration region) | Restrict scanning to a byte range: `0xSTART-0xEND` or `START-END`. Overrides the calibration-region default. |
| `--whole-file` | | off | Scan the whole file instead of only the detected calibration region. |
| `--classify` | | off | Annotate tables with probabilistic content labels (`fuel 0.72`, …). |
| `--xrefs` | | off | Add the code-reference signal (see below). Adds ~4 s per file on a 4 MB EDC17. |
| `--max-series-tables N` | | `16` | Max consecutive shared-axis tables to probe after each anchor. `1` disables. |
| `--show-series` | | off | Group tables that share identical X/Y axes with indented `└─` continuation rows. |
| `--export PATH` | | — | Export found tables as CSV files. With a directory: one sub-folder per file. |
| `--recursive` | `-R` | off | Recurse into sub-directories when scanning a directory. |
| `--verbose` | | off | Per-file progress output in batch mode. |
| `--json` | | off | Output as JSON instead of human-readable text. |
| `--help` | | | Show help and exit. |

## Calibration-region default

By default the scan is limited to the **calibration region** — the flash
area the layout segmenter labels as calibration. Junk tables found in
code / erased / mixed sectors are hidden and counted (in JSON as
`tables_hidden`); the human output notes them:

```
  304 table(s) outside the calibration region hidden — use --whole-file to scan the whole file.
```

- `--whole-file` scans everything (code-sector junk included).
- `--region` overrides the default entirely — an explicit range wins.
- **No calibration signal** (small / synthetic / unfamiliar binaries)
  falls back to whole-file behaviour automatically — the default never
  hides tables where it cannot find a calibration region.

The layout estimate is structural inference, so it can be wrong on unusual
binaries — but a wrong estimate only changes what the report *shows*,
never recipe or patch output.

## Shared-axis tables

Real ECUs often place several calibration tables (fuel, timing, boost,
EGR…) consecutively after a single pair of RPM × Load axes:

```
[RPM axis][Load axis][Fuel table][Timing table][Boost table][EGR table]
```

The scanner detects the first table, then probes forward for additional
blocks with identical dimensions sharing the same axes. Each block must
pass the same scoring as the anchor — garbage or mismatched geometry stops
the series. Use `--max-series-tables 1` to report only the primary table
per axis pair, and `--show-series` to see the grouping.

## Code references (`--xrefs`)

With `--xrefs`, the code regions are disassembled (**capstone**) and every
byte offset a real instruction statically references is collected. A table
whose **data block** is referenced by code is almost certainly a genuine
calibration map:

- its score gets a small bonus (+0.06, capped at 1.0);
- it is marked `⟶code` in the human listing;
- JSON gains a top-level `xrefs` summary (`status`, `arch`,
  `base_address`, `reference_count`, …) and an `xref` evidence block on
  each table (`referenced_by_code`, `data_refs`, `axis_refs`, `insns`).

Safety contract:

- **Presence-only** — a table is never demoted for *lacking* a reference
  (most ECU code reaches maps via base-register addressing that is not
  statically resolvable). Absence proves nothing.
- **Arch-gated** — supported families only: EDC17 (TriCore) and
  Denso/Hitachi SuperH; everything else skips silently.
- **Load base auto-detected** — the address base is inferred per file from
  table-data hits; no hardcoded manufacturer knowledge.

Cost: ~4 s per file on a 4 MB EDC17 — opt-in for batch scans.

## Scoring

Each 2D table is scored on a multi-dimension heuristic: **axis quality**
(smooth, monotonic breakpoints), **table smoothness** (row/column gradient
continuity — real calibration data is smooth, code is not),
**dimensionality** (plausible map dimensions) and a **stripe penalty**
(repeated rows/columns, common in padding).

| Score | Meaning |
|---|---|
| ≥ 0.90 | High confidence — smooth calibration surface, genuine axis values |
| 0.85–0.90 | Plausible — likely a real calibration map |
| 0.75–0.85 | Mixed — some real maps, some encoded data |
| < 0.75 | Low confidence — mostly coincidental structures |

The default `--min-score` of `0.85` keeps >90% of genuine maps with far
fewer false positives than `0.75`. Lower it to `0.55` for exhaustive
scanning; raise to `0.90` for the cleanest signal.

## Health signal

| Axes found | Signal | Meaning |
|---|---|---|
| ≥ 1,000 | ✓ Genuine calibration binary | Expected for a real ECU |
| 100–999 | ⚠ Few axes | Possibly corrupted, trimmed, or a partial dump |
| < 100 | ✗ Very few axes | Likely encrypted, non-ECU, or empty |

## Example output

```
  original.bin

  ✓  Genuine calibration binary
  15,967 axes  •  1,985 tables  •  4,194,304 bytes

      Offset       Dim   Cells    Score      X Axis      Y Axis
  ──────────────────────────────────────────────────────────────
  0x000376F2     32×16  u16 LIT  0.977  0x00037692  0x376D2
  0x002214D4      32×6  u16 LIT  0.965  0x00221488  0x2214C8

  … and 1983 more.  Use --top 1985 to see all, or --min-score 0.8 to filter.
```

## JSON output

```bash
openremap scan-maps ecu.bin --json --top 5
```

```json
{
  "file": "ecu.bin",
  "file_size": 4194304,
  "axes_count": 15967,
  "tables_count": 1985,
  "layout_filtered": true,
  "tables_hidden": 304,
  "tables": [
    {
      "offset": 227058,
      "cols": 32,
      "rows": 16,
      "cell_width": 2,
      "byte_order": "little",
      "x_axis_offset": 226962,
      "y_axis_offset": 227026,
      "score": 0.977
    }
  ]
}
```

`layout_filtered` is `true` when the calibration-region default applied;
`tables_hidden` counts tables outside it (both `false`/`0` with
`--whole-file`). Axes are capped at 200 in JSON output to keep the payload
reasonable. Offsets are always absolute file offsets, regardless of
`--region`.

## Batch mode

```bash
# Scan a whole folder, recurse, and export one CSV per file
openremap scan-maps ./my_bins/ --recursive --export ./csv_exports/ --verbose
```

## Notes

- The scanner detects **consecutive** `[X axis][Y axis][data]` layouts and
  shared-axis table series. It does not know whether a table is fuel,
  timing, boost or EGR — that is what `--classify` (best guess with a
  label) and you, the tuner, are for.
- Runtime is ~0.5–3 seconds per file for a typical 1–4 MB binary.

## See also

- [scan-maps — API](api.md) — the same scan from Python and JSON-RPC
- [layout — CLI](../layout/cli.md) — finding the calibration region first
- [identify — CLI](../identify/cli.md) — identify before you scan
