---
title: tune
description: Apply a recipe to a file the safe way — check before, apply, verify after — in one command. A partial tune is never written. For beginners first.
tags: [tune, cli, api, recipe]
status: stable
---

# tune

You have a [recipe](../cook/index.md) (the tuner's change list) and a file
you want to apply it to. `tune` does the job **the safe way**, in three
automatic steps:

| Step | What it does | Plain words |
|---|---|---|
| **1 — Validate before** | Checks the recipe's "before" bytes exist where expected | "Is this really the right file for this recipe?" |
| **2 — Apply** | Writes the recipe's changes | "Now make the changes" |
| **3 — Validate after** | Checks every change landed correctly | "Prove nothing was missed" |

The tuned result is always written to a **separate file** — your original
file is never touched. And if any step fails, **nothing is written**: you
never get a half-applied tune.

> [!CAUTION]
> `tune` does **not** fix checksums. After tuning you *must* run the result
> through a checksum-correction tool (ECM Titanium, WinOLS, or equivalent)
> before flashing. Flashing a binary with an incorrect checksum can brick
> the ECU.

## When do I need it?

- **When you apply a recipe to a file** — this is the normal, recommended
  path.
- **When you want a report of the whole operation** (`--report`/`--json`).
- **For scripts** — exit code `0` = success, `1` = a phase failed.

If step 1 fails, don't force it blindly — run
[`validate check`](../validate/index.md) to find out *why* (wrong file?
shifted maps?).

## Try it (2 minutes)

```bash
openremap tune target.bin recipe.remap
```

If everything passes you will see the three phases, each green, and a
final summary:

```
  Phase 1 — Pre-flight check  (validate before)
  ✅ Target matches recipe — safe to apply

  Phase 2 — Applying tune
  ✅ Recipe applied — 275/277 instructions written

  Phase 3 — Post-tune verification  (validate after)
  ✅ All mb bytes confirmed in tuned binary

  ✅ Tune complete
  Tuned binary             target_tuned.bin
```

(Shortened — see the [CLI page](cli.md) for the full output and the
mandatory-checksum warning.)

## Understanding the answer

| You see… | In plain words |
|---|---|
| **`Shifted` (Phase 2)** | Some changes were found a little off from the expected spot and recovered via a search — inspect the result carefully before flashing |
| **`❌ NOT safe to apply` (Phase 1)** | The recipe does not fit this file — run `validate check` to learn why |
| **`Tuned binary target_tuned.bin`** | Your new tuned file — correct the checksums, then it is ready |

## For developers

`tune` is one method of `openremap.api` — the same three-phase apply, from
code or over JSON-RPC:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [tune — CLI](cli.md) | `openremap tune target.bin recipe.remap` |
| Python code | [tune — API](api.md) | `api.call("tune", {"path": "target.bin", "recipe": recipe_dict})` |
| Any language (JSON-RPC) | [tune — API](api.md) | a request with `"method": "tune"` |

## Where to go next

| You want to… | Go to |
|---|---|
| Every flag, full output, and the same-file-only rule | [tune — CLI](cli.md) |
| Call `tune` from your own code | [tune — API](api.md) |
| Diagnose a failed Phase 1 | [`validate`](../validate/index.md) |
| Build the recipe you are applying | [`cook`](../cook/index.md) |
| The receipt check afterwards | [`audit`](../audit/index.md) |
