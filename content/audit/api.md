---
title: audit — API
description: The audit method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [audit, api, rpc, recipe]
status: stable
---

# audit — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`audit` is one method registered with `openremap.api` — the same three-way
receipt check as the [CLI](cli.md).

The method is a `command` (atomic): one cohesive audit operation across the
three inputs.

## Input schema

```python
{
    "stock_path":  {"type": "str",  "required": True,  "description": "Path to the stock binary."},
    "tuned_path":  {"type": "str",  "required": True,  "description": "Path to the tuned binary."},
    "recipe":      {"type": "dict", "required": True,  "description": "Recipe dict to audit."},
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

report = api.call(
    "audit",
    {
        "stock_path": "stock.bin",
        "tuned_path": "stage1.bin",
        "recipe": recipe,
        "recipe_name": "recipe.remap",
    },
)
# result is a plain JSON-serialisable dict — the audit report

print(report["provenance"]["ok"])        # True — built from this stock?
print(report["fingerprint"]["ok"])       # True — honest record of the pair?
print(report["unaccounted"]["bytes"])    # bytes changed but NOT explained
print(report["unaccounted"]["blocks"])   # each {offset, size, region, region_confidence}
print(report["clean"])                   # True when all verdicts pass
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "audit", "params": {"stock_path": "stock.bin", "tuned_path": "stage1.bin", "recipe": {...}}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `audit: missing required param 'recipe'` |
| `-32601` | Method not registered | `Unknown method: 'auditx'` |
| `-32000` | Guard rejection (business rule, not a bug) | empty or undecodable input file |
| `-32603` | Unexpected internal failure | — |

A failed verdict is **not** an error — it is a normal result you can branch
on. Only bad input or unreadable files raise errors.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "audit")
print(meta["kind"])   # "command"
print(meta["input_schema"])
```

## See also

- [audit — CLI](cli.md) — the same check from the terminal
- [`validate` — API](../validate/api.md) — applicability checks
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
