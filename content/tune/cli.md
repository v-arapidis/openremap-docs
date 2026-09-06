---
title: tune — CLI
description: The openremap tune command — validate → apply → verify in one shot; every flag, full output, same-file-only guard, examples.
tags: [tune, cli, recipe]
status: stable
---

# `openremap tune`

Apply a tuning recipe to a target ECU binary in a single command.

`openremap tune` runs three phases automatically:

| Phase | What it does |
|---|---|
| **1 — validate before** | Strict pre-flight check: are the original bytes at every expected offset? |
| **2 — apply** | Write the tuned bytes with a ±2 KB anchor search for shifted maps |
| **3 — validate after** | Confirm every tuned byte was written correctly |

The original file is **never modified**. The tuned binary is written only
when all three phases pass. Exit code `0` = success, `1` = any phase failed.

New here? Read the [plain-English introduction](index.md) first.

> 🔴 **CHECKSUM VERIFICATION IS MANDATORY**
>
> `openremap tune` does NOT calculate or correct ECU checksums. Before
> flashing any tuned binary to a vehicle you **must** run it through a
> dedicated checksum-correction tool — ECM Titanium, WinOLS, Checksum Fix
> Pro, or equivalent. Phase 3 confirms the recipe was applied correctly; it
> does **not** replace a checksum tool. **Flashing a binary with an
> incorrect checksum will brick your ECU.**

## Usage

```bash
openremap tune <TARGET> <RECIPE> [OPTIONS]
```

## Arguments

