---
title: tune — API
description: The tune method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [tune, api, rpc, recipe]
status: stable
---

# tune — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`tune` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — the same three-phase apply.

The method is a **composite**: it orchestrates three operations that are
themselves separate API commands — `validate_before` → `patch` →
`validate_after` — plus the same-file-only policy gate, with fast-fail on
each phase.

## Input schema

```python
{
    "path":           {"type": "str",  "required": True,  "description": "Path to the target binary."},
    "recipe":         {"type": "dict", "required": True,  "description": "Recipe dict to apply."},
    "recipe_name":    {"type": "str",  "description": "Recipe name for the report."},
    "skip_validation": {"type": "bool", "default": False},
    "force":          {"type": "bool", "default": False},
}
```

Defaults and validation live **in the schema**, in the registry — not in
the CLI or any client. Every consumer reads the same contract via
`list_methods`.

## Calling it in-process (Python)

Load a recipe (for example from the `cook` method, or straight from a
`.remap` file) and apply it:

```python
import json
import openremap.api as api

with open("recipe.remap") as fh:
    recipe = json.load(fh)

report = api.call(
    "tune",
    {
        "path": "target.bin",
        "recipe": recipe,
        "recipe_name": "recipe.remap",
    },
)
# result is a plain JSON-serialisable dict — the combined three-phase report
# (phase_1_validate_before, phase_2_apply, phase_3_validate_after, success)

print(report["success"])          # True
print(report["phase_2_apply"])    # e.g. {"applied": ..., "shifted": ...}
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language (the
`recipe` param is a whole JSON object, so client and server must share it):

```bash
echo '{"id": 1, "method": "tune", "params": {"path": "target.bin", "recipe": {...}}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `tune: missing required param 'recipe'` |
| `-32601` | Method not registered | `Unknown method: 'tunex'` |
| `-32000` | Guard rejection (business rule, not a bug) | same-file-only refusal, phase-1 mismatch, empty/undecodable file |
| `-32603` | Unexpected internal failure | — |

Failed phases and policy rejections come back as guard errors (`-32000`) —
the API never writes a partial tune, exactly like the CLI.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "tune")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["validate_before", "patch", "validate_after"]
print(meta["input_schema"])
```

## See also

- [tune — CLI](cli.md) — the same three-phase apply from the terminal
- [`validate` — API](../validate/api.md) — the individual steps as methods
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
