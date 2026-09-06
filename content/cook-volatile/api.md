---
title: cook-volatile — API
description: The cook_volatile method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [cook-volatile, api, rpc, recipe]
status: stable
---

# cook-volatile — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`cook_volatile` (note the **underscore** — the code name differs from the
CLI's `cook-volatile`) is one method registered with `openremap.api`. It is
the same car-portable cooking pipeline as the [CLI](cli.md).

The method is a **composite**: it composes the `cook` pipeline (diff → map
scan → annotation → region tags) with a volatile-classification pass and
the exclusion filter.

## Input schema

```python
{
    "original_path":   {"type": "str",  "required": True,  "description": "Path to the stock binary."},
    "modified_path":   {"type": "str",  "required": True,  "description": "Path to the tuned binary."},
    "context_size":    {"type": "int",  "default": 32,     "min": 8, "max": 128},
    "require_unique":  {"type": "bool", "default": True},
    "no_exclude":      {"type": "bool", "default": False},
    "exclude_uncertain": {"type": "bool", "default": False},
    "annotate_maps":   {"type": "bool", "default": True},
}
```

Defaults and validation live **in the schema**, in the registry — not in
the CLI or any client. Every consumer reads the same contract via
`list_methods`.

Note the API has no `accept_volatile` parameter — that CLI flag only
suppresses the human-readable review list; it changes nothing in the result.

## Calling it in-process (Python)

```python
import openremap.api as api

portable = api.call(
    "cook_volatile",
    {
        "original_path": "stockA.bin",
        "modified_path": "stage1.bin",
    },
)
# result is a plain JSON-serialisable dict — the recipe plus a summary

print(portable["schema_version"])                # "4.5"
print(portable["volatile"]["summary"])           # {"excluded_count": ..., "flagged_count": ..., "bytes_excluded": ...}
```

Keep every instruction (max safety, zero portability):

```python
safe = api.call(
    "cook_volatile",
    {
        "original_path": "stockA.bin",
        "modified_path": "stage1.bin",
        "no_exclude": True,
    },
)
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "cook_volatile", "params": {"original_path": "stockA.bin", "modified_path": "stage1.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "cook_volatile: missing required param 'original_path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `cook_volatile: missing required param 'modified_path'` |
| `-32601` | Method not registered | `Unknown method: 'cook_volatilex'` |
| `-32000` | Guard rejection (business rule, not a bug) | a size-mismatch or non-unique-anchor rejection |
| `-32603` | Unexpected internal failure | — |

Business-rule rejections (files differ in size, context anchor not unique,
empty file, undecodable image) are guard errors (`-32000`) — clean
client-facing errors, never tracebacks.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "cook_volatile")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["diff", "classify_volatile", "scan_map_tables", "attach_maps", "tag_instruction_regions"]
print(meta["input_schema"])
```

## See also

- [cook-volatile — CLI](cli.md) — the same method from the terminal
- [`cook` — API](../cook/api.md) — the plain (non-portable) cooker
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
