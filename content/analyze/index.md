---
title: analyze
description: One command that tells you everything about an ECU file — identity, layout, maps, checksums, and a health verdict. For beginners first.
tags: [analyze, cli, api]
status: stable
---

# analyze

If `identify` answers *"what ECU is this?"*, `analyze` answers *"tell me
everything about this file."*

You give `analyze` one ECU binary and it runs every built-in analysis in a
single pass: who made the ECU and how sure we are, the car ID (VIN) if
found, the layout of the file (code vs calibration areas), the tuning
tables (maps) inside it, the checksums, and a final health verdict.

It is like taking the file for a full inspection instead of just reading
its name tag. It only reads the file — it never changes it.

## When do I need it?

- **When you want the whole picture of a dump** — especially a file you are
  curious about or reverse-engineering.
- **When `identify` is not enough.** `identify` gives the identity;
  `analyze` adds maps, layout, and checksums around it.
- **When you need a JSON report for your own tooling.** `analyze --json`
  outputs one structured report with everything inside.

Not sure the file is healthy enough to build on? That is the job of
[`health`](../health/index.md), which gives a clear go / no-go verdict.
`analyze` describes; `health` judges.

## Try it (2 minutes)

```bash
openremap analyze my-file.bin
```

A full scan of a large file takes a while (about 18 seconds for a 4 MB
dump) because it looks everywhere. To see the quick version first, add
`--fast` — you get identity, VIN and layout, skipping the slow parts:

```bash
openremap analyze my-file.bin --fast
```

You will see sections like this (shortened):

```
  raw binary  •  4,194,304 bytes  •  00f727e8…

  ── Identity ─────────────────────────────────────────────────────────────
  Bosch · EDC17
  Manufacturer      Bosch
  ECU Family        EDC17
  Match Key         EDC17C66::1037541778

  ── Confidence ───────────────────────────────────────────────────────────
  HIGH  (top signals…)

  ── Flash layout ─────────────────────────────────────────────────────────
  calibration  0x020000-0x040000      131,072 B   42 tables
  ident blocks: 0x00BC9C, …

  ── Health ───────────────────────────────────────────────────────────────
  ✓ identity      Bosch EDC17
  ...
```

(Output shortened — the full report also covers maps, checksums and a
coherence line, depending on the file and the flags you used.)

## Understanding the answer

| Section | In plain words |
|---|---|
| **Identity + Confidence** | Who made the ECU, which family, and how sure OpenRemap is |
| **Coherence** | Do the separate analyses agree with each other? (identity vs checksums vs architecture) |
| **VIN candidate** | A car ID number found inside the file (only when it is a believable match) |
| **Flash layout** | How the file is organised — code area, calibration area, where the tables live |
| **Maps** | The tuning tables found inside, with the most interesting ones on top |
| **Checksums** | Are the file's built-in "fingerprints" still valid? |
| **Health** | The six checks from [`health`](../health/index.md) as a summary at the end |

New words you will meet — a **map** is a tuning table (fuel, boost,
ignition…), and its **axis** is the scale (RPM, load) the table is indexed
by. The [glossary](../concepts/glossary.md) defines them all.

## For developers

The same full analysis is one method of `openremap.api` — same sections,
same result, from code or over JSON-RPC:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [analyze — CLI](cli.md) | `openremap analyze my-file.bin --json` |
| Python code | [analyze — API](api.md) | `api.call("analyze", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [analyze — API](api.md) | a request with `"method": "analyze"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag, section and the JSON schema | [analyze — CLI](cli.md) |
| Call `analyze` from your own code | [analyze — API](api.md) |
| Just the identity | [`identify`](../identify/index.md) |
| A clear healthy / not-healthy verdict | [`health`](../health/index.md) |
| How the code-reference signal works | [Decoders](../concepts/decoders.md) |
