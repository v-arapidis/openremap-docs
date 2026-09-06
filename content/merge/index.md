---
title: merge
description: Combine two recipes (two tuners' changes, two small mods) into one recipe — nothing is guessed, conflicts are shown. For beginners first.
tags: [merge, cli, api, recipe]
status: stable
---

# merge

Sometimes you end up with **two recipes** for the same car: one tuner's
`egr_off.remap`, another's `stage1.remap`. You want both changes in one
recipe — but applied together safely.

`merge` combines two recipes into one. It works like git's "three-way
merge": you give it the **stock file** (the original, unmodified binary)
as the common ancestor, and it figures out how the two change lists fit
together.

- Changes that **do the same thing** → kept once.
- Changes in **different places** → both kept.
- Changes that **disagree** (two different edits at the same spot) →
  **conflict** — reported for *you* to decide. Nothing is guessed.

`merge` never changes your files — it reads the two recipes (and the stock
file) and writes a new merged recipe.

## When do I need it?

- **When you combine small mods into one recipe per car** (egr_off +
  stage1 + dpf_off → one `.remap`).
- **When two people tuned the same car** and you want to merge their
  change lists into one reviewable recipe.
- **When a recipe was built from a slightly different original** — merge
  skips (or, with `--strict`, aborts on) the few instructions that do not
  match your stock file, instead of failing the whole thing.

## Try it (2 minutes)

```bash
openremap merge egr_off.remap stage1.remap --stock stock.bin -o both.remap
```

You will see a short report:

```
  ✅ Merged egr_off.remap (12 instructions) + stage1.remap (67 instructions) → 79 instructions.
  ⚠  egr_off.remap: 1 instruction(s) skipped — they do not match the stock binary
     (…). This recipe was likely built from a slightly different original.

  Saved merged recipe to both.remap (schema 4.4)
```

(Sample output — numbers depend on your recipes.)

## Understanding the answer

| The report says… | In plain words |
|---|---|
| **→ N instructions** | The total change list after merging |
| **skipped** | A few changes did not match your stock file (e.g. car-specific bytes) and were left out — with a note |
| **schema 4.4** | The merged recipe is in the standard format with the maps layer |

If a merge reports a **conflict**, the two recipes edit the same spot
differently — no tool can choose for you. Re-examine the two recipes (they
are plain text) and decide which change you actually want.

## For developers

`merge` is one method of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [merge — CLI](cli.md) | `openremap merge a.remap b.remap --stock stock.bin -o both.remap` |
| Python code | [merge — API](api.md) | `api.call("merge", {"recipe_a": …, "recipe_b": …})` |
| Any language (JSON-RPC) | [merge — API](api.md) | a request with `"method": "merge"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See the exact merge rules and `--strict` | [merge — CLI](cli.md) |
| Call `merge` from your own code | [merge — API](api.md) |
| Build the recipes you merge | [`cook`](../cook/index.md) |
| Apply the merged recipe to a file safely | [`tune`](../tune/index.md) |
