---
title: cook — CLI
description: The openremap cook command — every flag, the diff it performs, real output, and what to do when cook refuses to build a recipe.
tags: [cook, cli, recipe]
status: stable
---

# `openremap cook`

Run `cook` from the terminal to compare a stock (unmodified) ECU binary with
a tuned ECU binary and save every difference as a `.remap` recipe.

Each changed block is recorded with its offset, the original bytes (`ob`),
the new bytes (`mb`) and a short **context anchor** (`ctx`) — a slice of the
file just before the change, used to find the right location even if
offsets shifted in a different software revision. The recipe is the input
for every `validate` and `tune` command.

New here? Read the [plain-English introduction](index.md) first.

## Usage

```bash
openremap cook <ORIGINAL> <MODIFIED> [OPTIONS]
```

The order matters: the stock file first, the tuned file second.

## Arguments

| Argument | Required | Description |
|---|---|---|
| `ORIGINAL` | Yes | The unmodified (stock) ECU binary (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `MODIFIED` | Yes | The tuned ECU binary — same accepted extensions. |

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--output PATH` | `-o` | stdout | File path to write the recipe to (use `.remap`). If omitted, the recipe JSON is printed to the screen. |
| `--context-size N` | `-c` | `32` | Bytes of context to capture before each changed block (8–128). Larger values give the patcher a better anchor when offsets have shifted. |
| `--pretty / --compact` | | `--pretty` | Pretty-print the JSON with indentation, or write it as a single compact line. |
| `--annotate-maps / --no-annotate-maps` | | `--annotate-maps` | Add a `maps` layer (schema 4.4): scan the stock binary for calibration tables and record which map each change touches. `--no-annotate-maps` emits the lean 4.3 format (no map scan, no maps section). |
| `--allow-non-unique` | | off | Build the recipe even when context anchors repeat in the stock binary. The recipe is stamped **same-file-only** — `tune`/`validate` will refuse to apply it to any binary whose sha256 differs (override with `tune --force`). |
| `--help` | | | Show help and exit. |

## Examples

```bash
# Cook a recipe and save it to a file
openremap cook stock.bin stage1.bin --output recipe.remap

# Cook and print the recipe to the screen (for inspection)
openremap cook stock.bin stage1.bin

# Wider context window — recommended when you may apply the recipe to an ECU
# on a slightly different software revision
openremap cook stock.bin stage1.bin --context-size 64 --output recipe.remap

# Compact output — smaller file, harder to read
openremap cook stock.bin stage1.bin --compact --output recipe.remap
```

## Example output

```
  Cooking recipe from stock.bin vs stage1.bin …

  ✅ Recipe built successfully

  ECU                    Bosch · EDC17
  Match Key              EDC17::08001505827522B
  Format Version         4.4
  Instructions           277
  Bytes Changed          43,577
  Original               stock.bin
  Modified               stage1.bin

  Recipe saved to recipe.remap
```

A `⚠ Flagged` line is appended when some instructions carry review flags
(`flags` field) — typically edits that sit outside the calibration area.

## The region warning (advisory)

Every instruction is tagged with the flash-layout region its edit lands in
(`region`: `calibration` / `code` / `erased` / `mixed` / `unknown`). Edits
**outside** a calibration region carry a `CODE_AREA` flag and cook prints a
warning:

```
  ⚠  41 instruction(s) outside the calibration region (code/erased/mixed
     flash area): 0x291703, 0x29174B, 0x291777 … and 35 more
     These edits may not apply to other revisions of this ECU.
     Region labels are structural estimates.
```

This is a **portability signal**: calibration-table edits usually apply
across revisions of an ECU; code-area edits often do not. The tags are
advisory only — they never filter instructions, never block a cook, and
`tune` ignores them. When no calibration region is detected, instructions
are tagged `unknown` and nothing is flagged.

## When cook refuses to build

`cook` aborts (exit code 1) with an error in two situations:

- **The two files differ in size.** Byte-diffing needs the same layout; a
  size difference usually means the files are not stock-vs-tuned of the
  same binary.
- **A context anchor is not unique.** Some changed blocks sit in
  zero-padded or constant regions, so their anchor appears many times in
  the stock file. Applying such a recipe could patch the **wrong location**
  on a different revision. Re-run with `--allow-non-unique` only if the
  recipe will be applied to this exact binary (it will be stamped
  same-file-only and guarded later by `tune`/`validate`).

## How it works

`cook` reads both files fully into memory, walks them byte by byte, and
groups consecutive differences into instruction blocks. For each block it
records `offset`, `ob`, `mb` and `ctx`. The ECU identity (manufacturer,
family, match key…) is extracted from the **original** file using the same
extractor registry that powers `identify`.

## Notes

- `cook` is read-only with respect to its inputs — neither file is changed.
- The recipe JSON is human-readable: open it in any editor to inspect the
  tune before applying it to anything.
- Exit codes: `0` on success, `1` on any failure (read error, size
  mismatch, non-unique-anchor abort, unwritable output).

## See also

- [cook — API](api.md) — the same comparison from Python or JSON-RPC
- [Recipe format](../concepts/recipe-format.md) — the full `.remap` field reference
- [`cook-volatile`](../cook-volatile/index.md) — the car-portable variant
- [`tune`](../tune/index.md) — one-shot validate → apply → verify
- [`validate`](../validate/index.md) — the individual steps
