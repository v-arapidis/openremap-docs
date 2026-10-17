---
title: identify — API
description: The identify method of openremap.api — the input schema, calling it in-process with Python, and calling it over JSON-RPC from any language.
tags: [identify, api, rpc]
status: stable
---

# identify — API

> This page is for **developers**. If you just want to read a file, the
> [plain-English introduction](index.md) is the better place to start.

`identify` is one action registered with `openremap.api`, the library that
programs use to drive OpenRemap. Everything the [CLI](cli.md) can do, the
API can do too — same action, same input rules, same result. A *method* is
simply one such action (`identify`, `cook`, `tune`, …).

The method is a `command`: one cohesive operation in one domain (atomic). No
other params, no hidden pipeline.

## Input schema

```python
{
    "path": {"type": "str", "required": True, "description": "Path to the binary."},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it, so a call that validates here validates for every API consumer.
The CLI declares its own `--flags`, so a schema change reaches the terminal
only when the CLI is updated too — check the live schema with `list_methods`.

## Calling it in-process (Python)

Importing `openremap.api` registers every command, composite and workflow
automatically. Then dispatch by name:

```python
import openremap.api as api

result = api.call("identify", {"path": "stock.bin"})
# result is a plain JSON-serialisable dict — identical to `openremap identify --json`

print(result["manufacturer"])      # "Bosch"
print(result["ecu_family"])        # "EDC17"
print(result["match_key"])         # "EDC17C66::1037541778"
print(result["confidence"]["tier"])  # "High"
```

The result fields match the [CLI `--json` output](cli.md#json-json): the
identity fields, `confidence` (with `score`, `tier`, `signals`, `warnings`)
and `vin` (when a candidate scores ≥ 0.6). Since the result is JSON-safe, an
in-process call and an RPC call are interchangeable.

### Discovery — `list_methods`

Ask the registry what exists (name, kind, description, input schema, and the
steps for composites/workflows):

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
identify_meta = next(m for m in catalogue["methods"] if m["name"] == "identify")
print(identify_meta["input_schema"])  # the schema above
```

### Errors are typed

In-process you get Python exceptions; see
[Error handling](#error-handling) below for the codes.

## Calling it over JSON-RPC

The API also speaks **JSON-RPC 2.0**, one line-delimited request per line
over stdin/stdout — usable from any language, no Python embedding needed:

```bash
# Start the RPC server (logs go to stderr; stdout carries only responses)
python -m openremap.api.transport.stdio
```

Send a request from another process — for example with a shell pipe:

```bash
echo '{"id": 1, "method": "identify", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"manufacturer": "Bosch", "ecu_family": "EDC17", "match_key": "EDC17C66::1037541778", "...": "..."}}
```

Errors come back as JSON-RPC error objects instead of a bare string — clients
branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "identify: missing required param 'path'"}}
```

The full protocol — framing, codes, spawn details — is on the
[API transport page](../api/transport.md); the three surfaces are explained
in [CLI, API & RPC](../getting-started/interfaces.md).

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `identify: missing required param 'path'` |
| `-32601` | Method not registered | `Unknown method: 'identifyx'` |
| `-32000` | Guard rejection (business rule, not a bug) | `Binary file 'stock.bin' is empty.` |
| `-32603` | Unexpected internal failure | — |

A missing or empty file, or an image that fails to decode, raises a guard
error (`-32000`) — a clean, client-facing rejection, never a traceback.

## Quick smoke test

```bash
# Server alive?
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [identify — CLI](cli.md) — the same method from the terminal, with sample outputs
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [Confidence scoring](../concepts/confidence.md) — what the `confidence` dict means
