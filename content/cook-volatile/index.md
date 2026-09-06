---
title: cook-volatile
description: Cook a recipe that works on other cars of the same software — it excludes car-specific bytes (VIN, checksum stores) with recorded evidence. For beginners first.
tags: [cook-volatile, cli, api, recipe]
status: stable
---

# cook-volatile

A normal [`cook`](../cook/index.md) recipe records *every* change between
your stock and tuned file. That is great — unless the tune touched things
that are **different from car to car**, like the VIN (the car's ID number)
or the checksum stores. Two cars of the same software still have different
VINs, so a plain recipe that includes those bytes **fails on the other
car**.

`cook-volatile` fixes exactly that. It is `cook` with one extra step: it
detects those **volatile** (car-specific) changes, **excludes the
near-certain ones** from the recipe, and writes down what it excluded and
why — evidence you can read and audit.

The result is a **car-portable** recipe: it applies to any car of the same
software revision, not just the exact file it was cooked from.

`cook-volatile` only reads your two files — it never changes them.

## When do I need it?

- **Whenever the recipe may be applied to another car** of the same
  software version (the usual tuning workflow).
- **When the tune touched the VIN or checksum stores** — a plain `cook`
  recipe would carry those car-specific bytes along.
- Only have the exact same binary to re-flash? Plain [`cook`](../cook/index.md)
  is enough.

## Try it (2 minutes)

```bash
openremap cook-volatile stockA.bin stage1.bin --output portable.remap
```

You will see the usual build summary, and — unless you suppressed it — the
list of volatile instructions that were reviewed:

```
  ✅ Recipe built successfully
  ...
  Recipe saved to portable.remap
```

(Output shortened. When volatile changes are found they appear in a
`volatile` section of the recipe with their evidence — see the
[CLI page](cli.md#the-volatile-section-schema-4-5).)

## Understanding the answer

| The recipe records… | In plain words |
|---|---|
| **`volatile.excluded`** | Changes that were *removed* from the recipe because they are car-specific — with their evidence |
| **`volatile.flagged`** | Changes that *might* be car-specific but are not certain — kept in the recipe, marked for your review |
| **Evidence** | The reason each exclusion happened (e.g. "overlaps VIN-structured record 'WVW…'") |

Open the `.remap` file in any text editor — everything is human-readable
and auditable.

## For developers

`cook_volatile` (note the underscore in code) is one method of
`openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [cook-volatile — CLI](cli.md) | `openremap cook-volatile stock.bin stage1.bin --output portable.remap` |
| Python code | [cook-volatile — API](api.md) | `api.call("cook_volatile", {"original_path": …, "modified_path": …})` |
| Any language (JSON-RPC) | [cook-volatile — API](api.md) | a request with `"method": "cook_volatile"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag and the volatile section in detail | [cook-volatile — CLI](cli.md) |
| Call it from your own code | [cook-volatile — API](api.md) |
| The plain (non-portable) cooker | [`cook`](../cook/index.md) |
| Apply the recipe to a file safely | [`tune`](../tune/index.md) |
