---
title: merge — API
description: The merge method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [merge, api, rpc, recipe]
status: stable
---

# merge — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`merge` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same merge rules, same result.

The method is a `command` (atomic): one cohesive merge operation.

Unlike most other methods it takes the **recipe dicts themselves** (not file
paths) as input — merge two recipes you already loaded or built in-process.

## Input schema

```python
{
    "recipe_a":   {"type": "dict", "required": True, "description": "First recipe dict."},
    "recipe_b":   {"type": "dict", "required": True, "description": "Second recipe dict."},
    "name_a":     {"type": "str",  "description": "First recipe's display name."},
    "name_b":     {"type": "str",  "description": "Second recipe's display name."},
    "stock_path": {"type": "str",  "description": "Common stock binary path (merge base)."},
    "strict":     {"type": "bool", "default": False, "description": "Abort instead of skipping mismatched instructions."},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

## Calling it in-process (Python)

Load two recipes (for example with the `cook` method), then merge them:

```python
import json
import openremap.api as api

with open("egr_off.remap") as fh:
    recipe_a = json.load(fh)
with open("stage1.remap") as fh:
    recipe_b = json.load(fh)

merged = api.call(
    "merge",
    {
        "recipe_a": recipe_a,
        "recipe_b": recipe_b,
        "name_a": "egr_off.remap",
        "name_b": "stage1.remap",
        "stock_path": "stock.bin",
    },
)
# result is a plain JSON-serialisable dict — the merged recipe

print(merged["instructions"])
```

## Calling it over JSON-RPC

The same call over the stdio server — but note the params are **large
objects** (whole recipes), so this is practical mainly when the client and
server share the recipe data anyway:

```bash
echo '{"id": 1, "method": "merge", "params": {"recipe_a": {...}, "recipe_b": {...}, "stock_path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `merge: missing required param 'recipe_b'` |
| `-32601` | Method not registered | `Unknown method: 'mergex'` |
| `-32000` | Guard rejection (business rule, not a bug) | a merge-conflict rejection (same offset, different values) |
| `-32603` | Unexpected internal failure | — |

A real **conflict** (same address edited differently, or overlapping ranges
with different boundaries) is raised as a guard error (`-32000`) — the same
decision the CLI makes (abort instead of guessing). With `strict=False`
(default) mismatched-vs-stock instructions are skipped and reported in the
result instead.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "merge")
print(meta["kind"])   # "command"
print(meta["input_schema"])
```

## See also

- [merge — CLI](cli.md) — the same merge from the terminal
- [`cook` — API](../cook/api.md) — build the recipes you merge
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
