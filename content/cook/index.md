---
title: cook
description: Turn a stock and a tuned ECU file into a portable .remap recipe — the tuner's change list, saved once and reusable. For beginners first.
tags: [cook, cli, api, recipe]
status: stable
---

# cook

A tuner works like this: they take the factory file from your car (the
**stock** file), change it, and flash the result (the **tuned** file). If you
have both files, `cook` does the clever part — it compares them and writes
down **every single change** in a small text file called a **recipe**
(`.remap`).

Think of the recipe as the tuner's change list: "at this location, replace
these bytes with those". Once you have it, you can:

- **read it** — it is human-readable text, so you can see exactly what the
  tune changes,
- **share it** — the recipe is portable, so someone else can review it,
- **apply it** — later commands (`tune`, `validate`) use the recipe to patch
  another file of the same ECU.

`cook` only reads your two files. It never changes them.

## When do I need it?

- **After you have a stock and a tuned file** and want to capture the tune
  as a reusable recipe.
- **When you want to review what a tune actually changes** before you trust
  it — open the recipe in any text editor.
- **Not** when you only have one file: `cook` needs **both** the stock and
  the tuned version to know what changed.

> [!IMPORTANT]
> A plain `cook` recipe is for applying to the **same kind of file**.
> If the tune changed things that are different from car to car (like the
> VIN or the checksum stores), use
> [`cook-volatile`](../cook-volatile/index.md) instead — it makes the recipe
> car-portable by excluding those "volatile" bytes with recorded evidence.

## Try it (2 minutes)

```bash
openremap cook stock.bin stage1.bin --output recipe.remap
```

You will see a short summary like this:

```
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

(Shortened — a warning line appears when some changes sit outside the
calibration area; see the [CLI page](cli.md) for what that means.)

## Understanding the answer

| The summary says… | In plain words |
|---|---|
| **ECU** | Which ECU the recipe was built from (must match the target you apply it to) |
| **Match Key** | The ECU's name tag — the recipe refuses to apply to a different ECU |
| **Instructions** | How many separate changes were found. Zero means the two files are identical — you may have swapped the order |
| **Bytes Changed** | How many bytes differ in total — a rough idea of how big the tune is |

If the recipe says **ECU: Unknown**, the file's family is not supported yet.
The recipe is still built (all changes captured), but it has no name tag, so
it cannot be matched to a target later.

## For developers

`cook` is one method of `openremap.api` — the same comparison, from code or
over JSON-RPC:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [cook — CLI](cli.md) | `openremap cook stock.bin stage1.bin --output recipe.remap` |
| Python code | [cook — API](api.md) | `api.call("cook", {"original_path": "stock.bin", "modified_path": "stage1.bin"})` |
| Any language (JSON-RPC) | [cook — API](api.md) | a request with `"method": "cook"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag and how the diff works | [cook — CLI](cli.md) |
| Call `cook` from your own code | [cook — API](api.md) |
| Make the recipe car-portable | [`cook-volatile`](../cook-volatile/index.md) |
| Apply the recipe to a file safely | [`tune`](../tune/index.md) |
| Understand the recipe file format | [Recipe format](../concepts/recipe-format.md) |
