---
title: OpenRemap Documentation
description: The wiki home — the project, installation, the recipe format, the internals, the terminal app, every command, the API, and ECU coverage.
---

# OpenRemap Documentation

OpenRemap is a free, offline toolkit that reads the file inside a car's engine
computer, says what it is, and moves a tune between files without guessing.

**New here?** Read the [project overview](introduction/index.md) — five
minutes, plain words, every term explained. Then follow the
[five-minute path](/cli).

Current release: **0.9.0** ([what changed](project/changelog/index.md)).

---

## Overview

| Document | Description |
|---|---|
| [Project overview](introduction/index.md) | What OpenRemap is — and why an ECU file no longer has to be a black box |
| [Glossary](introduction/glossary.md) | Every term defined once — including the four apply rungs and the rule ids you see in a refusal |
| [Index](introduction/all-pages.md) | Every page in this wiki, grouped and described |
| [License](introduction/license.md) | MIT — what you may do with OpenRemap, and what it does not promise |
| [Disclaimer](introduction/disclaimer.md) | Intended use, right to repair, no warranty, and the professional-review requirement |

## Install

| Document | Description |
|---|---|
| [Install](install/index.md) | The two shapes OpenRemap comes in, what you need, and which install to pick |
| [CLI](install/cli/index.md) | The terminal app — one install, three commands, requirements and troubleshooting |
| [Package](install/cli/package.md) | `uv tool install openremap` or `pip install openremap`, plus update and uninstall |
| [Repo clone](install/cli/clone.md) | Install from source for development: git, uv, Rust toolchain, tests |
| [Harness](harness/index.md) | The complete graphical app — 2D/3D maps, hex view, workflows — coming with 1.0.0 |

## Recipe

| Document | Description |
|---|---|
| [The recipe](recipe/index.md) | The `.remap` file — a written change list, and why that is the heart of the tool |
| [Inside a recipe](recipe/anatomy.md) | Instructions, anchors, contract, fingerprint — field by field |
| [Why it matters](recipe/why.md) | Readable, provable, portable, honest, and not anyone's lock-in |
| [Sharing and copyright](recipe/sharing.md) | A recipe is a diff, not a copy — what you can hand over |
| [Format reference](recipe/schema.md) | The exact 5.0 schema and compatibility policy |

## Architecture

| Document | Description |
|---|---|
| [Architecture](architecture/index.md) | The five layers, the dependency rule, and the invariants the code enforces |
| [Repository map](architecture/packages.md) | Every directory of the engine, the gate, the CLI, the TUI and the Rust crate |
| [Extractors](architecture/extractors.md) | The registry, the base class contract, evidence tags and confidence scoring |
| [Decoders](architecture/decoders.md) | CPU decoders: Rust for C166/8051/MCS-96, capstone for the rest, plus xrefs |
| [Rust engine](architecture/rust-engine.md) | The native extension, its modules, the GIL release, rebuilding |
| [API gate](architecture/api-gate.md) | Registry, input schemas, composites, JSON-RPC transport, workflows |
| [Services](architecture/services.md) | The engine's domains and the recipe/apply pipeline |
| [The stack](architecture/stack.md) | Python, Rust, maturin, every runtime library and why it is there |
| [Testing & CI](architecture/testing.md) | Test suites, the three corpora, parity goldens, CI jobs |
| [Coverage](architecture/manufacturers/index.md) | 6 manufacturers, 38 extractors, one page per family |

## TUI

| Document | Description |
|---|---|
| [TUI](tui/index.md) | The full-screen terminal app — eleven screens, one decision each |
| [BOOT](tui/boot.md) | Five real startup checks, timed, with a repair panel when one fails |
| [HOME](tui/home.md) | Eight task cards, recent files, and the engine status line |
| [IDENTIFY](tui/identify.md) | What the file is: family, variant, software version, confidence |
| [INSPECT](tui/inspect.md) | Health, layout, checksums and coherence — with the failing check named |
| [MAPS](tui/maps.md) | The table list, measured facts, and the SVG picture |
| [COOK](tui/cook.md) | Two files in, one recipe out; the mode follows the pair |
| [DIFF](tui/diff.md) | What changed per table, and the changes no table explains |
| [APPLY](tui/apply.md) | Strict first, then the looser rungs the refusal allows |
| [BATCH](tui/batch.md) | Classify a folder with real progress, organise as a second step |
| [CONTRIBUTE](tui/contribute.md) | Your dumps stay local; the contribution is a fixture |
| [HELP](tui/help.md) | Capabilities read from the registry, plus family reference |
| [PICKER](tui/picker.md) | In-app file choosing, keyboard first, Windows drives included |

