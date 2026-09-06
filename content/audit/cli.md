---
title: audit — CLI
description: The openremap audit command — the three-way receipt check; every flag, the three verdicts, example output.
tags: [audit, cli, recipe]
status: stable
---

# `openremap audit`

The receipt check. You have three things — `stock.bin` (your original),
`tuned.bin` (what someone gave you), `recipe.remap` (the record they claim
matches). Audit answers **"do these three actually belong together?"**

New here? Read the [plain-English introduction](index.md) first.

## Usage

```bash
openremap audit <STOCK> <TUNED> <RECIPE> [OPTIONS]
```

## Arguments & options

| Argument | Required | Description |
|---|---|---|
| `STOCK` | Yes | The stock (original) ECU binary (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `TUNED` | Yes | The tuned (modified) ECU binary to check. |
| `RECIPE` | Yes | The recipe file (`.remap`, `.openremap`, or `.json`) claimed to describe the tune. |

| Option | Description |
|---|---|
| `--json` | Output as JSON instead of a human-readable report (adds `stock`, `tuned`, `recipe` keys to the result). |
| `--help` | Show help and exit. |

## The three verdicts

| Verdict | Question | Signal |
|---|---|---|
| **Provenance** | Was the recipe built from THIS stock? | `ecu.sha256` in the recipe vs the stock's hash |
| **Fingerprint** | Is the recipe the honest record of the pair? | recipe `fingerprint` vs a fresh stock→tuned re-cook |
| **Unaccounted** | Which changed bytes does the recipe NOT explain? | recipe applied to stock → predicted file → diff vs the actual tuned file |

Unaccounted blocks are labelled with their flash-layout region
(`calibration` / `code` / `erased` / `ident` / `mixed`) so you can judge
hidden edits: *"4 changes not in the recipe — 2 bytes at 0x… [ident]"*.

When the recipe cannot be applied to the stock at all (wrong stock,
corrupted instructions), verdict 3 is **skipped with a warning** — the
audit reports, it never crashes.

### What the fingerprint covers (and what it doesn't)

The recipe fingerprint hashes **only the instruction content** —
`(offset, ob, mb)` tuples. Metadata (names, tags, `created_at`), the
`creator` block, and the `maps` annotation layer are excluded **by
design**, so:

- a recipe re-cooked minutes or years later still fingerprint-matches
  (no timestamp noise),
- future improvements to map annotation never break verdict 2.

One honest caveat: if a future version changes the diff engine's block
segmentation, a re-cook could produce different instruction boundaries and
old recipes would no longer match — the audit reports the mismatch; it
never crashes.

## Example

```
  OpenRemap — Tune Audit
  stock.bin · tuned.bin · stage1.remap

  ✓ PASS  Provenance — recipe built from this stock (sha256 match)
  ✓ PASS  Fingerprint — recipe honestly describes the pair (match)
  ✗ FAIL  Unaccounted — 2 byte(s) in 1 block(s) changed but NOT in the recipe:
     0x00000456       2 bytes  [calibration]

  ⚠  Inconsistencies found — review the failed verdicts above.
```

## What it is NOT

- Not a safety verdict on the tune itself — only consistency between the
  three artifacts.
- Not an applicability check for other software revisions — that is
  `validate before`.

## Use cases

- **Forum scenario** — you downloaded three recipes and received a
  `tuned.bin`: which recipe matches this pair?
- **Tuner deliverable audit** — did they do 12 edits but declare 9?
- **Tamper detection** — an edited recipe no longer matches its pair.

## Notes

- `audit` is read-only — it never modifies any file.
- Exit codes: `0` when all verdicts pass, `1` when inconsistencies are
  found or the recipe cannot be read/parsed.

## See also

- [audit — API](api.md) — the same check from Python or JSON-RPC
- [`cook`](../cook/index.md) — build a recipe
- [`validate`](../validate/index.md) — applicability checks
