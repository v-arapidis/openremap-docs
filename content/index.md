---
title: OpenRemap Documentation
description: The wiki home — getting started, concepts, every command (simple + advanced), and manufacturers.
---

# OpenRemap Documentation

Welcome to the OpenRemap wiki. Start at [Getting started](getting-started/index.md),
then follow the [five-minute path](getting-started/quickstart.md).

---

## Getting started

| Document | Description |
|---|---|
| [Getting started — home](getting-started/index.md) | Who this is for, the five-minute path, command map |
| [About OpenRemap](getting-started/about.md) | What the project does, why it is open source, FAQ |
| [Setup](getting-started/setup.md) | Install, verify, update, develop, troubleshoot |
| [Quick start](getting-started/quickstart.md) | The five-minute path — identify, health, scan, cook, tune |
| [CLI reference](getting-started/cli.md) | All commands at a glance with examples |
| [Interactive TUI](getting-started/tui.md) | The graphical terminal interface — panels, shortcuts, file dialogs |
| [Install guides](getting-started/install/index.md) | Windows, macOS/Linux, developers |

## Concepts

| Document | Description |
|---|---|
| [How it works](concepts/how-it-works.md) | The full pipeline, step by step — identify → health → checksum → cook → merge → tune → validate → audit |
| [Confidence scoring](concepts/confidence.md) | How identification confidence tiers, signals, and warnings work |
| [Evidence](concepts/evidence.md) | How OpenRemap explains its results — detection tags, signals, labels, provenance |
| [Recipe format](concepts/recipe-format.md) | The `.remap` file spec (schema 4.4) — fields, structure, maps layer |
| [Decoders](concepts/decoders.md) | The CPU decoders — code references, the detection cascade, the decoder tag |
| [Architecture](concepts/architecture.md) | How the pieces connect — domains, extractor registry, Rust core |
| [Tune format (.orst)](concepts/orst-format.md) | Deprecated — kept for reference |

## Commands

Every command has a **simple** page and an **advanced** reference. See the
[commands overview](commands/index.md) for the full table.

## Manufacturers

| Manufacturer | Families | Internals |
|---|---|---|
| [Bosch](manufacturers/bosch/index.md) | 18 extractors — EDC1 through MD1, per-family pages | [Bosch internals](manufacturers/bosch/internals.md) |
| [Siemens](manufacturers/siemens/index.md) | 7 families — Simtec 56, SIMOS, PPD, SID801/803, EMS2000, MS43 | [Siemens internals](manufacturers/siemens/internals.md) |
| [Delphi](manufacturers/delphi/index.md) | 2 families — Multec, Multec S | |
| [Magneti Marelli](manufacturers/marelli/index.md) | 4 families — IAW 1AV/1AP/4LV, MJD 6JF | |
| [Denso](manufacturers/denso/index.md) | 4 families — SH7055, SH7058, SH72531, EE20 diesel | Subaru applications |
| [Hitachi](manufacturers/hitachi/index.md) | 1 family — SH72546 | Subaru applications |

## Project

| Document | Description |
|---|---|
| [Contributing](../CONTRIBUTING.md) | How to add an extractor, code style, PR process |
| [Changelog](../CHANGELOG.md) | Version history |
| [Disclaimer](../DISCLAIMER.md) | Legal, safety, and intended use |
| [Third-party credits](../THIRD_PARTY.md) | Community projects and ground truth behind the checksums |
| [License](../LICENSE) | MIT License |
