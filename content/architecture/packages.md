---
title: Repository map
description: >-
  Every directory of openremap-core and what belongs in it — engine services,
  extractors, decoders, the API gate, the CLI, the TUI and the Rust crate.
tags: [architecture, internals, developer]
status: stable
---

# Repository map

One package, `openremap/`, plus the things that support it. The layout is the
architecture: if a file is in the wrong folder, the dependency rule on the
[overview page](index.md) is what it breaks.

```
openremap-core/
├── openremap/
│   ├── cli/                  the terminal commands (a consumer)
│   ├── tui/                  the full-screen app (a consumer)
│   ├── api/                  the gate: registry, commands, composites, transport
│   ├── core/                 the engine — no UI, no printing
│   ├── _rs/                  the Rust crate (built with maturin)
│   ├── _rust.abi3.so         the built extension (imported as openremap._rust)
│   └── console.py            force_utf8() — Windows stream encoding
├── tests/                    the suite (133 test modules)
├── docs/internal/            dated audits and design specs (not the wiki)
├── contributing/             per-domain contributor guides
├── changelog/                one file per release
├── _dev/                     corpora, benchmarks, oracle data (not shipped)
├── pyproject.toml            package + maturin build configuration
└── .github/workflows/        ci.yml, release.yml
```

## The engine — `openremap/core/`

| Path | Responsibility |
|---|---|
| `services/identify/` | the identification pipeline: `identify_binary()` → `identify_ecu()` → identity dict; `confidence.py` scores it; VIN scanning and reporting |
| `services/maps/` | map discovery and tooling: `scan_maps`, `map_hunter` (Rust-backed), `layout`, `diff_maps`, `map_classifier` (probabilistic labels), `map_exporter` (CSV), `map_svg` (pictures), `table_grid`, `xrefs` / `xrefs_v2` (code references) |
| `services/checksums/` | scheme detection: `checksum`, `ironfelix`, `nefmoto`, `ms43`, `denso`, and `report` for the verdict shape |
| `services/recipes/` | the recipe lifecycle: `recipe_builder`, `annotator`, `recipe_regions`, `recipe_maps`, `patcher`, `validate*` (before / check / after / strict), `audit`, `recipe_merge`, `recipe_facts`, `recipe_info`, `volatile` (legacy 4.x reading) |
| `services/recipes/produce/` | the schema-5.0 producers: `builder`, `modes` (strict / forced), `contract`, `report` |
| `services/recipes/apply/` | the apply ladder: `contract` (reader + A-rules), `policy` (identity), `engine` (the four rule sets), `report` |
| `services/wizard/` | the contribution path: `plan`, `fields`, `signatures`, `collisions`, `fixtures`, `emit`, `verify`, `check`, `report` |
| `services/` (top level) | `analyze`, `health`, `coherence`, `convert`, `entropy`, `vin_decode`, `scan_organize` |
| `manufacturers/` | `base.py` (the extractor contract), one package per OEM, `scan.py` (batch classification), `families.py` (the family reference — moved here from the CLI in 0.9.0) |
| `arch/` | CPU decoders and disassembly helpers: `c166`, `mcs51`, `mcs96`, `motorola`, `ppc`, `detect` (the cascade), `pseudocode`, `bytes_io` |
| `synth/` | `generator.py` — deterministic synthetic dumps |

Two rules live in this tree and are worth knowing before adding code:

- **Services own policy and file I/O.** "Which files a scan covers", "where a
  classified file would be filed", "what this refusal means" are service facts,
  not UI facts.
- **Extractors are data plus two methods.** A new ECU family is a new module under
  `manufacturers/<oem>/`, registered in that package's `EXTRACTORS` list. See
  [extractors](extractors.md).

## The gate — `openremap/api/`

| Path | Responsibility |
|---|---|
| `registry.py` | `register()`, `list_methods()`, `dispatch()`, and the input-schema contract (defaults + validation live here) |
| `commands/` | one module per atomic method — path I/O and error translation, nothing else |
| `composite/` | one module per multi-step decision: `analyze`, `health`, `diff_maps`, `cook_strict`, `cook_forced`, `apply_strict`, `apply_shift`, `apply_unique`, `apply_any` |
| `workflows/` | the declarative `.toml` workflow definitions (`identify_cook`) |
| `transport/` | `stdio.py` + `jsonrpc.py` — JSON-RPC 2.0 over stdin/stdout |
| `errors.py` | `ApiError` and the four JSON-RPC codes (`-32600`…`-32603`) |
| `_io.py`, `serialize.py` | loading binaries from a path; making results JSON-safe |

## The consumers — `openremap/cli/` and `openremap/tui/`

| Path | Responsibility |
|---|---|
| `cli/main.py` | the typer app: one registration per command, and the dispatcher that launches the TUI when there are no arguments |
| `cli/commands/` | one module per command (`identify.py`, `tune_any.py`, `map_image.py`, …) |
| `cli/io.py` | console output helpers shared by the commands |
| `tui/app.py` | the textual `App`: screen stack, `q` to quit |
| `tui/screens/` | one module per screen: `boot`, `home`, `identify`, `inspect`, `maps`, `cook`, `diff`, `apply`, `batch`, `contribute`, `help`, plus `picker` and `recipe` overlays |
| `tui/widgets/` | `card`, `activity`, `prompt` |
| `tui/state.py`, `tui/paths.py` | the recent-files JSON file and the workspace directories |
| `tui/theme.tcss` | the stylesheet |

The CLI package moved back to the top level in 0.9.0 (it had lived inside
`core/cli/` since 0.7.3). The reasoning is the rule above: the CLI is a consumer,
so it sits beside `api/`, not inside the engine.

## Where new code goes

| You are adding… | It belongs in |
|---|---|
| support for a new ECU family | `core/manufacturers/<oem>/<family>.py` + that package's `EXTRACTORS` |
| a new CPU decoder | `_rs/src/arch/` (Rust) or `core/arch/` (Python), plus a row in `detect.py`'s cascade |
| a hot loop | `_rs/src/`, exposed through a thin Python shim |
| a new operation | `core/services/<domain>/`, then an API method in `api/commands/` |
| a multi-step decision that must return *one* report | `api/composite/` |
| a terminal command | `cli/commands/` — registration only |
| a screen | `tui/screens/` — it calls API methods, never the engine |

Design specs for the recipe format and the apply rules are kept next to the code
in `docs/internal/spec/`; they are dated, and they are not part of the published
wiki.
