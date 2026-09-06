---
title: validate
description: Check a recipe against a file yourself — before tuning, diagnose a failure, or confirm after. The three safety steps, run individually. For beginners first.
tags: [validate, cli, api, recipe]
status: stable
---

# validate

[`tune`](../tune/index.md) already runs its three safety steps
automatically. `validate` lets you run those same steps **on their own**,
when you want to check something by hand:

| Command | When | What it answers |
|---|---|---|
| `validate before` | Before tuning | "Is this really the right file for this recipe?" |
| `validate check` | When `before` fails | "Are the recipe's bytes anywhere in this file at all — shifted, or wrong ECU?" |
| `validate after` | After tuning | "Were all the changes really written?" |

Think of it as the safety checks of tuning, available one at a time.
Like every OpenRemap check, `validate` only reads files — it never changes
anything.

## When do I need it?

- **When `tune` refuses**: run `validate check` to learn *why* — the answer
  is either "shifted" (a different software version; the changes may still
  be recoverable) or "missing" (wrong file — do not force it).
- **When you tuned a file outside `openremap tune`** and want an independent
  confirmation.
- **When you want a saved JSON report** of a single check (`--json
  --output report.json`) for your records or a script.

## Try it (2 minutes)

```bash
# 1. Check the file before tuning
openremap validate before target.bin recipe.remap

# 2. Only if step 1 fails — find out why
openremap validate check target.bin recipe.remap

# 3. After tuning — confirm the changes are really there
openremap validate after target_tuned.bin recipe.remap
```

A passing `before` prints something like:

```
  ✅ Safe to tune

  Target               target.bin
  Instructions         277
  Passed               277
```

(Shortened — see the [CLI page](cli.md) for the full outputs, including
failures.)

## Understanding the answer

| Verdict | In plain words |
|---|---|
| **Safe to tune** (before) | Every "before" byte is where the recipe expects — safe to apply |
| **NOT safe to tune** (before) | Some bytes are missing — stop, run `validate check` |
| **SHIFTED RECOVERABLE** (check) | The bytes exist but in a shifted position — a different software version; `tune` may still recover them, with care |
| **MISSING UNRECOVERABLE** (check) | The bytes are nowhere in the file — this is the wrong ECU. Do not tune |
| **Tune confirmed** (after) | Every change was written correctly — next step is checksum correction before flashing |

## For developers

Each step is its own method of `openremap.api` — `validate_before`,
`validate_check`, `validate_after`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [validate — CLI](cli.md) | `openremap validate before target.bin recipe.remap` |
| Python code | [validate — API](api.md) | `api.call("validate_before", {"path": "target.bin", "recipe": recipe})` |
| Any language (JSON-RPC) | [validate — API](api.md) | a request with `"method": "validate_check"` |

## Where to go next

| You want to… | Go to |
|---|---|
| Full reference of the three sub-commands | [validate — CLI](cli.md) |
| Call the checks from your own code | [validate — API](api.md) |
| The one-shot apply that runs these steps for you | [`tune`](../tune/index.md) |
| The receipt check after everything | [`audit`](../audit/index.md) |
