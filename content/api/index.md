---
title: API
description: The openremap.api programmatic surface — what a method is, the three ways to call one (in-process, direct, JSON-RPC), and the pages of this section.
tags: [api]
status: stable
---

# API — drive OpenRemap from code

`openremap.api` is the **programmatic face of OpenRemap**: the library that
other programs use to do everything the terminal commands do — identify a
file, scan a folder, cook a recipe, apply a tune — without ever touching a
terminal.

Everything in this section is for **developers**. If you are here to tune a
car with the terminal, the [getting-started guide](../getting-started/index.md)
is the better place to start.

## Where the API sits

OpenRemap is built in layers, and the API is the seam in the middle:

| Layer | What it is |
|---|---|
| `openremap.core.*` | The engine — extractors, services (identify, maps, checksums, recipes), the Rust core |
| **`openremap.api.*`** | The **canonical public surface** — a *registry* of methods with typed input schemas |
| Consumers | The CLI, the TUI, and future apps (Studio, Harness) — all shells over the same engine |

The point of the middle layer: the CLI and a GUI never re-implement rules.
Defaults and validation live **once**, in each method's schema, and every
consumer reads them from the registry.

## What a method is

A **method** is one action the engine knows how to do — `identify`, `cook`,
`tune`, `scan`, … You call a method **by name** with a dict of parameters;
it returns a plain, JSON-safe dict (never a Python object you have to
serialise yourself).

Each method is registered in the **registry** together with metadata:

- its `kind` — `command` (atomic), `composite` (orchestrated), or `workflow`
  (a declarative pipeline),
- a `description`,
- an `input_schema` — every parameter: its type, whether it is required,
  its default, and numeric bounds.

Schema rules, kinds and errors are explained on the
[concepts page](concepts.md); the complete list of methods is the
[reference](reference.md).

## Three ways in, one path out

The API deliberately offers **three ways to call the same methods**, all
backed by one dispatch path — so results are identical no matter how you
call:

```python
import openremap.api as api

api.call("identify", {"path": "stock.bin"})   # 1. in-process dispatch
api.ping()                                     # 2. ergonomic direct function
#                                              # 3. JSON-RPC over stdio:
#  python -m openremap.api.transport.stdio     #    {"method": "identify", ...}
```

Every result returned by `call` is JSON-serialisable, so the in-process
result and the RPC result are equivalent. In short:

> **Three ways in, one path out.**

### The same call on each surface

`ping` — the liveness check — on all three:

```python
import openremap.api as api
print(api.call("ping", {}))   # → {"ok": True}
print(api.ping())             # → {"ok": True}
```

```bash
# JSON-RPC: pipe one request line, read one response line
echo '{"id": 1, "method": "ping", "params": {}}' \
  | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

And a real method, `identify`, is worked through end-to-end on its own page:
[identify — API](../identify/api.md) (in-process + JSON-RPC + error codes).

## Pages in this section

| Page | What it covers |
|---|---|
| [API concepts](concepts.md) | The registry, input-schema contract, the three kinds (`command`/`composite`/`workflow`), errors and their codes |
| [Workflows](workflows.md) | Declarative `.toml` pipelines that chain methods with `$input.*` plumbing |
| [Transport (JSON-RPC)](transport.md) | The wire protocol, how to run the stdio server, exact request/response/error lines |
| [Reference](reference.md) | The complete method catalogue, grouped by kind, with schemas |

## Not the terminal guide

Careful with the word *workflow*: the API-side **workflow** is a declarative
`.toml` pipeline (documented [here](workflows.md)) — it is **not** the CLI
command `openremap workflow`, which just *prints* a step-by-step guide in
your terminal ([getting-started/workflow](../getting-started/workflow.md)).
The two share only a name.

## Where to go next

| You want to… | Go to |
|---|---|
| Understand registry, kinds and error codes | [API concepts](concepts.md) |
| Write a declarative multi-step pipeline | [Workflows](workflows.md) |
| Call the API from another language over stdio | [Transport (JSON-RPC)](transport.md) |
| See every method and its parameters | [Reference](reference.md) |
| A worked single-method example | [`identify` — API](../identify/api.md) or [`scan` — API](../scan/api.md) |
| The three surfaces explained for humans | [CLI, API & RPC](../getting-started/interfaces.md) |
