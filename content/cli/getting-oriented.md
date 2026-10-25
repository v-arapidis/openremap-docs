---
title: Getting oriented
description: >-
  Three commands that describe the tool itself — a command list, a walkthrough in
  plain English, and every ECU family it knows.
tags: [cli]
status: stable
---

# Getting oriented

Before you run anything on a file, these three tell you what the tool can do.

## `commands`

Prints every command with one line each. The shortest possible overview.

```bash
openremap commands
```

```
  OpenRemap — Command Reference
  ─────────────────────────────────────────────────────────
  Run  openremap <command> --help  for full options on any command.

  openremap                        Launch the full terminal UI (no arguments needed).
  openremap commands               Print a one-line-per-command cheat-sheet…
  openremap workflow               Print a complete step-by-step workflow guide…
  openremap families               List all supported ECU families…
  openremap identify               Identify an ECU binary — manufacturer, family…
  openremap cook-strict            Build a schema-5.0 recipe requiring unique anchors…
  …
```

(Trimmed — it lists all 26 commands plus the three `validate` sub-commands.)

## `workflow`

The whole job, in order, in plain English: what to type, what you should see, and
what to do when something goes wrong. If you have never done this before, read this
one first.

```bash
openremap workflow
```

```
  OpenRemap — Workflow Guide
  ─────────────────────────────────────────────────────────
  A complete walkthrough from raw binary to verified patched file.

  STEP 0 — Organise a collection  (optional — skip if you have your files ready)
  …
  STEP 1 — Identify the file
  STEP 2 — Health-check it
  …
```

(Trimmed — the full guide is about 165 lines and ends with what to do when a step
fails.)

## `families`

Every ECU family the tool knows: era, typical file size, and a note about it.

```bash
openremap families
```

```
  Supported ECU Families
  ─────────────────────────────────────────────────────────────────
  FAMILY                  ERA           SIZE                  NOTES
  ─────────────────────────────────────────────────────────────────
  EDC1 / EDC2             1990–1997     32–64 KB              Audi 80 / A6 TDI, BMW 525 TDS…
  EDC 3.x                 1993–2000     128–512 KB            VAG TDI, BMW diesel…
  EDC15                   1997–2004     512 KB                Two sub-formats: Format A and B.
  EDC16                   2003–2008     256 KB / 1 MB / 2 MB  DECAFE magic at fixed offsets…
  EDC17 / MEDC17 / …      2008–present  2–8 MB                The dominant modern platform.
  …
```

(Trimmed.) Add `--family` for one family in detail:

```bash
openremap families --family EDC17
```

```
  EDC17 / MEDC17 / MED17 / ME17
  ─────────────────────────────────────────────────────────
  Era             2008–present
  File size       2–8 MB
  Sub-families    EDC17C, EDC17CP, MEDC17, MED17, ME17
  Identifier      SB_V / NR000 / Customer. markers; no DECAFE; no TSW; no 0xC3 fill
  SW format       1037xxxxxxxxx (extended, may include suffix letters)
```

This list is **reference information, not detection**: a family being listed does
not mean your file will be recognised as it. Only your file's own bytes decide that.

## Where to go next

| You want to… | Run |
|---|---|
| know what a file is | [`openremap identify`](look-at-a-file.md#identify) |
| know whether it is healthy | [`openremap health`](look-at-a-file.md#health) |
| try the tool with no file at all | [`openremap synth`](batch-and-fixtures.md#synth) |
