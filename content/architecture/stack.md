---
title: The stack
description: >-
  What OpenRemap is built from and why — Python and Rust, maturin, the runtime
  libraries and what each one is for, plus the community work behind the
  algorithms.
tags: [architecture, internals, dependencies]
status: stable
---

# The stack

Two languages, one build system, and a deliberately short dependency list. Every
library below has to justify itself: this package is installed on other people's
machines, ships as a wheel, and works offline.

## Languages and versions

| | |
|---|---|
| **Python** | `>=3.10`, tested on 3.10 through 3.14 |
| **Rust** | edition 2021, one crate, `crate-type = ["cdylib"]` |
| **Build backend** | `maturin` (PEP 517) — Python metadata and the Rust extension in one wheel |
| **Lockfiles** | `uv.lock` for Python, `Cargo.lock` for Rust (from the crate) |

The Python side is where every decision lives. The Rust side computes. There is no
third language, no build script language, and no code generation outside the
contribution wizard.

## Runtime dependencies

| Library | Used in | Why it is there |
|---|---|---|
| **`typer`** ≥0.15 | 29 modules, all of `cli/` | the command surface: one decorator per command, `--help` for free. Requires `click` |
| **`textual`** ≥0.80 | 17 modules, all of `tui/` | the full-screen app: screens, widgets, the CSS-like `theme.tcss`. Brings `rich` for renderables |
| **`capstone`** ≥5.0.9 | 5 modules, `core/arch/` | disassembly for TriCore, SuperH, M680X, 68K, PowerPC and x86 — the CPUs nobody wants to decode by hand twice |
| **`orjson`** ≥3.10 | 4 CLI commands | fast JSON *reading* of recipe files (`audit`, `merge`, `validate`, `diff-maps`); the recipe is large and parsed often |
| **`bincopy`** ≥20 | `core/services/convert.py` | Intel HEX and Motorola S-Record parsing, with addresses and per-line checksums validated |
| **`vininfo`** ≥1.11 | `core/services/vin_decode.py` | VIN structure and the manufacturer (WMI) lookup, from a community database |
| **`rapidfuzz`** ≥3.14 | `cli/commands/families.py` | fuzzy family lookup, so `--family "edc 17"` finds EDC17 instead of failing |
| **`tomllib`** / **`tomli`** | workflows | reading the declarative `.toml` workflow definitions; `tomli` is the shim on Python 3.10 |

Two notes worth recording, because they are the kind of thing that rots silently:

- **`rarfile` is declared in `pyproject.toml` but imported nowhere** in the package
  at 0.9.0. It is a leftover; it can be dropped from the dependency list.
- **`orjson` is only used for reading.** Writing goes through the standard
  `json` module, because the recipe's field order and formatting are part of the
  format's readability.

## Native dependencies

| Crate | Why |
|---|---|
| **`pyo3`** 0.29 (`abi3-py310`, `extension-module`) | the Python binding; `abi3` means one wheel covers 3.10+ |
| **`memchr`** 2 | fast byte-pattern scanning — the inner loop of every extractor helper |

Nothing else. No `numpy`, no `pandas`, no BLAS: a dump is a byte string, and every
algorithm here is a scan over bytes.

## Development and release tooling

| Tool | Role |
|---|---|
| **`uv`** | environment, dependency resolution, `uv.lock`, `uv tool install` for users |
| **`pytest`** ≥8.3, **`pytest-cov`** ≥6 | the suite (133 test modules) |
| **`maturin`** ≥1.8,<2 | building and publishing the extension; `maturin develop --release` during development |
| **GitHub Actions** | `ci.yml` (test matrix + portability) and `release.yml` (wheels + PyPI) |

## The community work underneath

Several algorithms are **ports, not inventions**, and the project treats that
distinction as a first-class rule: the port is written from the published
behaviour, credited by name, and never copy-pasted. The full list is in
[third-party credits](../project/third-party.md); the short version:

- **Checksum schemes** — IronFelix and NefMoto for the Bosch/Continental work,
  the community MS43 and Denso Subaru material, each with its own module named
  after its source.
- **Decoder ground truth** — Ghidra's SLEIGH specification (C166), the `at51`
  disassembler (8051), and MAME's opcode tables (MCS-96). These are used as
  *oracles to test against*, not as code.
- **Structural knowledge** — forum and thesis material on flash layouts, ident
  blocks and part-number formats, used to know where to look rather than to assert
  a fact.

## What is deliberately not in the stack

| Absent | Because |
|---|---|
| an HTTP client | the tool is offline; there is nothing to fetch at run time |
| a telemetry or crash-reporting SDK | no data leaves the machine |
| a database | state is a few files in the workspace, plus `.state.json` for the recent list |
| a GUI toolkit in the wheel | the terminal app draws with textual; the Harness (1.0.0) is a separate application |
| a vendored disassembler | capstone covers six CPUs; the three it cannot do are written in Rust and tested against an oracle |
