---
title: scan-maps
description: Find the tuning tables (maps) inside an ECU file — no need to know the ECU family first. For beginners first.
tags: [scan-maps, cli, api]
status: stable
---

# scan-maps

Inside an ECU file there are **maps** — the tuning tables the tuner
changes: fuel, boost, ignition timing, and so on. Each map is a grid of
numbers with a scale (the **axes**: usually RPM and engine load).

`scan-maps` hunts for those grids **structurally**: it looks for the
pattern "a scale of rising numbers, followed by a block of smooth data" —
the fingerprint of a calibration map. It does not need to know which ECU
family the file is from.

Think of it as a metal detector: it beeps on things that *look like* maps,
anywhere in the file, even in ECUs OpenRemap does not officially support.

## When do I need it?

- **Health-checking a file.** A real ECU file contains hundreds or
  thousands of axes; an encrypted, corrupt, or empty file has almost none.
  The first line of output tells you which situation you are in.
- **Exploring an unsupported ECU.** The offsets it finds are great starting
  points for other tools.
- **Before building an extractor.** Understand a binary's structure before
  writing support for it.

Honest caveat: the scanner is **structural, not semantic**. It finds
*grids that look like maps* — it does not know if one is "fuel" or
"timing". You interpret what you find. (With `--classify` it makes its
best guess with a confidence label, like `fuel 0.72`.)

## Try it (2 minutes)

```bash
openremap scan-maps my-file.bin
```

```
  my-file.bin

  ✓  Genuine calibration binary
  15,967 axes  •  1,985 tables  •  4,194,304 bytes

      Offset       Dim   Cells    Score
  ─────────────────────────────────────────
  0x000376F2     32×16  u16 LIT  0.977
  0x002214D4      32×6  u16 LIT  0.965
  ...
```

(Output shortened — by default only the top 20 tables are listed.)

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **✓ / ⚠ / ✗ Genuine calibration binary** | The health signal — does this file look like a real ECU? (✓ = ≥ 1,000 axes) |
| **axes / tables** | How many scales and grids were found |
| **Offset, Dim, Cells** | Where each grid is, its size (rows × columns), and its cell width / byte order |
| **Score** | How map-like the grid looks (0–1; higher is more convincing) |
| **⟶code** (with `--xrefs`) | Real program instructions were seen reading this table — strong evidence it is a genuine map |

By default the scan focuses on the **calibration region** (the part of the
file the layout tool identifies as the tunable area) to avoid junk from
code or empty areas. Use `--whole-file` to scan everything.

## For developers

The same scan is available as methods of `openremap.api` — note the method
name uses an underscore (`scan_maps`), the CLI command uses a dash
(`scan-maps`):

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [scan-maps — CLI](cli.md) | `openremap scan-maps my-file.bin` |
| Python code | [scan-maps — API](api.md) | `api.call("scan_maps", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [scan-maps — API](api.md) | a request with `"method": "scan_maps"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag (regions, classify, xrefs, CSV export, batch) | [scan-maps — CLI](cli.md) |
| Call `scan_maps` from your own code | [scan-maps — API](api.md) |
| First see how the file is organised | [`layout`](../layout/index.md) |
| Understand what a map and an axis are | [Glossary](../concepts/glossary.md) |
