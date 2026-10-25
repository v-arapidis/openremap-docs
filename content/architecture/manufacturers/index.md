---
title: Coverage
description: >-
  38 extractors across 6 manufacturers — from 1982 Bosch LH-Jetronic to 2020s Bosch
  EDC17 and Denso/Hitachi Subaru units. What OpenRemap recognises, and what happens
  when yours is not on the list.
tags: [manufacturers, coverage, architecture]
status: stable
---

# Coverage

OpenRemap recognises **38 extractors across 6 manufacturers**. Not "some
ECUs" — a specific, documented list, from 1982 to the 2020s, covering the diesels
and petrols that actually show up in workshops and driveways.

| | |
|---|---|
| **6** manufacturers | Bosch, Siemens, Delphi, Magneti Marelli, Denso, Hitachi |
| **38** extractors | each one a documented detection path, not a guess |
| **40+ years** | LH-Jetronic (1982) → EDC17 and Denso/Hitachi Subaru (2020s) |
| **3 CPU architectures decoded natively** | C166/ST10, 8051, MCS-96 — written from scratch, tested against independent oracles |

## Why this is the part that matters

Every other feature depends on it. If the tool cannot tell **which ECU** it is
looking at, it cannot tell you whether a recipe belongs to your file, whether a
checksum should exist, or which tables are plausibly real.

That is why coverage is built the hard way: one extractor per family, each with its
own evidence, tested against real binaries, and each one readable — the detection
logic is not a black box, it is code you can open and disagree with.

## The six

| Manufacturer | Families | Where to look |
|---|---|---|
| **Bosch** | **19** — EDC1/EDC3/EDC15/EDC16/EDC17, ME7/ME9/MED9, M1.x–M5.x, Mono-Motronic, LH/KE-Jetronic and more | [Bosch families](bosch/index.md) · [internals](bosch/internals.md) |
| **Siemens** | **8** — Simtec 56, SIMOS, PPD, SID801/803, EMS2000, MS43, GS20 | [Siemens families](siemens/index.md) · [internals](siemens/internals.md) |
| **Delphi** | **2** — Multec, Multec S | [Delphi families](delphi/index.md) |
| **Magneti Marelli** | **4** — IAW 1AV / 1AP / 4LV, MJD 6JF | [Magneti Marelli families](marelli/index.md) |
| **Denso** | **4** — 68HC16Y5, SH7055, SH7058, EE20 diesel | [Denso families](denso/index.md) |
| **Hitachi** | **1** — SH72546 | [Hitachi families](hitachi/index.md) |

Each manufacturer page lists its families with era, typical file size, the vehicles
they shipped in, and what identifies them. Two manufacturers also have an
**internals** page: how the detection works, what the ident blocks look like, and
what the extractor reads.

## Every family page answers the same four questions

1. **Which cars?** — the vehicles and years this family appeared in.
2. **How big is the file?** — 32 KB to 8 MB, and which sizes are normal.
3. **What is inside?** — the memory layout and where the calibration data lives.
4. **How is it recognised?** — the markers the extractor uses, named.

That last one is unusual, and deliberate: detection you can audit.

## Not on the list?

Two honest paths, and neither one involves sending your file anywhere:

- **[`identify`](../../cli/look-at-a-file.md#identify) it anyway.** Plenty of
  useful work — layout, tables, checksums, VINs — needs no family at all. The tool
  will say `Unknown ECU` rather than invent a family.
- **[Add it](../../cli/contribute.md).** `openremap contribute extractor` measures
  your own dumps for a marker that is stable in your family and absent from the 38
  already supported, then writes the extractor, a test, a report and a **synthetic
  fixture** — your binary never leaves the machine. Adding a family makes the whole
  pipeline work for it: identification, health, maps, recipes, apply.

> [!TIP]
> Families are listed per **manufacturer**, never per car brand — the same Bosch
> EDC17 sits in VAG, BMW, Mercedes and PSA vehicles, and the tool should not care
> what badge is on the bonnet.

## For the curious

How the extractor registry and the evidence system actually work is documented in
[Extractors](../extractors.md): the `BaseManufacturerExtractor` contract, the 14
evidence tags, match keys, and how competing claims are resolved.
