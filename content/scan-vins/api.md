---
title: scan-vins — API
description: The scan_vins method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [scan-vins, api, rpc]
status: stable
---

# scan-vins — API

> This page is for **developers**. If you just want to scan a file, the
> [plain-English introduction](index.md) is the better place to start.

`scan_vins` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same scan, same input rules,
same result.

> [!NOTE]
> Spelling: the **API method is `scan_vins`** (underscore), the **terminal
> command is `scan-vins`** (dash).

The method is a `command`: one cohesive operation in one domain (atomic).

## Input schema

```python
{
    "path": {"type": "str", "required": True, "description": "Path to the binary."},
    "min_confidence": {"type": "float", "default": 0.4, "min": 0.0, "max": 1.0},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("scan_vins", {"path": "stock.bin"})
# result is a plain JSON-serialisable dict — the same report as `openremap scan-vins --json`

for c in result["candidates"]:
    print(hex(c["offset"]), c["vin"], c["confidence"], c["evidence"])
```

The result is JSON-safe, so an in-process call and an RPC call are
interchangeable.

## Calling it over JSON-RPC

```bash
echo '{"id": 1, "method": "scan_vins", "params": {"path": "stock.bin", "min_confidence": 0.6}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"file": "stock.bin", "file_size": 2097152, "candidates": [{"offset": 8192, "vin": "WVWZZZ1KZ7W059972", "confidence": 0.9, "...": "..."}]}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "scan_vins: missing required param 'path'"}}
```

Out-of-range values are validated too:

```json
{"id": 1, "error": {"code": -32602, "message": "scan_vins: min_confidence must be <= 1.0"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `scan_vins: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'scan_vinsx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

A missing or empty file, or an image that fails to decode, raises a guard
error (`-32000`) — a clean client-facing rejection, never a traceback.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "scan_vins")
print(meta["kind"])          # "command"
print(meta["input_schema"])  # the schema above
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [scan-vins — CLI](cli.md) — the same method from the terminal, with the scoring table
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [health — API](../health/api.md) — the pass that warns about duplicate VINs
