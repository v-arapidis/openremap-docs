---
title: Index
description: >-
  Every page on this wiki in one place — grouped by section, with a one-line
  description of each, plus a way in when you only know what you want to do.
tags: [index, reference, navigation]
status: stable
---

# Index

Every page in this wiki, in one list. Start with the [project
overview](index.md) if you are new, or jump from the task table below if you
already know what you are looking for.

---

## How this wiki is organised

Each topic is written in up to three layers, so you can stop reading when you
have what you need:

| Layer | Where it is | Written for |
|---|---|---|
| **What it is and why** | the section's `index` page | someone who has never done this before — plain words, no jargon, a scenario |
| **How to actually run it** | `cli.md` | real commands, real output, every flag, what to do when it fails |
| **Exact technical detail** | `api.md` | field names, schemas, protocols, method signatures |

Two conventions worth knowing:

- **Every term is defined where it first appears**, and all of them together in
  the [glossary](glossary.md).
- **A page that is not fully current says so** — an amber banner at the top of
  the page, from its frontmatter `status`. `stable` means "checked against the
  current release"; `outdated`, `stub` and `needs-expansion` mean exactly what
  they say.

---

## Start from what you want to do

| I want to… | Go to |
|---|---|
| understand what this tool is | [Project overview](index.md) |
| look up a word I saw | [Glossary](glossary.md) |
| install it and run something | [Install](/install) |
| know what a file from my car is | [identify](/cli/look-at-a-file#identify) |
| know whether a file is sane | [health](/cli/look-at-a-file#health) · [analyze](/cli/look-at-a-file#analyze) |
| see the tuning tables inside a file | [scan-maps](/cli/maps#scan-maps) |
| know what a tuner changed | [diff-maps](/cli/maps#diff-maps) |
| save a change as a reusable file | [cook](/cli/cook#cook-strict) |
| apply a saved change to another file | [tune](/cli/apply#tune-strict) (being replaced by the apply ladder — see [glossary](glossary.md#5-tune-recipe-and-apply-the-core-vocabulary)) |
| check whether three files belong together | [audit](/cli/verify#audit) |
| add support for an unrecognised ECU | [contribute](/cli/contribute) |
| drive it from my own code | [API](../api/index.md) |
| know if my ECU family is supported | read the legal and safety position | [Disclaimer](disclaimer.md) |

---

## Overview

| Page | What it covers |
|---|---|
| [Project overview](index.md) | What OpenRemap is — and why an ECU file no longer has to be a black box |
| [Glossary](glossary.md) | Every term, defined once, plus the four apply rungs and the rule ids you see in a refusal |
| [Index](all-pages.md) | This page |
| [License](license.md) | MIT — what you may do with OpenRemap, and what it does not promise |
| [Disclaimer](disclaimer.md) | Intended use, right to repair, no warranty, and why a professional must review anything that is flashed |

## Install

| Page | What it covers |
|---|---|
| [Install](../install/index.md) | The two shapes OpenRemap comes in, what you need, and which install to pick |
| [CLI](../install/cli/index.md) | The terminal app — the three commands one install gives you, requirements, troubleshooting |
| [Package](../install/cli/package.md) | Install from PyPI with `uv tool install openremap` or `pip install openremap`, then update or remove it |
| [Repo clone](../install/cli/clone.md) | Install from source — git, uv and a Rust toolchain, the test suite, where things live |
| [Harness](../harness/index.md) | The complete graphical app — 2D/3D maps, hex view, map dragging, workflows — coming with 1.0.0 |

## Recipe

| Page | What it covers |
|---|---|
| [The recipe](../recipe/index.md) | What a `.remap` file is, and why a written change list beats a patched file |
| [Inside a recipe](../recipe/anatomy.md) | Every part, field by field, in plain words |
| [Why it matters](../recipe/why.md) | Readable, provable, portable, honest, no lock-in — and the limits |
| [Sharing and copyright](../recipe/sharing.md) | What a recipe is not, what you can hand over, where the limits are |
| [Format reference](../recipe/schema.md) | The exact 5.0 schema, reader rules and compatibility policy |

## Architecture

| Page | What it covers |
|---|---|
| [Architecture](../architecture/index.md) | The five layers, what each may import, how a request travels, and the invariants |
| [Repository map](../architecture/packages.md) | Every directory, what belongs in it, and where new code goes |
| [Extractors](../architecture/extractors.md) | Registry, base class, evidence tags, match keys, confidence scoring |
| [Decoders](../architecture/decoders.md) | Which CPU is decoded by Rust, which by capstone, the cascade, the limits |
| [Rust engine](../architecture/rust-engine.md) | The crate, its modules, the GIL release, how to rebuild it |
| [API gate](../architecture/api-gate.md) | Method registry, the three kinds, JSON-RPC, workflows |
| [Services](../architecture/services.md) | The engine's service modules, recipe by recipe |
| [The stack](../architecture/stack.md) | Languages, build system, every library and why |
| [Testing & CI](../architecture/testing.md) | The suites, the corpora, parity goldens, what CI runs |
| [Coverage](../architecture/manufacturers/index.md) | All 6 manufacturers and 38 extractors, with a page per family |

## TUI

| Page | What it covers |
|---|---|
| [TUI](../tui/index.md) | The app, its eleven screens, how to move around, and the workspace it writes into |
| [BOOT](../tui/boot.md) | The five startup checks, their real timings, and the repair panel when one fails |
| [HOME](../tui/home.md) | The eight task cards, the recent-files list, and the status line |
| [IDENTIFY](../tui/identify.md) | What a file is — family, variant, software, confidence |
| [INSPECT](../tui/inspect.md) | Health, layout, checksum verdicts and coherence, failing check named |
| [MAPS](../tui/maps.md) | Choosing a calibration table, and the SVG picture of the one you picked |
| [COOK](../tui/cook.md) | Two files in, one 5.0 recipe out — strict first, forced only on refusal |
| [DIFF](../tui/diff.md) | What changed, table by table, plus the regions no table explains |
| [APPLY](../tui/apply.md) | The ladder from the screen: strict first, looser rung offered by rule |
| [BATCH](../tui/batch.md) | Classifying a folder, with real pace, then organising as a second step |
| [CONTRIBUTE](../tui/contribute.md) | Measuring your own dumps and rendering a contribution |
| [HELP](../tui/help.md) | Capabilities generated from the engine's registry, plus the family reference |
| [PICKER](../tui/picker.md) | The in-app file picker: keys, starting folder, Windows drives |

## CLI

| Page | What it covers |
|---|---|
| [CLI](../cli/index.md) | The command line, how output reads, exit codes, and every command by task |
| [Getting oriented](../cli/getting-oriented.md) | `commands`, `workflow`, `families` — the tool describing itself |
| [Look at a file](../cli/look-at-a-file.md) | `identify`, `analyze`, `health`, `checksum`, `layout`, `scan-vins` |
| [Convert and read code](../cli/convert-and-routine.md) | `convert` (HEX → binary) and `routine` (read code at an address) |
| [Maps](../cli/maps.md) | `scan-maps`, `diff-maps`, `map-image` |
| [Cook](../cli/cook.md) | `cook-strict`, `cook-forced`, `recipe-info`, `merge` |
| [Apply](../cli/apply.md) | The ladder: `tune-strict`, `-shift`, `-unique`, `-any`, and how to read a refusal |
| [Verify](../cli/verify.md) | `validate before / check / after`, and `audit` |
| [Folders and test files](../cli/batch-and-fixtures.md) | `scan` a folder, `synth` a practice file |
| [Contribute](../cli/contribute.md) | `contribute extractor` / `check` |

## Getting started

| Page | What it covers |
|---|---|
| [Getting started](/introduction) | Who this is for, the five-minute path, and the command map |
| [About OpenRemap](/introduction) | The gap the project fills, why it is open source, the project aims, and an FAQ |
| [Installation](/install) | Pick your platform — then Windows, macOS/Linux, or a developer setup from source |
| [Installing on Windows](/install/cli/package) | Step by step, written for people who rarely use a terminal |
| [Installing on macOS / Linux](/install/cli/package) | Step by step, per platform |
| [Developer setup](/install/cli/clone) | Running from source, running the tests, building the Rust engine |
| [Setup](/install) | Install, verify, update, develop, troubleshoot — the essential commands for every case |
| [Quick start](/cli) | Install → identify → health-check → cook → apply, in about five minutes |
| [CLI reference](/cli) | Every command with a one-line description and a worked session |
| [`openremap workflow`](/cli/getting-oriented) | The built-in plain-English walkthrough, and what each step of it means |
| [CLI, API & RPC](/api) | The three surfaces side by side, and when to use which |
| [families](/architecture/manufacturers) | The supported-family reference: era, file sizes, notes, and full detail for one family |

## Concepts

| Page | What it covers |
|---|---|
| [Concepts hub](/architecture) | Where to start reading about how the tool thinks |
| [How it works](/architecture) | The whole pipeline end to end — identify → health → checksum → cook → apply → audit |
| [Confidence scoring](/architecture/extractors) | How the confidence tiers are built from signals, and what each tier promises |
| [Evidence](/architecture/extractors) | Detection tags, signals, probabilistic labels, provenance — how a result explains itself |
| [Recipe format](../recipe/index.md) | The `.remap` file specification — fields, structure, maps, and what a recipe deliberately does not store |
| [Decoders](/architecture/decoders) | The CPU decoders, the code-reference signal, and the detection cascade |
| [Architecture](/architecture) | How the pieces connect — engine, API gate, CLI, TUI, and the native core |
| [Tune format (.orst)](/recipe) | The deprecated saved-tune format, kept for reference |

## Commands — look at a file

| Page | What it covers |
|---|---|
| [identify](/cli/look-at-a-file#identify) | What is this file? Manufacturer, family, software version, confidence |
| [analyze](/cli/look-at-a-file#analyze) | One pass that describes everything: identity, VIN, layout, maps, checksums, health |
| [health](/cli/look-at-a-file#health) | Six safety checks in one command, with a healthy / issues verdict |
| [checksum](/cli/look-at-a-file#checksum) | Which checksum schemes a file satisfies — detection only, never correction |
| [layout](/cli/look-at-a-file#layout) | How the file is organised: code, calibration, erased pages, identity blocks |
| [scan-vins](/cli/look-at-a-file#scan-vins) | Find VIN candidates and score how believable each one is |
| [convert](/cli/convert-and-routine#convert) | Turn Intel HEX / S-Record text into flat bytes |
| [routine](/cli/convert-and-routine#routine) | Read the code around an offset as one-line pseudo-code |

## Commands — tables and maps

| Page | What it covers |
|---|---|
| [scan-maps](/cli/maps#scan-maps) | Find the calibration tables in a file without knowing the family |
| [diff-maps](/cli/maps#diff-maps) | Compare two files table by table: which maps moved, and by how much |

## Commands — tune and apply

| Page | What it covers |
|---|---|
| [cook](/cli/cook#cook-strict) | *(documents the retired 4.x `cook`; the current producers are `cook-strict` / `cook-forced`)* — turn a stock and a tuned file into a recipe |
| [cook-volatile](/cli/cook) | *(retired command)* — the 4.x car-portable recipe producer, kept for history |
| [merge](/cli/cook#merge) | Combine two recipes into one, validated against a common stock file |
| [tune](/cli/apply#tune-strict) | *(documents the retired 4.x `tune`; the current apply is the four-rung ladder)* — apply a recipe safely |
| [validate](/cli/verify#validate) | The individual before / check / after steps, run by hand |
| [audit](/cli/verify#audit) | The receipt check: do stock, tuned and recipe belong together? |

## Commands — libraries and contribution

| Page | What it covers |
|---|---|
| [scan](/cli/batch-and-fixtures#scan) | Classify a whole folder of dumps, then optionally file them |
| [synth](/cli/batch-and-fixtures#synth) | Generate an ECU-like file from scratch — no ECU, no dump |
| [contribute](/cli/contribute) | Measure your own dumps and hand over a new ECU family |

## API

| Page | What it covers |
|---|---|
| [API](../api/index.md) | What the programmatic surface is, and the three ways to call a method |
| [API concepts](../api/methods.md) | The method registry, input schemas, the three kinds, error codes |
| [Workflows](../api/workflows.md) | Declarative `.toml` pipelines that chain methods |
| [Transport (JSON-RPC)](../api/calling.md) | The stdio wire protocol — drive the API from any language |
| [Reference](../api/reference.md) | The complete method catalogue |

## Manufacturers

Each OEM has an index page and one page per supported family (era, file size,
what the extractor reads, and notes). Two OEMs also have an internals page for
people writing extractors.

| Page | What it covers |
|---|---|
| [Bosch](/architecture/manufacturers/bosch) | 19 extractors, EDC1 through MD1 — plus [Bosch internals](/architecture/manufacturers/bosch/internals) |
| [Siemens](/architecture/manufacturers/siemens) | Simtec 56, SIMOS, PPD, SID801/803, EMS2000, MS43, GS20 — plus [Siemens internals](/architecture/manufacturers/siemens/internals) |
| [Delphi](/architecture/manufacturers/delphi) | Multec, Multec S |
| [Magneti Marelli](/architecture/manufacturers/marelli) | IAW 1AV / 1AP / 4LV, MJD 6JF |
| [Denso](/architecture/manufacturers/denso) | 68HC16Y5, SH7055, SH7058, EE20 diesel |
| [Hitachi](/architecture/manufacturers/hitachi) | SH72546 |

## Project

| Page | What it covers |
|---|---|
| [Release notes](../project/changelog/index.md) | What changed in recent versions, in user terms |
| [Contributing](../project/contributing.md) | The rules that apply to everything, and how to add an ECU family without sharing your dump |
| [Third-party credits](../project/third-party.md) | The community work the checksum and detection knowledge stands on |

---

> [!NOTE]
> This index mirrors the folder tree, which is also what generates the sidebar —
> so a page that exists is a page that is listed, and a page that is deleted
> leaves this list. When a section is reorganised, this page is rewritten with it.
