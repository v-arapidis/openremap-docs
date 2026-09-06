---
title: cook — API
description: The cook method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [cook, api, rpc, recipe]
status: stable
---

# cook — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`cook` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same diff, same result.

The method is a **composite**: it orchestrates several operations (diff →
map scan → map annotation → region tags) into one combined result. To you it
looks like one call — the composition happens inside.

## Input schema

```python
{
    "original_path":  {"type": "str",  "required": True,  "description": "Path to the stock binary."},
    "modified_path":  {"type": "str",  "required": True,  "description": "Path to the tuned binary."},
    "context_size":   {"type": "int",  "default": 32,     "min": 8, "max": 128},
    "require_unique": {"type": "bool", "default": True},
    "annotate_maps":  {"type": "bool", "default": True},
    "description":    {"type": "str"},
}
```

Defaults and validation live **in the schema**, in the registry — not in
the CLI or any client. Every consumer reads the same contract via
`list_methods`.

Note the naming: the API parameter is `require_unique` (default `True`), the
CLI flag is the inverse, `--allow-non-unique`. Pass `require_unique=False`
to reproduce `--allow-non-unique`.

## Calling it in-process (Python)

```python
import openremap.api as api

recipe = api.call(
    "cook",
    {
        "original_path": "stock.bin",
        "modified_path": "stage1.bin",
    },
)
# result is a plain JSON-serialisable dict — the recipe plus a summary

print(recipe["ecu"]["match_key"])       # "EDC17::08001505827522B"
print(recipe["statistics"]["total_changes"])  # 277
print(recipe["schema_version"])         # "4.4"
```

Skip the map layer for the lean format:

```python
lean = api.call(
    "cook",
    {
        "original_path": "stock.bin",
        "modified_path": "stage1.bin",
        "annotate_maps": False,
    },
)
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "cook", "params": {"original_path": "stock.bin", "modified_path": "stage1.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "cook: missing required param 'modified_path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `cook: missing required param 'modified_path'` |
| `-32601` | Method not registered | `Unknown method: 'cookx'` |
| `-32000` | Guard rejection (business rule, not a bug) | a size-mismatch or non-unique-anchor rejection |
| `-32603` | Unexpected internal failure | — |

Business-rule rejections (files differ in size, context anchor not unique,
empty file, undecodable image) are raised as **guard errors** (`-32000`) —
clean client-facing errors, never tracebacks. A non-unique-anchor rejection
maps to the same `--allow-non-unique` decision as the CLI: call with
`require_unique=False` only when you accept same-file-only reliability.

## Discovery — `list_methods`

Ask the registry what `cook` expects and what it is composed of:

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "cook")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["diff", "scan_map_tables", "attach_maps", "tag_instruction_regions"]
print(meta["input_schema"])
```

## See also

- [cook — CLI](cli.md) — the same diff from the terminal, with output samples
- [cook-volatile — API](../cook-volatile/api.md) — the car-portable variant
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
