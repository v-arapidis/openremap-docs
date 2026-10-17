---
title: validate — API
description: The validate_before, validate_check and validate_after methods of openremap.api — input schemas, in-process calls, JSON-RPC, error codes.
tags: [validate, api, rpc, recipe]
status: stable
---

# validate — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

The three validation steps are **three separate methods** registered with
`openremap.api` — the same checks the [CLI](cli.md) sub-commands and the
[`tune`](../tune/index.md) composite use:

| Method | CLI equivalent | Checks |
|---|---|---|
| `validate_before` | `validate before` | original bytes (`ob`) at the exact expected offsets (pre-flight) |
| `validate_check` | `validate check` | whether the `ob` bytes exist anywhere (diagnostic) |
| `validate_after` | `validate after` | new bytes (`mb`) present at the right offsets (confirmation) |

All three are `command` kind (atomic). They share the same input schema.

## Input schema (same for all three)

```python
{
    "path":        {"type": "str",  "required": True,  "description": "Path to the binary."},
    "recipe":      {"type": "dict", "required": True,  "description": "Recipe dict to validate against."},
    "recipe_name": {"type": "str",  "description": "Recipe name for the report."},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

## Calling it in-process (Python)

```python
import json
import openremap.api as api

with open("recipe.remap") as fh:
    recipe = json.load(fh)

before = api.call(
    "validate_before",
    {"path": "target.bin", "recipe": recipe, "recipe_name": "recipe.remap"},
)

# The validator's report sits under "report"; the two warnings travel beside it.
print(before["report"]["summary"]["safe_to_patch"])  # True / False
print(before["size_warn"])                           # None when the sizes match
```

Diagnose a failed pre-flight with `validate_check`, then confirm a tune
with `validate_after`:

```python
diag = api.call("validate_check", {"path": "target.bin", "recipe": recipe})
print(diag["report"]["summary"]["verdict"])  # e.g. "shifted_recoverable"

after = api.call(
    "validate_after",
    {"path": "target_tuned.bin", "recipe": recipe, "recipe_name": "recipe.remap"},
)
print(after["report"]["summary"]["patch_confirmed"])  # True / False
```

All three wrap their report the same way:

| Key | What it holds |
|---|---|
| `report` | the validator's report — `summary` plus the per-instruction list |
| `size_warn` | the size warning (`None` when the sizes match) |
| `match_key_warn` | the match-key warning (`None` when they agree) |

The verdict key and the per-instruction list differ per method:

| Method | Verdict key | Per-instruction list |
|---|---|---|
| `validate_before` | `summary.safe_to_patch` | `failures` + `all_results` |
| `validate_check` | `summary.verdict` | `results` |
| `validate_after` | `summary.patch_confirmed` | `failures` + `all_results` |

`validate_check`'s `verdict` is one of four lowercase strings: `safe_exact`,
`shifted_recoverable`, `missing_unrecoverable`, `invalid_recipe`.

`validate_before` additionally adds a `report.same_file_only` block recording
the portability gate (`stamped`, `allowed`, `note`). For the exact shape, read
a live call or `list_methods`.

## Calling it over JSON-RPC

The same calls over the stdio server — usable from any language (the
`recipe` param is a whole JSON object):

```bash
echo '{"id": 1, "method": "validate_before", "params": {"path": "target.bin", "recipe": {...}}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `validate_before: missing required param 'recipe'` |
| `-32601` | Method not registered | `Unknown method: 'validate_beforex'` |
| `-32000` | Guard rejection (business rule, not a bug) | empty or undecodable file |
| `-32603` | Unexpected internal failure | — |

A failed validation is **not** an error — it is a normal result
(`report.summary.safe_to_patch: false`, `report.summary.verdict:
"missing_unrecoverable"`, `report.summary.patch_confirmed: false`). Only bad
input or unreadable files raise errors.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
names = [m["name"] for m in catalogue["methods"] if m["name"].startswith("validate_")]
print(names)  # ["validate_after", "validate_before", "validate_check"]
```

## See also

- [validate — CLI](cli.md) — the same checks from the terminal
- [`tune` — API](../tune/api.md) — the composite that runs before + apply + after
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
