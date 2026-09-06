---
title: scan-maps — API
description: The scan_maps methods of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [scan-maps, api, rpc]
status: stable
---

# scan-maps — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

Map scanning is exposed by `openremap.api` as a family of methods. The
one-shot scan is registered as **`scan_maps`** (underscore) — the CLI
command is `scan-maps` (dash), but the method and the wire protocol use
`scan_maps`. Everything the [CLI](cli.md) can do, the API can do too.

## Input schema (`scan_maps`)

```python
{
    "path":               {"type": "str",   "required": True, "description": "Path to the binary."},
    "region_start":       {"type": "int",   "description": "Optional region start offset."},
    "region_end":         {"type": "int",   "description": "Optional region end offset."},
    "min_score":          {"type": "float", "default": 0.85, "min": 0.0, "max": 1.0},
    "max_series_tables":  {"type": "int",   "default": 16,   "min": 1},
    "whole_file":         {"type": "bool",  "default": False},
    "top":                {"type": "int",   "default": 20,   "min": 1},
    "classify":           {"type": "bool",  "default": False},
    "xrefs":              {"type": "bool",  "default": False},
}
```

In the API the region is two numeric fields (`region_start`, `region_end`)
instead of the CLI's `"0xSTART-0xEND"` string. Both must be present for a
region to be applied.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("scan_maps", {"path": "ecu.bin"})
# result is a plain JSON-serialisable dict — the same shape as `openremap scan-maps --json`

print(result["axes_count"])     # 15967
print(result["tables_count"])   # 1985
print(result["tables"][0]["score"])
```

With labels and code references:

```python
rich = api.call("scan_maps", {
    "path": "ecu.bin",
    "classify": True,
    "xrefs": True,
    "top": 5,
})
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "scan_maps", "params": {"path": "ecu.bin", "top": 5}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"axes_count": 15967, "tables_count": 1985, "layout_filtered": true, "tables": [{"offset": 227058, "score": 0.977, "...": "..."}]}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "scan_maps: missing required param 'path'"}}
```

## Related methods

The API exposes the building blocks behind `scan_maps` as their own
registered methods (used by interactive UIs, which cache each stage):

| Method | Kind | What it does |
|---|---|---|
| `scan_maps` | `command` | One-shot scan (axes + tables + optional classify/xrefs) |
| `scan_classify` | `command` | Scan + probabilistic content labels |
| `scan_map_axes` | `command` | Stage 1 — detect axes only (cached) |
| `scan_map_tables` | `command` | Stage 2 — pair axes into tables (cached) |

All four appear in `list_methods` with their own schemas — use that for
discovery instead of hardcoding.

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `scan_maps: missing required param 'path'` · `scan_maps: min_score must be <= 1.0` |
| `-32601` | Method not registered | `Unknown method: 'scan_mapsx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'ecu.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [scan-maps — CLI](cli.md) — the same scan from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