| Argument | Required | Description |
|---|---|---|
| `TARGET` | Yes | The untuned ECU binary to apply the recipe to (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `RECIPE` | Yes | The recipe file (`.remap`, `.openremap`, or `.json`) produced by `openremap cook`. |

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--output PATH` | `-o` | `<target_stem>_tuned<ext>` | Path to write the tuned binary. Defaults to the same folder as the target with `_tuned` appended to the stem. |
| `--report PATH` | `-r` | | Save the combined three-phase report as a JSON file. |
| `--skip-validation` | | off | Skip Phases 1 and 3 and apply the recipe directly. Use only in scripted pipelines where you have already validated separately. |
| `--force` | | off | Override the same-file-only guard (see below). Loud warning; mechanical validation still runs and can still abort. |
| `--json` | | off | Print the combined three-phase report as JSON instead of the human-readable output. |
| `--help` | | | Show help and exit. |

## Same-file-only recipes (`--force`)

A recipe cooked with `cook --allow-non-unique` carries the stamp
`metadata.portability = "same_file_only"` — its anchors are not unique, so
it is only safe on the exact binary it was cooked from. `tune` enforces
this: the target's sha256 must equal the recipe's `ecu.sha256`, otherwise
`tune` **refuses** (exit 1):

```
❌  recipe is stamped SAME-FILE-ONLY (non-unique anchors) and the target's
    sha256 (…) does not match the source (…). It may only be applied to the
    exact binary it was cooked from — pass --force to override.
```

`--force` overrides **only this policy gate**, with a loud warning. The
mechanical checks are untouched and can still abort: Phase 1 (every `ob` at
its exact offset), Phase 2 (anchor search), Phase 3 (post-patch write
verification). A truly different revision fails Phase 1 even with `--force`;
a close variant whose anchors still hold applies and verifies.
`openremap validate before` reports the same mismatch so you can check
before forcing.

## Examples

```bash
# Apply a tune — all three phases run automatically
openremap tune target.bin recipe.remap

# Specify where to write the tuned binary
openremap tune target.bin recipe.remap --output my_tuned.bin

# Save the combined three-phase report as JSON
openremap tune target.bin recipe.remap --report tune_report.json

# Save both the tuned binary and the report
openremap tune target.bin recipe.remap --output my_tuned.bin --report my_report.json

# Skip Phases 1 and 3 (scripted pipelines only)
openremap tune target.bin recipe.remap --skip-validation

# Print the full three-phase report as JSON to the screen
openremap tune target.bin recipe.remap --json
```

## Example output

### All three phases passed

```
  openremap tune  target.bin  +  recipe.remap

  ──────────────────────────────────────────────────────────
  Phase 1 — Pre-flight check  (validate before)

  Target                   target.bin
  MD5                      abc2e7d4610bfda5619951e015566e8d
  Instructions             277
  Passed                   277

  ✅ Target matches recipe — safe to apply

  ──────────────────────────────────────────────────────────
  Phase 2 — Applying tune

  Instructions             277
  Applied                  275
  Shifted                    2
     Shifted instructions were recovered via ±2 KB anchor search.

  ✅ Recipe applied — 275/277 instructions written

  ──────────────────────────────────────────────────────────
  Phase 3 — Post-tune verification  (validate after)

  Instructions             277
  Confirmed                277

  ✅ All mb bytes confirmed in tuned binary

  ──────────────────────────────────────────────────────────
  ✅ Tune complete

  Target MD5               abc2e7d4610bfda5619951e015566e8d
  Tuned MD5                f3c1a9b2d8e7041256ff34c2ab987d31
  Tuned binary             target_tuned.bin

  ⚠  MANDATORY: correct checksums with ECM Titanium, WinOLS, or
     a similar tool before flashing the tuned binary to a vehicle.
     Flashing without checksum correction will brick the ECU.
  ──────────────────────────────────────────────────────────
```

### Phase 1 failed — nothing written

```
  openremap tune  target.bin  +  recipe.remap

  ──────────────────────────────────────────────────────────
  Phase 1 — Pre-flight check  (validate before)

  ⚠  Match key mismatch:
     recipe : EDC17C66::1037541778
     target : EDC17C66::1037541779

  Target                   target.bin
  MD5                      ff3a91b2...
  Instructions             277
  Passed                   261
  Failed                    16

  Failed instructions:
     #  12  offset 0x0012A4F0  — ob not found at offset
     #  13  offset 0x0012A510  — ob not found at offset
     …

  Tip: run  openremap validate check  to find out why.

  ❌ NOT safe to apply — 16 instruction(s) failed.
     Run  openremap validate check  to diagnose.
```

Phase 2 and Phase 3 do not run; the tuned binary is not written.

## What to look for

| Result | What to do |
|---|---|
| `✅ Tune complete` — all three phases green | Correct checksums, then flash. |
| `Shifted` count in Phase 2 | Changes recovered via ±2 KB search — inspect the tuned binary carefully before flashing. |
| Phase 1 fails: `❌ NOT safe to apply` | Run `openremap validate check target.bin recipe.remap` to find out whether the maps shifted or you have the wrong ECU. |
| Phase 2 fails: apply error | Run `openremap validate check` to diagnose. Do not flash the output. |
| Phase 3 fails: `❌ Post-tune verification failed` | Do not flash. Re-run `openremap tune` or investigate with `openremap validate check`. |

## Running phases individually

`tune` is the recommended path for interactive use. To inspect a phase in
isolation — a report, a script, or diagnosing a failure — the individual
[`validate`](../validate/index.md) sub-commands run the same underlying
logic:

```bash
# Phase 1 only — pre-flight check
openremap validate before target.bin recipe.remap

# Diagnostic — why did Phase 1 fail?
openremap validate check target.bin recipe.remap

# Phase 3 only — post-tune confirmation
openremap validate after target_tuned.bin recipe.remap --json --output verify.json
```

## Notes

- The original `TARGET` file is never modified; the tuned result is always
  a separate output file.
- An existing output path is overwritten. Use `--output` to pick a specific
  path if you want to preserve a previous version.
- `--skip-validation` bypasses Phases 1 and 3 — only for scripted pipelines
  that already validated separately.
- The `--report` JSON contains all three phases under the keys
  `phase_1_validate_before`, `phase_2_apply`, and
  `phase_3_validate_after`, plus a top-level `success` boolean — useful for
  CI, auditing, and sharing results. With `--skip-validation`, the skipped
  phase objects carry `"skipped": true`.
- Exit codes: `0` on success, `1` if any phase fails.

## See also

- [tune — API](api.md) — the same three-phase apply from Python or JSON-RPC
- [`validate`](../validate/index.md) — the individual steps
- [`cook`](../cook/index.md) — build the recipe you apply
- [`audit`](../audit/index.md) — the receipt check afterwards
