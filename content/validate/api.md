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

Defaults and validation live **in the schema**, in the registry — not in
the CLI or any client. Every consumer reads the same contract via
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
print(before["summary"]["safe_to_patch"])  # True / False
```

Diagnose a failed pre-flight with `validate_check`, then confirm a tune
with `validate_after`:

```python
diag = api.call("validate_check", {"path": "target.bin", "recipe": recipe})
print(diag["summary"]["verdict"])  # e.g. "SHIFTED RECOVERABLE"

after = api.call(
    "validate_after",
    {"path": "target_tuned.bin", "recipe": recipe, "recipe_name": "recipe.remap"},
)
print(after["summary"]["patch_confirmed"])  # True / False
```

Each report is a JSON-safe dict with a `summary` object plus the
per-instruction `results`/`failures`/`all_results` list. Read the exact
shape you need from a live call or `list_methods`.

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

A failed validation is **not** an error — it is a normal result (`safe:
False`, `verdict: MISSING UNRECOVERABLE`, `confirmed: False`). Only bad
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
