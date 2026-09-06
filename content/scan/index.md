---
title: scan
description: Sort a whole folder of ECU files in one go — preview first, then move each file into the right group.
tags: [scan, cli]
status: stable
---

# scan

Have a folder full of files from cars' computers, and no idea which is
which? `scan` reads **every file in a folder** in one pass and sorts each
one into a group.

It is like a post-office sorting machine for ECU files: each file is
checked against everything OpenRemap knows, then placed into one of five
boxes — fully identified, family known but version missing, claimed by
several extractors, unknown, or wrong file type.

The best part: by default it only **previews** — it shows you what it
would do and **moves nothing** until you say so.

## When do I need it?

- **Organising a big collection.** You have hundreds of dumps; you want
  them sorted into `manufacturer/family` folders so you can find one
  later.
- **Triaging a batch.** Which files are supported? Which are suspicious?
  Which are junk? One command, one report.
- **Before a project.** A tidy library makes identify/cook/tune much
  easier to run on the right files.

## Try it (2 minutes)

First, the safe preview — nothing moves:

```bash
openremap scan ./my_bins/
```

You will see one line per file with its outcome: `SCANNED`, `SW MISSING`,
`CONTESTED`, `UNKNOWN` or `TRASH`. When the results look right, actually
sort the files:

```bash
openremap scan ./my_bins/ --move --organize
```

`--organize` builds the tidy `manufacturer/family` tree (for example
`scanned/Bosch/EDC17/`). Files are **never overwritten** — if a name is
taken, a counter is appended (`file__1.bin`, `file__2.bin`, …).

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **SCANNED** | Fully identified — one extractor matched and read a valid match key. Ready to use |
| **SW MISSING** | The family was recognised, but the software version could not be read (e.g. wiped). Not broken — just incomplete |
| **CONTESTED** | More than one extractor matched the same file. Needs a human look |
| **UNKNOWN** | Nothing matched — unsupported family, or not an ECU file at all |
| **TRASH** | Wrong file extension — moved aside without being read |

Identified files also carry a confidence tag: `[HIGH]` looks like an
original factory file, `[SUSPICIOUS]` means something raised a red flag
(like a filename containing "stage" or "remap"). A tag is a hint — run
`identify` on a flagged file to see the full reasoning.

## For developers

The same batch classification is one method of `openremap.api` — but the
API only *classifies and reports*; it never moves files. Moving is a
terminal-only feature:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [scan — CLI](cli.md) | `openremap scan ./my_bins/` |
| Python code | [scan — API](api.md) | `api.call("scan", {"directory": "./my_bins/"})` |
| Any language (JSON-RPC) | [scan — API](api.md) | a request with `"method": "scan"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option, the folder layouts and reports | [scan — CLI](cli.md) |
| Call `scan` from your own code | [scan — API](api.md) |
| Get the full story on one flagged file | [`identify`](../identify/index.md) |
| Locate VINs inside individual files | [`scan-vins`](../scan-vins/index.md) |
