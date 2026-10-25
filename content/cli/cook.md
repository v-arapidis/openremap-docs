---
title: Cook
description: >-
  Turn a stock and a tuned file into a recipe — a written list of every change —
  read a recipe without applying it, and merge two recipes into one.
tags: [cli]
status: stable
---

# Cook

A **recipe** is the written record of what a tuner changed: *at this offset these
bytes become those bytes*. Two files in, one recipe out. Nothing is modified.

## `cook-strict`

**What it is:** the normal way to make a recipe. It insists that every change can be
found uniquely in the file, which is what makes the result safe to apply to another
car with the same software.

```bash
openremap cook-strict original.bin stage1.bin -o stage1.remap
```

```
  cook-strict  ·  original.bin
  MODE          anchors must be unique · exclusions: none
  STOCK KEY     EDC17C66::1037541778126241V0
  TUNED KEY     EDC17C66::1037541778126241V0
  CHANGES       79 instructions · 7,828 bytes · 24 maps
  REGIONS       79 tagged · calibration 38, mixed 40, erased 1
  FLAGS         CODE_AREA 41

  ✅ RECIPE BUILT
  identity_floor any
  sections       maps, regions
  saved to       stage1.remap
```

What the lines mean:

- **`CHANGES`** — how many separate edits, how many bytes, how many tables involved.
- **`REGIONS`** — where the edits sit: inside calibration data, mixed, or empty space.
- **`FLAGS`** — edits worth a look, e.g. `CODE_AREA` means it touched program code.
  **Flagged, not dropped**: a flag is information, never a filter.
- **`identity_floor any`** — the important one for later: this recipe can be applied
  to **any** dump of this family, including one the tool cannot identify.

## `cook-forced`

**What it is:** the same, but it permits changes that cannot be pinned down uniquely
(a change inside repeated blank bytes, for instance).

```bash
openremap cook-forced original.bin stage1.bin -o stage1-forced.remap
```

```
  cook-forced  ·  original.bin
  MODE          anchors may repeat · exclusions: none
  CHANGES       79 instructions · 7,828 bytes · 24 maps

  ✅ RECIPE BUILT
  identity_floor any
  saved to       stage1-forced.remap
```

Notice `identity_floor any` here too: forcing *allows* repeated bytes, it does not
require them. When they do occur the floor becomes `firmware`, and then only
commands that verify the software version will accept the recipe.

**Rule of thumb:** try `cook-strict` first. Use `cook-forced` only if strict refuses.

## `recipe-info`

**What it is:** reads a recipe and tells you what it says about itself. No target
file needed — nothing is applied.

```bash
openremap recipe-info stage1.remap
```

```
  stage1.remap
  SCHEMA        5.0  (cook-strict)
  CONTENT       79 instructions · 7,828 bytes
  PORTABILITY   identity_floor any · anchors_unique True · sections maps, regions
  FROM          original.bin  (4,194,304 B · EDC17C66::1037541778126241V0)
  TO            stage1.bin
  CHANGED       7,828 bytes (0.19 %) · 3 single / 76 multi-byte
  PRODUCED      openremap 0.9.0
```

Use this before applying a recipe you were given: it tells you which files it was
made from and what it requires.

A recipe from an old version is refused with a pointer to the cook command, not
silently accepted:

```
✗ REFUSED at A2 — schema 4.x is not supported by the apply engine; re-cook it with cook-strict
```

## `merge`

**What it is:** combines two recipes into one, checked against a common stock file.

```bash
openremap merge stage1.remap egr_off.remap --stock original.bin -o both.remap
```

```
  ✅ Merged stage1.remap (79 instructions) + egr_off.remap (12 instructions) → 91 instructions.

  Saved merged recipe to both.remap (schema 5.0)
```

If the two recipes change the same bytes differently, it says so and refuses —
it never guesses which one wins.

## Where to go next

| You want to… | Go to |
|---|---|
| apply the recipe to an actual file | [`tune-strict`](apply.md#tune-strict) |
| prove the recipe reproduces the tuned file | [`audit`](verify.md#audit) |
| understand the recipe format | [recipe format](../recipe/index.md) |
