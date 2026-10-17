---
title: checksum — API
description: The checksum method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [checksum, api, rpc]
status: stable
---

# checksum — API

> This page is for **developers**. If you just want to check a file, the
> [plain-English introduction](index.md) is the better place to start.

`checksum` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — same detection, same input
rules, same result.

The method is a `command`: one cohesive operation in one domain (atomic).
No hidden pipeline.

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

result = api.call("checksum", {"path": "stock.bin"})
# result is a plain JSON-serialisable dict — the same report as `openremap checksum --json`

print(result["me7_main"]["status"])   # "ok" | "stale" (None when not an ME7 file)
print(len(result["ironfelix"]))       # number of family profiles reported
print(len(result["schemes"]))         # generic sweep matches
```

The result is JSON-safe, so an in-process call and an RPC call are
interchangeable.

## Calling it over JSON-RPC

```bash
echo '{"id": 1, "method": "checksum", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"file_size": 1048576, "me7_main": {"status": "ok", "stored": "E090F65E", "expected": "E090F65E"}, "...": "..."}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "checksum: missing required param 'path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `checksum: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'checksumx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

A missing or empty file, or an image that fails to decode, raises a guard
error (`-32000`) — a clean client-facing rejection, never a traceback.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "checksum")
print(meta["kind"])          # "command"
print(meta["input_schema"])  # the schema above
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [checksum — CLI](cli.md) — the same method from the terminal, with the scheme reference
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [health — API](../health/api.md) — the six-check pass that includes the checksum check
