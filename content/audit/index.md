---
title: audit
description: The receipt check — do the stock file, the tuned file, and the recipe actually belong together? For beginners first.
tags: [audit, cli, api, recipe]
status: stable
---

# audit

Imagine you buy something second-hand and the seller hands you three
things: the original, the "improved" version, and a note listing the
changes. `audit` is the tool that asks the obvious question: **do these
three actually belong together?**

You give `audit` three things:

1. the **stock** file (the original, unmodified binary),
2. the **tuned** file (the modified one you received),
3. the **recipe** (the change list someone claims describes the tune).

`audit` answers with three checks:

| Check | The question | Plain words |
|---|---|---|
| **Provenance** | Was the recipe built from *this* stock file? | "Is this note about this original?" |
| **Fingerprint** | Is the recipe the honest record of the pair? | "Does the note really match the changes?" |
| **Unaccounted** | Which changed bytes does the recipe NOT explain? | "Were there changes the note left out?" |

If a change exists in the tuned file but not in the recipe, `audit` shows
it to you. It only reads files — it never changes anything.

`audit` checks **consistency between the three artifacts**, not whether the
tune is safe for your engine. Applicability to another car is the job of
[`validate`](../validate/index.md).

## When do I need it?

- **You received a tuned file and several recipes** — which recipe matches
  this pair? Run `audit` and see which one passes.
- **You want to trust a tuner's deliverable** — did they declare every
  change they made?
- **You suspect a tampered or hand-edited recipe** — an edited recipe no
  longer matches its pair, and audit will say so.

## Try it (2 minutes)

```bash
openremap audit stock.bin stage1.bin stage1.remap
```

You will see a short report:

```
  OpenRemap — Tune Audit
  stock.bin · tuned.bin · stage1.remap

  ✓ PASS  Provenance — recipe built from this stock (sha256 match)
  ✓ PASS  Fingerprint — recipe honestly describes the pair (match)
  ✗ FAIL  Unaccounted — 2 byte(s) in 1 block(s) changed but NOT in the recipe:
     0x00000456       2 bytes  [calibration]

  ⚠  Inconsistencies found — review the failed verdicts above.
```

(Example output. When the recipe cannot be applied to the stock at all,
the third check is skipped with a warning — audit reports, it never
crashes.)

## Understanding the answer

| You see… | In plain words |
|---|---|
| **✓ PASS Provenance** | The recipe was built from this exact stock file |
| **✓ PASS Fingerprint** | The recipe honestly matches the stock→tuned changes |
| **✗ FAIL Unaccounted** | The tuned file contains changes the recipe does not explain — review them (each is labelled with its area: calibration, code, …) |

## For developers

`audit` is one method of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [audit — CLI](cli.md) | `openremap audit stock.bin stage1.bin recipe.remap` |
| Python code | [audit — API](api.md) | `api.call("audit", {"stock_path": …, "tuned_path": …, "recipe": recipe})` |
| Any language (JSON-RPC) | [audit — API](api.md) | a request with `"method": "audit"` |

## Where to go next

| You want to… | Go to |
|---|---|
| Full reference of the three verdicts and `--json` | [audit — CLI](cli.md) |
| Call `audit` from your own code | [audit — API](api.md) |
| Check a recipe applies to another file | [`validate`](../validate/index.md) |
| Build the recipe being audited | [`cook`](../cook/index.md) |
