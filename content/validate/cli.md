---
title: validate — CLI
description: The openremap validate sub-commands — before, check, after — every flag, JSON output, verdicts, deprecated aliases.
tags: [validate, cli, recipe]
status: stable
---

# `openremap validate`

Three sub-commands for checking a binary against a recipe — before and
after tuning. In most cases you do not need to run these individually:
`openremap tune` runs `validate before` and `validate after` automatically
as Phase 1 and Phase 3.

Use these commands when you need to inspect a specific step in isolation,
save an individual report, or diagnose a failure that `tune` reported.

New here? Read the [plain-English introduction](index.md) first.

## Sub-commands at a glance

| Sub-command | When to run | What it checks |
|---|---|---|
| [`before`](#before) | When you need Phase 1 in isolation | Are the original bytes at the exact expected offsets? |
| [`check`](#check) | When `before` fails (or Phase 1 of `tune` fails) | Are the original bytes anywhere in the binary at all? |
| [`after`](#after) | When you need Phase 3 in isolation | Are the new bytes now at the correct offsets? |

> **Deprecated names** — `validate strict`, `validate exists`, and
> `validate tuned` still work (hidden from `--help`) but print a rename
> notice. Use the new names going forward.

---

## `before`

**The pre-flight safety check.** Checks that the exact original bytes
(`ob`) from every recipe instruction are present at their expected offsets
in the target binary. Every instruction is checked before reporting — you
see the full picture, not just the first failure.

A result of `Safe to tune` means every instruction matched. `openremap tune`
runs this automatically as Phase 1 before writing anything.

### Usage

```bash
openremap validate before <TARGET> <RECIPE> [OPTIONS]
```

### Arguments & options

| Argument | Required | Description |
|---|---|---|
| `TARGET` | Yes | The untuned ECU binary to check (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `RECIPE` | Yes | The recipe file (`.remap`, `.openremap`, or `.json`). |

| Option | Short | Description |
|---|---|---|
| `--json` | | Output the full report as JSON instead of a table. |
| `--output PATH` | `-o` | Save the report to a file. |
| `--help` | | Show help and exit. |

### Examples

```bash
# Run the check and print the result
openremap validate before target.bin recipe.remap

# Save the full JSON report to a file
openremap validate before target.bin recipe.remap --json --output before_report.json
```

### Example output

**All instructions passed**

```
  Validating target.bin against recipe.remap …

  ✅ Safe to tune

  Target               target.bin
  MD5                  abc2e7d4610bfda5619951e015566e8d
  Instructions         277
  Passed               277
```

**Some instructions failed**

```
  Validating target.bin against recipe.remap …

  ⚠  match_key mismatch
     recipe : EDC17C66::1037541778126241V0
     target : EDC17C66::1037541778999999V0

  ❌ NOT safe to tune

  Target               target.bin
  MD5                  ff3a91b2...
  Instructions         277
  Passed               261
  Failed                16

  Failed instructions:
     #  12  offset 0x0012A4F0  — ob not found at offset
     #  13  offset 0x0012A510  — ob not found at offset
     …

  Tip: run  openremap validate check  to find out why.
```

### What to look for

| Result | What to do |
|---|---|
| `Safe to tune` — all passed | Run `openremap tune` (or proceed to Phase 2 manually). |
| Any failures | Stop. Run `validate check` to find out whether the bytes are shifted or missing. |
| `match_key mismatch` warning | The target is a different software version from the recipe source. Run `validate check` before deciding whether to continue. |

---

## `check`

**The diagnostic tool — run this when `before` (or Phase 1 of `tune`)
fails.** Searches the *entire* binary for the original bytes (`ob`) of every
instruction — not just at the expected offset. This tells you whether the
bytes exist somewhere else in the file (the maps have shifted, likely a
different software revision) or are absent entirely (this is the wrong
ECU).

This command never modifies any file — it is purely diagnostic.

### Usage

```bash
openremap validate check <TARGET> <RECIPE> [OPTIONS]
```

### Arguments & options

Same as [`before`](#before): `TARGET` (`.bin`, `.ori`, `.hex`, `.s19`,
`.srec`, `.mot`), `RECIPE` (`.remap`/`.openremap`/`.json`), `--json`,
`--output`/`-o`, `--help`.

### Verdicts

| Verdict | What it means | What to do |
|---|---|---|
| `SAFE EXACT` | All `ob` bytes found at their exact expected offsets. | Re-examine why `validate before` failed — this is unusual. |
| `SHIFTED RECOVERABLE` | All `ob` bytes found, but at different offsets than the recipe expects. | The target is a different software revision. `openremap tune`'s ±2 KB anchor search may still recover these — proceed with caution and verify carefully. |
| `MISSING UNRECOVERABLE` | Some `ob` bytes are not found anywhere in the binary. | This is the wrong ECU. Do not tune. |

### Example output

```
  Searching target.bin for all recipe instructions …

  Verdict: SHIFTED RECOVERABLE

  Target               target.bin
  MD5                  ff3a91b2...
  Instructions         277
  Exact                261
  Shifted               16
  Missing                0

  Shifted instructions:
     # 12  expected 0x0012A4F0  →  found at shift +4096
     # 13  expected 0x0012A510  →  found at shift +4096
```

---

## `after`

**The post-tune confirmation.** Confirms every instruction's new bytes
(`mb`) are present at the correct offset in the tuned binary. It is the
mirror image of `validate before`: `before` checks the original bytes
(`ob`) before tuning; `after` checks the modified bytes (`mb`) after.

`openremap tune` runs this automatically as Phase 3. Run it manually for an
independent confirmation report, or to verify a binary that was tuned
outside `openremap tune`.

### Usage

```bash
openremap validate after <TUNED> <RECIPE> [OPTIONS]
```

### Arguments & options

| Argument | Required | Description |
|---|---|---|
| `TUNED` | Yes | The tuned ECU binary to verify (`.bin`, `.ori`, `.hex`, `.s19`, `.srec`, or `.mot`). |
| `RECIPE` | Yes | The recipe file (`.remap`, `.openremap`, or `.json`) used when tuning. |

Options are the same as the other sub-commands: `--json`, `--output`/`-o`,
`--help`.

### Examples

```bash
# Verify the tuned binary
openremap validate after target_tuned.bin recipe.remap

# Save the verification report for your records
openremap validate after target_tuned.bin recipe.remap --json --output verify.json
```

### Example output

**All instructions confirmed**

```
  Verifying tuned binary target_tuned.bin against recipe.remap …

  ✅ Tune confirmed — all mb bytes verified

  Tuned File           target_tuned.bin
  MD5                  f3c1a9b2d8e7041256ff34c2ab987d31
  Instructions         277
  Confirmed            277
```

**Some instructions failed**

```
  Verifying tuned binary target_tuned.bin against recipe.remap …

  ❌ Tune NOT confirmed — some instructions failed

  Tuned File           target_tuned.bin
  MD5                  ...
  Instructions         277
  Confirmed            274
  Failed                 3

  Failed instructions:
     #  45  offset 0x00FF1200  size 4 bytes  — mb not found at offset
```

### What to look for

| Result | What to do |
|---|---|
| `Tune confirmed` — all passed | The tune was written correctly. Proceed to checksum correction before flashing. |
| Any failures | Do not flash. Re-run `openremap tune` or investigate with `validate check`. |

---

## When to use each command

```bash
# Normal workflow — tune does all three phases automatically
openremap tune target.bin recipe.remap

# Diagnose a Phase 1 failure reported by tune
openremap validate check target.bin recipe.remap

# Run phases individually with saved reports
openremap validate before target.bin recipe.remap --json --output p1.json
openremap validate after  target_tuned.bin recipe.remap --json --output p3.json
```

## Deprecated aliases

The old sub-command names still work but print a yellow deprecation notice
(they are hidden from `--help`):

| Old name | New name |
|---|---|
| `validate strict` | `validate before` |
| `validate exists` | `validate check` |
| `validate tuned` | `validate after` |

## Notes

- All three `validate` commands are read-only — they never modify any file.
- `--json` outputs the raw report including every instruction result
  individually — useful for scripting, CI, or archiving.
- `validate before` runs automatically inside `openremap tune` as Phase 1
  before any bytes are written; `validate after` runs as Phase 3 after the
  recipe is applied. `tune --skip-validation` bypasses both — only in
  scripted pipelines that validated separately.
- Exit codes: `0` when the check passes, `1` when it fails.

## See also

- [validate — API](api.md) — the three checks as methods
- [`tune`](../tune/index.md) — the one-shot apply that runs these steps
- [`audit`](../audit/index.md) — the receipt check afterwards
