---
title: synth — API
description: The generate_dump method of openremap.api — input schema, the base64 payload, the planted ground truth, and error codes.
tags: [synth, api, rpc, fixtures]
status: stable
---

# synth — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`generate_dump` is one method registered with `openremap.api`. It is the same
generator the [`synth`](cli.md) command drives — the CLI writes the bytes to a
file, this method hands them back encoded.

The method is a `command`: one cohesive operation in one domain (atomic). No
hidden pipeline.

## Input schema

```python
{
    "size":       {"type": "int",  "default": 262144, "min": 4096},
    "maps":       {"type": "int",  "default": 1,      "min": 0, "max": 64},
    "seed":       {"type": "int",  "default": 7},
    "cell_width": {"type": "int",  "default": 2,      "min": 1, "max": 2},
    "byte_order": {"type": "str",  "default": "little"},
    "layout":     {"type": "list", "default": ["code", "calibration", "erased", "code"]},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

Note the `layout` rule: an **absent** `layout` falls back to the default, but an
explicitly **empty** list is a caller error, not a silent default.

## Calling it in-process (Python)

```python
import base64
import openremap.api as api

dump = api.call(
    "generate_dump",
    {"size": 262144, "maps": 2, "seed": 42},
)

# The bytes come back base64-encoded, like every binary payload in the API.
data = base64.b64decode(dump["data_b64"])
print(len(data), dump["size"])        # 262144 262144
print(dump["sha256"])

for m in dump["maps"]:
    print(m["map_id"], f'{m["cols"]}x{m["rows"]}', hex(m["offset"]))
```

The result keys:

| Key | What it holds |
|---|---|
| `data_b64` | The generated binary, base64-encoded |
| `sha256` | Fingerprint of those bytes — the same settings always produce the same value |
| `size` | Length in bytes |
| `sectors` | `[{kind, start, end}]` — the layout that was written |
| `maps` | The planted ground truth, one entry per table (below) |
| `params` | The settings echoed back: `size`, `maps`, `seed`, `layout`, `cell_width`, `byte_order` |

Each `maps` entry:

| Field | Meaning |
|---|---|
| `map_id` | `0`-based index, in planting order |
| `offset` / `end` | Byte range of the table's cells |
| `cols` / `rows` | Table shape |
| `cell_width` / `byte_order` | `1` or `2` bytes per cell; `little` or `big` |
| `x_axis_offset` / `y_axis_offset` | Where each axis sits |
| `x_axis` / `y_axis` | The axis values, as written |

The cell values themselves are **deliberately not returned** — they are large,
trivially recomputed from the binary, and would bloat every reply.

Note that `params` echoes back what was used, so a failing case can be
reproduced with the identical call.

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language:

```bash
echo '{"id": 1, "method": "generate_dump", "params": {"size": 262144, "maps": 2}}' \
  | python -m openremap.api.transport.stdio
```

`data_b64` is the bulk of the reply, so expect a large line.

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params | `generate_dump: size must be at least 4096 bytes` |
| `-32601` | Method not registered | `Unknown method: 'generate_dumpx'` |
| `-32603` | Unexpected internal failure | — |

Bad parameter **combinations** are caller errors, not internal failures, so
they arrive as `-32602` with an actionable message:

| Situation | Message |
|---|---|
| Size below 4096 | `size must be at least 4096 bytes` |
| Negative map count | `maps must be >= 0` |
| Bad cell width | `cell_width must be 1 or 2` |
| Bad byte order | `byte_order must be 'little' or 'big'` |
| Unknown or empty layout | `layout must be a non-empty sequence of ('code', 'calibration', 'erased')` |
| `maps` with no calibration sector | `layout has no calibration sector to plant maps in` |
| Calibration sector too small | `calibration sector 0x… -0x… is too small for N map(s) of shape CxR; enlarge the dump or …` |

Note that `generate_dump` takes no file path, so it never touches the
filesystem — writing the bytes is the caller's job (which is what the CLI does).

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {"kind": "command"})
meta = next(m for m in catalogue["methods"] if m["name"] == "generate_dump")
print(meta["kind"])          # "command"
print(meta["input_schema"])
```

## See also

- [synth — CLI](cli.md) — the same generator from the terminal
- [synth — introduction](index.md) — what it is for
- [`contribute` — API](../contribute/api.md) — the other method that works without a real dump
- [`analyze` — API](../analyze/api.md) — a good first thing to run on a generated file
