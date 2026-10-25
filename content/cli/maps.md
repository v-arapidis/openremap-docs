---
title: Maps
description: >-
  Find the tuning tables in a file, compare two files table by table, and draw one
  table as a picture.
tags: [cli]
status: stable
---

# Maps

A **map** (table) is a grid of numbers in the file — fuel, boost, ignition timing.
These three commands find them, compare them, and draw them.

## `scan-maps`

**What it is:** finds plausible tuning tables in a file. No family knowledge is
needed, so it also works on an ECU the tool does not recognise.

```bash
openremap scan-maps original.bin --top 8
```

```
  original.bin

  ✓  Genuine calibration binary
  15,967 axes  •  473 tables  •  4,194,304 bytes

      Offset       Dim   Cells    Score      X Axis      Y Axis
  0x002214D4      32×6  u16 LE  0.965  0x00221488  0x2214C8
  0x00288B80     16×16  u16 LE  0.960  0x00288B3E  0x288B5E
  0x00245128       9×7  u16 LE  0.956  0x00245108  0x24511A
  0x00226762       8×8  u16 LE  0.953  0x002266C2  0x2266D2
```

(Trimmed to 4 of the top 8.) `Offset` is where the table is, `Dim` its shape,
`Score` how table-like it looks, and the axis columns show where its row and column
labels are stored.

Limits: `--region` to scan part of the file, `--min-score` to be pickier,
`--whole-file` to include areas outside the calibration region.

## `diff-maps`

**What it is:** compares two files table by table and says what moved, by how much.

```bash
openremap diff-maps original.bin stage1.bin --top 8
```

```
  OpenRemap — Map-Level Diff
  original.bin  vs  stage1.bin  •  2,312 matched  •  21 only-in-stock
  14 only-in-tuned  •  69 unidentified  •  scan 5.1s

      Offset       Dim    Cells     Max Δ     Avg Δ     Max %     Avg %   Changed
  Group A — 1 map(s) · 8×5 u16 LE · X=[0, 6, 600, 700…+4]
  0x0024B366       8×5   u16 LE   4608.00   2188.80    +20.0%    +14.5%     29/40  ↻ realigned
  Group B — 2 changed-block table(s) · no axes (detected from changed bytes)
  0x0026B1BA       4×6   u16 LE   3302.00   3302.00   -100.0%   +100.0%     24/24  ⚑ no-axis
```

(Trimmed.) Three things to notice:

- **`69 unidentified`** — changed bytes that belong to no table. The command shows
  the number instead of hiding it.
- **`↻ realigned`** — the table was found at a different place in the tuned file.
- **`⚑ no-axis`** — the table was guessed from the changed bytes, so its percentages
  are **not** relative to real axis values. A `-100% / +100%` row here is normal and
  means nothing on its own.

## `map-image`

**What it is:** draws one table as an SVG picture — every cell's value, coloured,
with the real axis numbers from the file.

First, see what is available:

```bash
openremap map-image original.bin --list
```

```
  473 tables at min score 0.85 (top 2000 shown)
    [  0] 0x2214D4  32x6  2 B  score 0.97  unknown
    [  1] 0x288B80  16x16  2 B  score 0.96  unknown
    [  2] 0x245128  9x7  2 B  score 0.96  unknown
```

(Trimmed.) Then draw one, by offset:

```bash
openremap map-image original.bin --offset 0x2214D4 --output map.svg
```

```
  original.bin
  TABLE         0x2214D4  32 x 6 cells  2 B
  SCORE         0.97  label unknown
  VALUES        min 38 · max 229 · mean 133.5 · distinct 192
  BREAKPOINTS   read from the binary
  WRITTEN       map.svg

  Open it with: xdg-open map.svg
```

Open the file in any browser or image viewer. Use `--top 0` instead of `--offset` to
draw the highest-scoring table without looking up its address.

## Where to go next

| You want to… | Go to |
|---|---|
| turn a difference into a reusable recipe | [`cook-strict`](cook.md#cook-strict) |
| see a table as numbers in a terminal | the [MAPS screen](../tui/maps.md) |
