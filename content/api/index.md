---
title: API
description: >-
  openremap.api — 41 methods over the engine, callable in-process from Python or
  over JSON-RPC from any language. Every result is JSON-serialisable.
tags: [api, overview]
status: stable
---

# API

`openremap.api` is the single gate into the engine. The CLI and the TUI are
consumers of it, not special cases — so anything they can do, you can call.

```python
import openremap.api as api

result = api.call("identify", {"path": "original.bin"})
print(result["match_key"])          # EDC17C66::1037541778126241V0
```

The registry holds **41 methods**: 31 `command`, 9 `composite`, 1 `workflow`.

## Three entry styles

| Style | Call | When |
|---|---|---|
| dispatch by name | `api.call("identify", {...})` | method name comes from config, a queue, or user input |
| direct function | `api.identify(path=...)` | you know the method at authoring time; gets type hints |
| JSON-RPC over stdio | `openremap-api` | the consumer is not Python — a Go/Rust/Node/editor plugin, or a subprocess boundary |

All three go through the same dispatch, so defaults, validation, error codes and
the returned data are identical.

## The contract in one paragraph

Names are strings. Parameters arrive as **one dict**. The registry fills in
defaults, validates types and bounds from the method's declared `input_schema`, and
then calls the handler. Whatever the handler returns goes through
`to_json_safe()` exactly once — `Enum`, `bytes`, `dataclass` and `tuple` never leak
out — so `api.call(...)` and the JSON you get over RPC are **the same data**. A
refusal is a *result*, not an exception; a bad request is an *exception* with a
JSON-RPC code.

## Install

The API ships inside the package like everything else:

```bash
uv tool install openremap     # or: pip install openremap
```

```python
import openremap.api as api   # the gate
```

There is no server to run and no port to open. `openremap-api` speaks JSON-RPC on
stdin/stdout for non-Python callers.

## Section map

| Page | Contents |
|---|---|
| [Method contract](methods.md) | `register` / `list_methods` / `dispatch`, the input-schema spec, validation rules, serialisation, error codes |
| [Calling it](calling.md) | in-process, direct functions, JSON-RPC framing, a Python client, binary payloads, threading |
| [Composites](composites.md) | the methods that return one report — cook, apply, health, analyze — and the refusal-as-data contract |
| [Workflows](workflows.md) | the `.toml` pipeline format, `$input`/`$prev`/`$as`, the shipped `identify_cook` |
| [Reference](reference.md) | all 41 methods with kind, steps and exact input schemas |

## Versioning

```python
api.call("version")     # {'version': '0.9.0', 'backend': 'rust'}
```

`backend` is the native engine that loaded. If it is not `rust`, the extension is
missing and the CPU-heavy methods will be slow or unavailable — the same fact
`openremap --version` prints as `(rust)`.
