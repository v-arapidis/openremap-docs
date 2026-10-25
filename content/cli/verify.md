---
title: Verify
description: >-
  Check the steps yourself — before, during and after — and prove that stock,
  tuned and recipe belong together.
tags: [cli]
status: stable
---

# Verify

Applying a recipe does these checks internally. This page is for running them
**yourself**: by hand, in a script, or to find out why something failed.

## `validate`

**What it is:** three separate steps, one command each.

| Step | The question it answers |
|---|---|
| `validate before` | are the original bytes in place, at the offsets the recipe records? |
| `validate check` | can those bytes be found *anywhere* in the file? |
| `validate after` | were the new bytes really written? |

### `validate before` — pre-flight

```bash
openremap validate before original.bin stage1.remap
```

```
  Validating original.bin against stage1.remap …

  ✅ Safe to tune

  Target               original.bin
  MD5                  abc2e7d4610bfda5619951e015566e8d
  Instructions         79
  Passed               79
```

`Passed 79` of `79` — every change's "before" bytes were found exactly where the
recipe says. That is the green light.

### `validate after` — did it stick?

```bash
openremap validate after patched.bin stage1.remap
```

```
  Verifying tuned binary patched.bin against stage1.remap …

  ✅ Tune confirmed — all mb bytes verified

  Tuned File           patched.bin
  Instructions         79
  Confirmed            79
```

### `validate check` — diagnose a failure

When `before` fails, this searches the **whole file** for each change, which tells
you *why* it failed: shifted map, different revision, or already patched.

```bash
openremap validate check other_file.bin stage1.remap
```

```
  Searching other_file.bin for all recipe instructions …

  Verdict: MISSING UNRECOVERABLE

  Instructions         79
    #  77  expected 2B7564  size 10 bytes  — not found anywhere
[exit 1]
```

`MISSING UNRECOVERABLE` means the bytes are not in this file at all — it is not the
file the recipe describes. Other verdicts mention bytes found elsewhere, which is the
signal that a map moved.

## `audit`

**What it is:** the receipt check — do the stock file, the tuned file and the recipe
belong together? This is the strongest proof that a recipe is honest.

```bash
openremap audit original.bin stage1.bin stage1.remap
```

```
  OpenRemap — Tune Audit
  original.bin · stage1.bin · stage1.remap

  ✓ PASS  Provenance — recipe built from this stock (sha256 match)
  ✓ PASS  Fingerprint — recipe honestly describes the pair (match)
  ✓ PASS  Unaccounted — every changed byte is explained by the recipe.

  ✅ The three artifacts are consistent.
```

Read the three lines as three separate promises:

| Check | Means |
|---|---|
| **Provenance** | the recipe really was made from *this* stock file |
| **Fingerprint** | the recipe's contents match its own fingerprint — it was not edited by hand |
| **Unaccounted** | no changed byte in the tuned file is missing from the recipe — nothing was left out |

If you received a tune and want to know whether the recipe tells the whole truth,
this is the command.

## Where to go next

| You want to… | Go to |
|---|---|
| apply the recipe | [`tune-strict`](apply.md#tune-strict) |
| read a recipe without applying it | [`recipe-info`](cook.md#recipe-info) |
