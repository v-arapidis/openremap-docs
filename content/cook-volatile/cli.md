---
title: cook-volatile — CLI
description: The openremap cook-volatile command — every flag, the volatile recipe section, evidence tiers, and how it differs from cook.
tags: [cook-volatile, cli, recipe]
status: stable
---

# `openremap cook-volatile`

Cook a **car-portable** recipe by diffing a stock and a tuned ECU binary.
It behaves like [`cook`](../cook/index.md) (byte diff, context anchors,
Guard-3 strictness) plus one extra pass: near-certain volatile
instructions — VIN records and verified checksum stores — are detected and
**excluded from the patch list**, with evidence recorded in a `volatile`
recipe section (schema 4.5).

New here? Read the [plain-English introduction](index.md) first.

**Why:** a recipe cooked from (stockA, tunedA) fails on stockB of the same
software revision whenever stockA and stockB differ inside an instruction's
anchor window — in practice when the tune touched volatile bytes (VIN in
flash, checksum-store bytes recomputed on save, serial/IMMO counters).
`cook-volatile` removes those instructions so the recipe applies to any car
whose calibration bytes match.

## Usage

```bash
openremap cook-volatile <ORIGINAL> <MODIFIED> [OPTIONS]
```

## Arguments

| Argument | Required | Description |
|---|---|---|
| `ORIGINAL` | Yes | The unmodified (stock) ECU binary (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `MODIFIED` | Yes | The tuned ECU binary — same accepted extensions. |

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--output PATH` | `-o` | stdout | File path to write the recipe to. If omitted, the recipe JSON is printed to the screen. |
| `--context-size N` | `-c` | `32` | Context bytes captured before each changed block (8–128). |
| `--pretty / --compact` | | `--pretty` | Pretty-print the JSON, or write it as a single compact line. |
| `--no-exclude` | | off | Do NOT exclude anything — volatile instructions stay in the patch list, recorded only as flagged. Maximum safety, zero portability. |
| `--exclude-uncertain` | | off | Additionally exclude warning-class instructions (ident-block strings, low-entropy counter clusters) — recorded as lower-confidence exclusions. |
| `--accept-volatile` | | off | Suppress the per-instruction review list (summary only) — for scripted pipelines. |
| `--annotate-maps / --no-annotate-maps` | | `--annotate-maps` | Add the `maps` layer (schema 4.4). Runs *after* volatile filtering, so `maps[].instruction_refs` index the kept set. |
| `--allow-non-unique` | | off | Produce the recipe even when context anchors repeat in the stock binary (cook parity — reliable only on this exact binary). |
| `--help` | | | Show help and exit. |

## The volatile section (schema 4.5)

Recipes produced by `cook-volatile` carry a `volatile` top-level section
alongside `instructions`:

```json
{
  "schema_version": "4.5",
  "instructions": [ "...only kept (calibration-relevant) instructions..." ],
  "volatile": {
    "excluded": [
      {
        "index": 12,
        "offset": 123456,
        "offset_hex": "1E240",
        "size": 4,
        "kind": "VIN",
        "confidence": 0.95,
        "action": "excluded",
        "evidence": [ "overlaps VIN-structured record 'WVW...' at 0x1E240-0x1E251 (confidence 0.95, evidence: wmi, ...)" ]
      }
    ],
    "flagged": [ { "kind": "SERIAL_OR_IDENT", "action": "flagged", "...": "..." } ],
    "summary": { "excluded_count": 1, "flagged_count": 0, "bytes_excluded": 4 }
  }
}
```

- `index` is the instruction's original (pre-exclusion) index, so reviewers
  can cross-reference.
- `statistics` is recomputed over the **kept** set; the `fingerprint`
  covers the kept instructions too.
- `metadata.source` is `"cook_volatile"` and `metadata.excluded_volatile`
  is `true` (it is `false` with `--no-exclude`).

### Evidence tiers

| Class | Kind tag | Evidence | Default action |
|---|---|---|---|
| VIN | `VIN` | VINScanner — ISO 3779 check digit, known WMI, ident-block context; confidence ≥ 0.9 | **excluded** |
| Checksum store | `CHECKSUM_STORE` | instruction overlaps a verified family scheme's store offset | **excluded** |
| Serial / ident string | `SERIAL_OR_IDENT` | ASCII change inside an ident block | flagged (`--exclude-uncertain` excludes) |
| Low-entropy counter cluster | `COUNTER_OR_SERIAL` | low-entropy context anchor | flagged (`--exclude-uncertain` excludes) |

Exclusion is only for **near-certain** classes; uncertain classes degrade
to flags/warnings, never silent drops. When no checksum detector fires for
a binary, no `CHECKSUM_STORE` exclusions are made — the recipe keeps the
safe behaviour instead of guessing.

## Examples

```bash
# Cook a portable recipe and save it
openremap cook-volatile stock.bin stage1.bin --output portable.remap

# Print the recipe with the per-instruction volatile review list
openremap cook-volatile stock.bin stage1.bin

# Keep every instruction, only annotated (max safety, zero portability)
openremap cook-volatile stock.bin stage1.bin --no-exclude

# Also exclude warning-class instructions (ident strings, counters)
openremap cook-volatile stock.bin stage1.bin --exclude-uncertain

# Skip the review list — scripted pipelines
openremap cook-volatile stock.bin stage1.bin --accept-volatile
```

## How it differs from `cook`

| | `cook` | `cook-volatile` |
|---|---|---|
| Schema | 4.4 (lean 4.3 with `--no-annotate-maps`) | 4.5 (with `volatile` section) |
| Instructions | every changed block | volatile instructions excluded from the patch list |
| Portability | same revision, same volatile bytes | other cars of the same software revision |
| Recipe section | `maps[]` (optional) | `maps[]` (optional) + `volatile` |

Both commands emit **region tags** on every kept instruction (`region`
field + `CODE_AREA` flag for edits outside a calibration region — advisory,
never filters or blocks; see [`cook` — CLI](../cook/cli.md#the-region-warning-advisory))
and stamp `metadata.portability = "same_file_only"` when `--allow-non-unique`
was needed (enforced by `tune`/`validate` via `ecu.sha256`).

`cook` itself is untouched — `cook-volatile` is a separate command, and
`cook` output stays byte-identical.

## Notes

- Deterministic and scriptable — no interactive prompts. Human judgment
  happens *after* cook, by reviewing the recipe.
- Consumers (`tune`, `validate`, `patcher`, `audit`) accept
  `schema_version >= 4.3` and ignore the `volatile` key; `audit` uses it
  for a volatile-aware subset-fingerprint + re-verify check.
- `merge` drops a `volatile` section with a documented warning — run
  `cook-volatile` again on the merged pair for a portable recipe.
- Exit codes: `0` on success, `1` on any failure.

## See also

- [cook-volatile — API](api.md) — the same method from Python or JSON-RPC
- [`cook`](../cook/index.md) — the plain recipe cooker
- [`tune`](../tune/index.md) — one-shot validate → apply → verify
- [`audit`](../audit/index.md) — the receipt check (volatile-aware)
- [Recipe format](../concepts/recipe-format.md) — the `.remap` field reference
