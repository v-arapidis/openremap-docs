---
title: API gate
description: >-
  The single entry point to the engine — the method registry, input schemas, the
  three method kinds, the JSON-RPC transport and the workflow format.
tags: [architecture, internals, api]
status: stable
---

# API gate

Nothing outside the package reaches the engine except through
`openremap/api/`. The CLI calls it, the TUI calls it, `openremap-api` serves it over
a socket, and a Python script can call it in-process. One gate means one place
where defaults, validation and error shapes are decided.

At 0.9.0 the registry holds **41 methods**: 31 `command`, 9 `composite`,
1 `workflow`.

## The registry — `api/registry.py`

```python
@register(
    "identify",
    kind="command",
    description="Identify an ECU binary — manufacturer, family, confidence, VIN.",
    input_schema={
        "path": {"type": "str", "required": True},
        "include_vin": {"type": "bool", "default": False},
    },
)
def identify_cmd(params: dict) -> dict: ...
```

| Function | What it does |
|---|---|
| `register(name, kind, description, input_schema, steps)` | decorator that adds a method and keeps its metadata |
| `list_methods(kind=None)` | metadata only, sorted by name — the TUI's HELP screen reads this |
| `get_method(name)` | one method's metadata |
| `dispatch(name, params)` | merge defaults, validate, call, JSON-serialise |
| `call(name, params)` | in-process convenience wrapper |

**Defaults and validation live in the schema**, not in the CLI, the TUI or the
handler. That is why all three surfaces behave identically: the parameter rules are
data, applied once. A missing required parameter and a wrong type both raise
`InvalidParamsError` with the same message whichever surface asked.

Supported types: `str`, `int`, `float`, `bool`, `bytes`, `dict`, `list`, plus
optional `min` / `max` bounds. Validation rejects `bool` where an `int` is
expected — a detail that matters because Python treats `True` as `1`.

## The three kinds

| Kind | Folder | Meaning |
|---|---|---|
| `command` | `api/commands/` | one cohesive operation, one domain: path I/O + error translation, no policy |
| `composite` | `api/composite/` | several steps that must return **one** coherent report: `analyze`, `health`, `diff_maps`, `cook_strict`, `cook_forced`, `apply_strict`, `apply_shift`, `apply_unique`, `apply_any` |
| `workflow` | `api/workflows/` | a declarative pipeline defined in `.toml`, executed by name |

The split is about the *decision*, not the size. `health` is a composite because
six checks must produce one verdict; `checksum` is a command because it answers one
question. The apply ladder is four composites because each rung is a policy, and a
policy has to be chosen by the caller — not inferred inside a handler.

Refusals from a composite are **expected outcomes, not exceptions**: a handler
returns `applied: false` with the rule id, the message and the next step. Only an
unexpected failure becomes a `GuardError`.

## Errors — `api/errors.py`

| Class | JSON-RPC code | Means |
|---|---|---|
| `UnknownMethodError` | `-32601` | no such method |
| `InvalidParamsError` | `-32602` | the schema rejected the parameters |
| `InternalError` | `-32603` | a bug |
| `GuardError` | `-32603` | the domain refused, unusually |
| — | `-32600` | malformed request |

`serialize.py` guarantees a handler's return value is JSON-safe (bytes become hex
or base64, paths become strings, dataclasses become dicts), so a method can return
numpy-free plain Python and still cross a socket.

## Transport — JSON-RPC 2.0 over stdio

`api/transport/stdio.py` runs a request/response loop on stdin/stdout; any language
can drive the engine without Python bindings:

```bash
openremap-api           # console script from pyproject
```

```
{"jsonrpc":"2.0","id":1,"method":"identify","params":{"path":"dump.bin"}}
{"jsonrpc":"2.0","id":1,"result":{"manufacturer":"Bosch", ...}}
```

`transport/jsonrpc.py` holds the framing, and `force_utf8()` is applied to the
stream first — the same Windows fix the CLI needed, because the copy contains `→`,
`✓` and `Δ` on purpose.

The full method catalogue is on the [API reference](../api/reference.md); the
protocol details are on [transport](../api/calling.md).

## Workflows — the method that is data

A workflow chains methods without writing Python. The shipped example is
`identify_cook`, which identifies both binaries and then cooks a recipe in one
call:

```toml
[[steps]]
method = "identify"
params = { path = "$input.stock" }
as = "stock_identity"

[[steps]]
method = "cook_strict"
params = { stock_path = "$input.stock", tuned_path = "$input.tuned" }
```

References are `$input.*` (the caller's parameters), `$prev.*` (the previous
step's result) and `$as` (a named result kept for later steps). Because the
definitions are shipped inside the wheel, a workflow is available on a machine that
has no source tree — and because they are declarative, a new pipeline is data, not
code.

## Why the gate matters for documentation

This is the part that keeps the wiki honest: **the HELP screen in the TUI is
generated from `list_methods`**, so a command that is added shows up in the app and
one that is removed disappears. The catalogue on this wiki is a snapshot of the same
registry.

See [API concepts](../api/methods.md) for the registry's contract in full.
