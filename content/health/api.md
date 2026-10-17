---
title: health — API
description: The health method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [health, api, rpc]
status: stable
---

# health — API

> This page is for **developers**. If you just want to check a file, the
> [plain-English introduction](index.md) is the better place to start.

`health` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same checks, same input rules,
same result.

The method is a **composite**: it runs several built-in sub-checks
(identity, checksums, map tables, layout, VINs) and combines them into one
verdict. To you it looks like a single call — the composition happens
inside.

## Input schema

```python
{
    "path": {"type": "str", "required": True, "description": "Path to the binary."},
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

result = api.call("health", {"path": "stock.bin"})
# result is a plain JSON-serialisable dict — the same report as `openremap health --json`

print(result["healthy"])        # True or False
print(result["family"])         # "EDC17" (or None when unidentified)
for check in result["checks"]:
    print(check["name"], check["status"], check["message"])
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "health", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"healthy": true, "file_size": 2097152, "family": "EDC17", "checks": [{"name": "checksums", "status": "ok", "...": "..."}]}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "health: missing required param 'path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `health: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'healthx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

A missing or empty file, or an image that fails to decode, raises a guard
error (`-32000`) — a clean client-facing rejection, never a traceback.

## Discovery — `list_methods`

Ask the registry what `health` expects and what it is composed of:

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "health")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["identify", "checksums", "scan_map_tables", "segment", "scan_vins"]
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [health — CLI](cli.md) — the same method from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [checksum — API](../checksum/api.md) — the checksum sub-check as its own method
