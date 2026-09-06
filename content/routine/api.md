---
title: routine — API
description: The routine method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [routine, api, rpc]
status: stable
---

# routine — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`routine` is one method registered with `openremap.api` — a plain
`command` (one cohesive operation). Everything the [CLI](cli.md) can do,
the API can do too.

## Input schema

```python
{
    "path":    {"type": "str", "required": True, "description": "Path to the binary."},
    "offset":  {"type": "int", "required": True, "description": "File offset to disassemble at."},
    "arch":    {"type": "str", "description": "Decoder override (c166|tricore|sh|x86|m680x|m68k|ppc)."},
    "before":  {"type": "int", "default": 8,  "min": 0},
    "after":   {"type": "int", "default": 60, "min": 0},
}
```

Unlike the CLI (which accepts `"0x50000"`), the API takes `offset` as an
integer — convert yourself when you come from a hex string:
`int("0x50000", 0)`.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("routine", {"path": "ecu.bin", "offset": 0x50000})
# result is a plain JSON-serialisable dict

print(result["arch"])      # "c166"
print(result["offset"])    # 327680
for line in result["lines"]:
    print(line)            # one instruction per line; target prefixed ">>"
```

Force a decoder and widen the window:

```python
wide = api.call("routine", {"path": "ecu.bin", "offset": 0x50000, "arch": "c166", "after": 120})
```

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "routine", "params": {"path": "ecu.bin", "offset": 327680}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"arch": "c166", "offset": 327680, "lines": [">> 0x00050000  ...", "..."]}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "routine: missing required param 'offset'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `routine: missing required param 'offset'` |
| `-32601` | Method not registered | `Unknown method: 'routinex'` |
| `-32000` | Guard rejection (business rule, not a bug) | `No decoder for family 'X' — pass --arch to force one (supported: c166, tricore, sh, x86, m680x, m68k, ppc).` · `Unsupported arch 'cisc'.` |
| `-32603` | Unexpected internal failure | — |

"No decoder for the family" and "unsupported arch" are guard errors —
clean client-facing rejections, never a traceback.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "routine")
print(meta["kind"])   # "command"
print(meta["input_schema"])
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [routine — CLI](cli.md) — the same decode from the terminal
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [Decoders](../concepts/decoders.md) — the decoder list and the detection cascade
