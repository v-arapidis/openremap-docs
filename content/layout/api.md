---
title: layout — API
description: The layout method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [layout, api, rpc]
status: stable
---

# layout — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`layout` is one method registered with `openremap.api` — a plain
`command` (one cohesive operation). Everything the [CLI](cli.md) can do,
the API can do too.

## Input schema

```python
{
    "path":    {"type": "str", "required": True, "description": "Path to the binary."},
    "min_run": {"type": "int", "default": 64, "min": 1},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`. Note that `min_run` is bounded (`>= 1`); passing `0` is
rejected.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("layout", {"path": "ecu.bin"})
# result is a plain JSON-serialisable dict — the same object as `openremap layout --json` (minus the CLI's "file" field)

print(result["file_size"])     # 1048576
for region in result["regions"]:
    print(region["kind"], hex(region["start"]), hex(region["end"]), region["confidence"])
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "layout", "params": {"path": "ecu.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"file_size": 1048576, "regions": [{"kind": "erased", "start": 0, "end": 524288, "confidence": 0.95, "...": "..."}], "ident_blocks": []}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "layout: missing required param 'path'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `layout: missing required param 'path'` · `layout: min_run must be >= 1` |
| `-32601` | Method not registered | `Unknown method: 'layoutx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'ecu.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "layout")
print(meta["kind"])   # "command"
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [layout — CLI](cli.md) — the same segmentation from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
