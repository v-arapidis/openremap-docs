---
title: analyze — API
description: The analyze method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [analyze, api, rpc]
status: stable
---

# analyze — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`analyze` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same analysis, same result.

The method is a **composite**: it orchestrates several built-in analyses
(identity, VIN, layout, maps, checksums, health) into one combined report.
To you it looks like one call — the composition happens inside.

## Input schema

```python
{
    "path":       {"type": "str",  "required": True,  "description": "Path to the binary."},
    "fast":       {"type": "bool", "default": False,  "description": "Skip maps, checksums, and health."},
    "skip_maps":  {"type": "bool", "default": False,  "description": "Skip the map scan only."},
    "xref_mode":  {"type": "str",  "default": "v1",   "description": "Code-reference pipeline: 'v1' or 'v2'."},
}
```

Defaults and validation live **in the schema**, in the registry — not in
the CLI or any client. Every consumer reads the same contract via
`list_methods`.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("analyze", {"path": "stock.bin"})
# result is a plain JSON-serialisable dict — the same report as `openremap analyze --json`

print(result["identity"]["manufacturer"])  # "Bosch"
print(result["maps"]["table_count"])       # 2632
print(result["health"]["healthy"])         # True
```

Run it quickly by skipping the slow sections:

```python
quick = api.call("analyze", {"path": "stock.bin", "fast": True})
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "analyze", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"container": "raw binary", "identity": {"manufacturer": "Bosch", "ecu_family": "EDC17", "...": "..."}, "fast": false}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "analyze: missing required param 'path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `analyze: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'analyzex'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

A missing or empty file, or an image that fails to decode, raises a guard
error (`-32000`) — a clean client-facing rejection, never a traceback.

## Discovery — `list_methods`

Ask the registry what `analyze` expects and what it is composed of:

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "analyze")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["identify", "scan_map_axes", "scan_map_tables", "check_coherence", "health"]
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [analyze — CLI](cli.md) — the same analysis from the terminal, with the JSON schema
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [health — API](../health/api.md) — the go / no-go verdict as its own method
