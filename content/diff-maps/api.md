---
title: diff-maps — API
description: The diff_maps method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [diff-maps, api, rpc]
status: stable
---

# diff-maps — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`diff_maps` is one method registered with `openremap.api` — note the
underscore: the CLI command is `diff-maps`, but the method and the wire
protocol use `diff_maps`. The method is a **composite**: two map scans +
axis matching + cell diff composed into one call.

## Input schema

```python
{
    "stock_path":         {"type": "str",  "required": True,  "description": "Path to the stock binary."},
    "tuned_path":         {"type": "str",  "required": True,  "description": "Path to the tuned binary."},
    "region_start":       {"type": "int",  "description": "Optional region start offset."},
    "region_end":         {"type": "int",  "description": "Optional region end offset."},
    "min_score":          {"type": "float", "default": 0.55, "min": 0.0, "max": 1.0},
    "threshold":          {"type": "float", "default": 0.0},
    "top":                {"type": "int",  "default": 50,   "min": 1},
    "whole_file":         {"type": "bool", "default": False},
    "max_series_tables":  {"type": "int",  "default": 16,   "min": 1},
    "recipe":             {"type": "dict", "description": "Recipe dict to cross-reference."},
}
```

Two differences from the CLI: the region is two numeric fields, and
`recipe` is a **dict** (a decoded `.remap` recipe) — the CLI reads the
recipe file and passes the dict for you.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("diff_maps", {
    "stock_path": "stock.bin",
    "tuned_path": "stage1.bin",
})
# result is a plain JSON-serialisable dict — the same shape as `openremap diff-maps --json`

print(result["matched_count"])            # 342
print(result["matches"][0]["max_abs"])    # 23
```

Cross-reference a recipe you already loaded:

```python
import json

recipe = json.load(open("tune.remap"))   # or however you obtain the recipe dict
result = api.call("diff_maps", {
    "stock_path": "stock.bin",
    "tuned_path": "stage1.bin",
    "recipe": recipe,
})
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "diff_maps", "params": {"stock_path": "stock.bin", "tuned_path": "stage1.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"stock": "stock.bin", "tuned": "stage1.bin", "matched_count": 342, "matches": [{"offset_stock": 227058, "max_abs": 23, "...": "..."}]}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "diff_maps: missing required param 'tuned_path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `diff_maps: missing required param 'stock_path'` · `diff_maps: min_score must be <= 1.0` |
| `-32601` | Method not registered | `Unknown method: 'diff_mapsx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "diff_maps")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["scan_map_axes", "scan_map_tables", "match_by_axis", "diff_cells"]
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [diff-maps — CLI](cli.md) — the same diff from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [scan-maps — API](../scan-maps/api.md) — the two map scans behind the diff
