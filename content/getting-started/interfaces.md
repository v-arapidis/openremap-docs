---
title: CLI, API & RPC
description: The three ways to drive OpenRemap — the terminal CLI, the in-process Python API, and the JSON-RPC protocol over stdio — and when to use which.
tags: [cli, api, rpc]
status: stable
---

# CLI, API & RPC — the three interfaces

OpenRemap is one engine with **three surfaces**. They are not three different
products: they expose the **same methods, the same input schema, and the same
JSON-safe results** — only the way you reach them differs.

| Surface | Who it is for | What it looks like |
|---|---|---|
| **CLI** | Humans in a terminal, quick scripts | `openremap identify stock.bin` |
| **Python API** | Python programs embedding OpenRemap in-process | `api.call("identify", {"path": "stock.bin"})` |
| **RPC** | Any language/tool talking to OpenRemap as a subprocess | `{"method": "identify", "params": {"path": "stock.bin"}}` over stdio |

The same action, all three ways:

```bash
# 1. CLI — run the command
openremap identify stock.bin

# 2. Python API — call the method in-process
python -c 'import openremap.api as api; print(api.call("identify", {"path": "stock.bin"}))'

# 3. RPC — send a JSON-RPC request to the stdio server
echo '{"id": 1, "method": "identify", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

All three print (or return) the same identification result.

## How they relate

The engine is organised in layers:

- `openremap.core.*` — the internal engine: extractors, services (identify,
  maps, checksums, recipes), the Rust core.
- `openremap.api.*` — the **canonical public surface**: a registry of
  *methods* with typed input schemas. Methods come in three kinds —
  `command` (atomic), `composite` (orchestrated), `workflow` (declarative
  TOML pipeline).
- The **CLI**, the **TUI**, and future apps (Studio, Harness) are shells on
  top: they call the same engine, so behaviour and results never drift
  between surfaces.

One consequence worth remembering: **defaults and validation live in the
method schema, not in the client.** A method that requires `path` rejects a
call without it no matter which surface you used — ask the registry what it
expects via `list_methods`.

## Which one should I use?

| You want to… | Use |
|---|---|
| Try a file quickly, run a one-off job | [CLI](../getting-started/cli.md) |
| Automate a repeatable workflow in a script or CI | CLI (it is scriptable and `--json`-friendly) |
| Build a Python tool or notebook around OpenRemap | Python API |
| Integrate from another language (Rust, Go, C++, …), or a GUI | RPC (JSON-RPC over stdio) |
| Drive the full terminal UI | Run `openremap` with no arguments |

## Wait — "workflow" appears twice

Two unrelated things share the word *workflow*:

1. **`openremap workflow`** — a CLI *command* that prints a plain-English
   step-by-step guide in your terminal. Start here if you are new.
2. **A `workflow` method kind** — a declarative, code-free `.toml` pipeline
   that chains API methods (e.g. identify both binaries, then cook). It has
   nothing to do with the terminal guide.

The API-side workflows (declarative `.toml` pipelines) are documented on the
[API workflows page](../api/workflows.md).

## Where to go next

| Topic | Go to |
|---|---|
| A worked example of one method on all surfaces | [`identify`](../identify/index.md) — with [CLI](../identify/cli.md) and [API](../identify/api.md) pages |
| The full command reference | [Getting started → CLI reference](cli.md) |
| How the engine pieces connect | [Architecture](../concepts/architecture.md) |
