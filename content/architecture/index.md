---
title: Architecture
description: >-
  How the OpenRemap codebase is put together — the five layers, what each one may
  import, and the rules that keep one safety core.
tags: [architecture, internals, developer]
status: stable
---

# Architecture

OpenRemap is **one Python package** with a **Rust extension** inside it. Everything
else is organisation: presentation in one place, a single API gate in another, and
an engine that no user interface is allowed to bypass.

| Measured at 0.9.0 | Files | Lines |
|---|---|---|
| `openremap/core/` — the engine | 192 | ~41 900 |
| `openremap/cli/` — the terminal commands | 31 | ~7 800 |
| `openremap/tui/` — the full-screen app | 23 | ~6 100 |
| `openremap/api/` — the gate, composites, transport | 39 | ~2 900 |
| `openremap/_rs/` — the Rust crate | 18 | ~3 200 |

## The five layers

| Layer | Package | May import | Never does |
|---|---|---|---|
| **Presentation** | `openremap/cli/`, `openremap/tui/` | the API gate, and formatting helpers | hold domain policy, do file classification rules, or reach into the engine's internals |
| **Gate** | `openremap/api/` | `core/` | know about terminals, typer or textual |
| **Engine** | `openremap/core/` | itself, and the Rust extension | import a UI, or print anything |
| **Native** | `openremap/_rs/` (imported as `openremap._rust`) | nothing — pure compute | do I/O, or know what a recipe *means* |
| **Data** | `content/` in the wiki repo, `docs/internal/` here | — | — |

Three consequences, all deliberate:

1. **There is one API gate.** The TUI does not call engine functions directly — it
   calls API methods, the same ones `openremap-api` serves over JSON-RPC. A screen
   cannot implement a rule the CLI does not have, because neither implements rules.
2. **Presentation modules hold no policy.** Two 0.9.0 changes were exactly this:
   the 350-line family table moved out of `cli/commands/families.py` into
   `core/manufacturers/families.py`, and the scan's file rules (what to scan, what
   to skip, where a file would be filed, the copy/move itself) moved into
   `core/services/scan_organize.py`. The CLI and the TUI now share one answer.
3. **The engine never prints.** It returns dictionaries. Formatting (progress
   bars, tables, colours, `✓`/`⚠`) lives in the layer that owns the terminal, which
   is why the same method can be a CLI table, a TUI screen and a JSON-RPC response.

## How a request travels

```
openremap identify x.bin                    (CLI, typer)
openremap → IDENTIFY screen                 (TUI, textual)
{"method":"identify"}                       (JSON-RPC over stdio)
        │
        ▼
openremap.api.registry.dispatch("identify", params)
        │   defaults + type checks from the method's own input_schema
        ▼
openremap.api.commands.identify  ── path I/O, error translation
        │
        ▼
openremap.core.services.identify.identify_binary(bytes, filename, container)
        │
        ├── openremap.core.manufacturers.scan / identifier   (Python: which extractor?)
        └── openremap._rust.*                                (Rust: entropy, CRC, map scan)
```

Every step returns plain data. The refusal you see at the top (`✗ REFUSED at Γ4`)
was raised as an `ApplyRefused(check="Γ4")` five layers below and travelled up
unchanged.

## Invariants the codebase enforces

| Invariant | Where it is enforced |
|---|---|
| **One safety core.** The apply engine *composes* the existing validator, patcher and post-validator; it does not reimplement them. | `core/services/recipes/apply/engine.py` |
| **No checksum correction, ever.** Checksums are detected and reported (`ok`/`fail`/`skip`); no code path writes a checksum. | `core/services/checksums/`, `health.check_checksums` |
| **No checksum data in a recipe.** A stored region that was wrong would silently drop tune bytes. | `recipes/apply/contract.py` refuses unknown fields |
| **Deterministic output.** Same input, same bytes — including the synthetic generator. | `core/synth/generator.py`, `recipes/` |
| **Offline.** No network call exists in the package. | checked by the absence of an HTTP client in the dependency list |
| **Expected refusals are not errors.** A refusal carries a rule id and exit code 1; an exception is a bug. | `ApplyRefused`, `GuardError` |

## The pages in this section

| Page | What it documents |
|---|---|
| [Repository map](packages.md) | every directory and what belongs in it |
| [Extractors](extractors.md) | the registry, the base class, evidence tags, confidence scoring |
| [Decoders](decoders.md) | the CPU decoders and the code-reference signal |
| [Rust engine](rust-engine.md) | what is native, why, and how the GIL is released |
| [API gate](api-gate.md) | the method registry, composites, JSON-RPC, workflows |
| [Services](services.md) | the engine's service modules, recipe by recipe |
| [The stack](stack.md) | languages, build system, every library and why it is there |
| [Testing & CI](testing.md) | the suites, the corpora, and what runs where |
