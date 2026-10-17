---
title: convert — API
description: The convert method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [convert, api, rpc]
status: stable
---

# convert — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`convert` is one method registered with `openremap.api` — a plain
`command` (one cohesive operation). Everything the [CLI](cli.md) can do,
the API can do too.

## Input schema

```python
{
    "path":   {"type": "str", "required": True,  "description": "Path to the input file."},
    "format": {"type": "str", "default": "auto", "description": "auto | ihex | srec | bin."},
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

result = api.call("convert", {"path": "boot.hex"})
# result is a plain JSON-serialisable dict

print(result["format"])        # "ihex"
print(result["format_name"])   # "Intel HEX"
print(result["size"])          # 4194304
```

One difference from the CLI `--json` summary: the full API result also
carries the converted bytes as base64 text under `data_b64` — that is what
the CLI decodes when it writes the `.bin` file:

```python
import base64

flat = base64.b64decode(result["data_b64"])
open("boot.bin", "wb").write(flat)
```

Force the interpretation the same way the CLI does:

```python
raw_result = api.call("convert", {"path": "weird.bin", "format": "bin"})
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "convert", "params": {"path": "boot.hex"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line — `data_b64` holds the flat bytes):

```json
{"id": 1, "result": {"format": "ihex", "format_name": "Intel HEX", "size": 4194304, "data_b64": "AAECAwQFBg==", "segments": 1, "warnings": []}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "convert: missing required param 'path'"}}
```

An empty file, an invalid `--format` value, or an image that fails to
decode raises a guard error (`-32000`) — a clean client-facing rejection,
never a traceback.

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `convert: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'convertx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'boot.hex' is empty.` · `--format must be one of: auto, ihex, srec, bin.` |
| `-32603` | Unexpected internal failure | — |

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "convert")
print(meta["kind"])   # "command"
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [convert — CLI](cli.md) — the same normalisation from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