## CLI

| Document | Description |
|---|---|
| [CLI](cli/index.md) | The command line — output, exit codes, and every command by task |
| [Getting oriented](cli/getting-oriented.md) | `commands`, `workflow`, `families` |
| [Look at a file](cli/look-at-a-file.md) | `identify`, `analyze`, `health`, `checksum`, `layout`, `scan-vins` |
| [Convert and read code](cli/convert-and-routine.md) | `convert` and `routine` |
| [Maps](cli/maps.md) | `scan-maps`, `diff-maps`, `map-image` |
| [Cook](cli/cook.md) | `cook-strict`, `cook-forced`, `recipe-info`, `merge` |
| [Apply](cli/apply.md) | The four apply commands, and how to read a refusal |
| [Verify](cli/verify.md) | `validate` (before / check / after) and `audit` |
| [Folders and test files](cli/batch-and-fixtures.md) | `scan` a folder, `synth` a practice file |
| [Contribute](cli/contribute.md) | Adding support for an unknown ECU |

## Getting started

| Document | Description |
|---|---|
| [Getting started — home](/introduction) | Who this is for, the five-minute path, command map |
| [About OpenRemap](/introduction) | What the project does, why it is open source, FAQ |
| [Setup](/install) | Install, verify, update, develop, troubleshoot |
| [Quick start](/cli) | The five-minute path — identify, health, scan, cook, apply |
| [CLI reference](/cli) | All commands at a glance with examples |
| [Install guides](/install) | Windows, macOS/Linux, developers |

## Concepts

| Document | Description |
|---|---|
| [How it works](/architecture) | The full pipeline, step by step — identify → health → checksum → cook → apply → audit |
| [Confidence scoring](/architecture/extractors) | How identification confidence tiers, signals, and warnings work |
| [Evidence](/architecture/extractors) | How OpenRemap explains its results — detection tags, signals, labels, provenance |
| [Recipe format](recipe/index.md) | The `.remap` file specification — fields, structure, maps, and what it does not store |
| [Decoders](/architecture/decoders) | The CPU decoders — code references, the detection cascade, the decoder tag |
| [Architecture](/architecture) | How the pieces connect — engine, API gate, CLI, TUI, native core |
| [Tune format (.orst)](/recipe) | Deprecated — kept for reference |

## API

| Document | Description |
|---|---|
| [API — the programmatic surface](api/index.md) | What `openremap.api` is, the three ways to call a method, and the pages of this section |
| [API concepts](api/methods.md) | The method registry, input schemas, the three kinds, error codes |
| [Workflows](api/workflows.md) | Declarative `.toml` pipelines that chain methods |
| [Transport (JSON-RPC)](api/calling.md) | The wire protocol over stdio — call the API from any language |
| [Reference](api/reference.md) | The complete method catalogue |

## Commands

Every command has a plain-English **intro**, a **CLI** reference and an
**API** page — each at its own top-level page (`identify`, `scan-maps`,
`diff-maps`, …). For the full list see the [CLI
reference](/cli) or the [Index](introduction/all-pages.md);
new to the three surfaces? See [CLI, API & RPC](/api).

## Manufacturers

| Manufacturer | Families | Internals |
|---|---|---|
| [Bosch](/architecture/manufacturers/bosch) | 19 extractors — EDC1 through MD1 (incl. ME7.9.x), per-family pages | [Bosch internals](/architecture/manufacturers/bosch/internals) |
| [Siemens](/architecture/manufacturers/siemens) | 8 families — Simtec 56, SIMOS, PPD, SID801/803, EMS2000, MS43, GS20 | [Siemens internals](/architecture/manufacturers/siemens/internals) |
| [Delphi](/architecture/manufacturers/delphi) | 2 families — Multec, Multec S | |
| [Magneti Marelli](/architecture/manufacturers/marelli) | 4 families — IAW 1AV/1AP/4LV, MJD 6JF | |
| [Denso](/architecture/manufacturers/denso) | 4 families — 68HC16Y5, SH7055, SH7058, EE20 diesel | Subaru applications |
| [Hitachi](/architecture/manufacturers/hitachi) | 1 family — SH72546 | Subaru applications |

## Project

| Document | Description |
|---|---|
| [Release notes](project/changelog/index.md) | What's new in recent versions, in user terms — full history on GitHub |
| [Contributing](project/contributing.md) | How to add an extractor, code style, PR process |
| [Third-party credits](project/third-party.md) | Community projects and ground truth behind the checksums |
