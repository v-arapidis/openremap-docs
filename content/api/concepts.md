---
title: API concepts
description: How openremap.api is organised — the method registry, the typed input-schema contract, the three kinds (command / composite / workflow), and the error codes.
tags: [api]
status: stable
---

# API concepts — registry, methods and kinds

This page explains how `openremap.api` is organised. It is developer-facing;
if you only need to call one method, its own page (e.g.
[identify — API](../identify/api.md)) is enough.

## The registry — one source of truth

`openremap.api.registry` is the **single source of truth for which methods
exist**. Commands, composites and workflows all register here with metadata;
the transport (JSON-RPC) dispatches **purely by name lookup** and knows
nothing about the domain.

Each method carries:

```python
{
    "name": "identify",          # the name you call it by
    "kind": "command",           # command | composite | workflow
    "description": "Identify an ECU binary — manufacturer, family, confidence, VIN.",
    "input_schema": {...},       # the typed parameter contract (below)
    "steps": [...],              # composites/workflows only: what they run
}
```

The important functions:

| Function | What it does |
|---|---|
| `register(name, kind=…, description=…, input_schema=…, steps=…)` | Decorator that adds a method to the registry |
| `dispatch(name, params)` | Look up, apply the schema (defaults + validation), run, return a JSON-safe dict |
| `call(name, params)` | In-process convenience wrapper around `dispatch` |
| `list_methods(kind=None)` | All method metadata (handlers excluded), sorted by name — the live catalogue |
| `get_method(name)` | One method's metadata |
| `unregister(name)` | Remove a method (used by tests/reloads) |

## The input schema is the contract

Every method declares its parameters in its `input_schema`. Each parameter
spec can carry:

- **`type`** — `str`, `int`, `float`, `bool`, `bytes`, `dict`, `list`
- **`required`** — bool; a required param with no value and no default is an error
- **`default`** — applied when the caller omits the param
- **`min` / `max`** — numeric bounds, enforced
- **`description`** — what the parameter means

Defaults and validation live **here**, in the schema — not in the CLI or any
client. The CLI, a GUI and an RPC client all read the same contract, so a
call that validates in one place validates everywhere.

> [!TIP]
> Run `list_methods` to see the *live* schema of every method — the
> [reference page](reference.md) mirrors the registry but may lag a release
> behind. The registry is always the truth.

## The three kinds

Methods come in three kinds:

| `kind` | Meaning | Defined as |
|---|---|---|
| `command` | **Atomic** — one cohesive operation, one domain | hand-written Python |
| `composite` | **Composition** — orchestrates independent operations or domains | hand-written Python |
| `workflow` | **Declarative pipeline** — linear, unconditional | a data file (TOML), no code |

### When is a hand-written method a `composite`?

Its non-presentation core orchestrates **multiple independent operations**
into one result. It qualifies if **at least one** of these holds:

1. **Cross-domain** — it calls service functions from **≥ 2 distinct
   service domains** (identify, maps, checksums, health, arch, recipes,
   entropy, convert).
2. **Command composition** — it orchestrates **≥ 2 operations that are
   themselves exposed as separate API methods**.

A method stays **`command` (atomic)** when its core is one cohesive
operation in one domain — even if it batches over a directory, has internal
sub-steps that are *not* exposed as separate methods, or uses
cross-cutting low-level primitives (entropy, convert/decode) as helpers.

**The discriminator (quick test):** *"If I deleted this method, would its
sub-parts still be independently useful — as separate methods, or as
separate service domains?"* — **YES** → composite; **NO** (the whole thing
is one atomic "do X") → command.

### Why composites are NOT workflows

Composites are hand-written because they have **control flow** (flags,
gates, fail-fast), **cross-result coherence** (identity ↔ checksum ↔ arch
agree), or **one-pass efficiency** that a linear declarative pipeline cannot
express. A `workflow` is reserved for simple, linear, unconditional
compositions — [see the workflows page](workflows.md).

### The classified set (verified 2026-09)

**Composite (6):**

| Method | What it composes |
|---|---|
| `analyze` | identify + VIN + layout + maps + checksums + health + coherence |
| `tune` | validate_before → patch → validate_after |
| `cook` | diff + map scan + annotation + region tags |
| `cook_volatile` | cook + volatile classification |
| `diff_maps` | scan ×2 + map matching + cell diff |
| `health` | identity + checksums + maps + layout + VIN |

**Atomic (`command`):** `identify`, `scan`, `audit`, `merge`, `scan_maps`,
`convert`, `layout`, `scan_vins`, `routine`, `checksum`, `patch`,
`validate_before`, `validate_check`, `validate_after`, plus the two staged
map-scan methods `scan_map_axes` / `scan_map_tables`, `scan_classify`, and
the meta commands `ping` / `version` / `list_methods`.

> [!NOTE]
> `audit` and `merge` are **atomic**, not composite. Each is one service
> function in the recipes domain (`audit()`, `merge_recipes()`) whose
> sub-steps (provenance/fingerprint; validate-both/merge) are internal and
> not separately exposed.

The current full catalogue with schemas is on the
[reference page](reference.md).

## Errors: typed in-process, coded over the wire

In-process callers get **Python exceptions**; RPC clients get **JSON-RPC
error objects** you can branch on by `code`. The API keeps these separate so
domain logic stays transport-agnostic.

| Code | Name | Meaning | Example message |
|---|---|---|---|
| `-32700` | Parse error | The request line was not valid JSON | `Parse error` |
| `-32600` | Invalid request | Not an object, or missing a method | `Invalid request: missing method` |
| `-32601` | Method not found | The name is not registered | `Unknown method: 'identifyx'` |
| `-32602` | Invalid params | Schema validation failed | `identify: missing required param 'path'` |
| `-32603` | Internal error | Unexpected failure (never a traceback to the client) | `Internal error` |
| `-32000` | Guard rejection | An expected business-rule rejection (empty file, bad image, non-unique anchors…) — not a bug | `Binary file 'stock.bin' is empty.` |

Python-side, these map to `errors.ApiError` subclasses:
`UnknownMethodError` (-32601), `InvalidParamsError` (-32602),
`GuardError` (-32000), `InternalError` (-32603).

> [!IMPORTANT]
> A **guard rejection** (`-32000`) is a *clean, expected* outcome — a file
> that is empty or fails to decode, a recipe whose anchors are not unique,
> a size mismatch. It is not an exception in the "something broke" sense;
> clients should treat it as a normal business answer.

## `list_methods` output shape

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
for m in catalogue["methods"]:
    print(m["name"], m["kind"], m["input_schema"])
```

Each entry looks like:

```json
{
  "name": "identify",
  "kind": "command",
  "description": "Identify an ECU binary — manufacturer, family, confidence, VIN.",
  "input_schema": {
    "path": {"type": "str", "required": true, "description": "Path to the binary."}
  },
  "steps": []
}
```

## See also

- [Reference](reference.md) — the full method catalogue with schemas
- [Workflows](workflows.md) — the declarative `kind="workflow"` pipelines
- [Transport (JSON-RPC)](transport.md) — how errors travel over the wire
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces for humans
