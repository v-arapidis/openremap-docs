---
title: families
description: The complete list of ECU families OpenRemap supports — era, file sizes, notes, and detailed info for one family.
tags: [families, cli]
status: stable
---

# families

Which ECUs can OpenRemap work with? `families` prints the complete,
up-to-date list of every supported ECU family — with its era, file sizes,
and the cars it covers. It answers the very first question: "is my ECU
supported at all?"

`families` only reads the built-in family catalogue. It never touches a
file.

## When do I need it?

- **Not sure what's supported?** Check the list before hunting for files or
  asking about a specific car.
- **`identify` said `unknown`?** Look the family up here — it may be
  supported under a different name (every alias is in the list).
- **Need the details of one family?** Software format, versions, vehicles —
  use `--family`.

## Try it

```bash
openremap families               # the full list
openremap families --family EDC16   # everything about one family
```

> [!NOTE]
> **Terminal only.** `families` is a CLI helper — there is no
> `openremap.api` method for it.

---

## Usage

```bash
openremap families [OPTIONS]
```

---

## Options

| Option | Short | Description |
|---|---|---|
| `--family NAME` | `-f` | Show expanded detail for one family. Accepts the canonical name or any known alias (e.g. `EDC16`, `ME7`, `mp3.2`, `m3x`, `lh-jetronic`). |
| `--help` | | Show help and exit. |

---

## Examples

```bash
# Print the full table of all supported families
openremap families

# Show detailed information for a specific family
openremap families --family EDC16
openremap families --family ME7
openremap families -f mp3.2
openremap families -f edc3
openremap families -f lh-jetronic
```

---

## Example output

### Full table

`openremap families` prints the families in its **built-in catalogue** — 15
rows, all Bosch. The Siemens, Delphi, Magneti Marelli, Denso and Hitachi
families are recognised by `identify` and `scan` but are not in this catalogue
yet; see [Manufacturers](../manufacturers/index.md) for the full picture.

The notes column is trimmed here to fit the page.

```
  Supported ECU Families

  ─────────────────────────────────────────────────────────────────────────────
  FAMILY                  ERA             SIZE              NOTES
  ─────────────────────────────────────────────────────────────────────────────
  EDC1 / EDC2             1990–1997       32–64 KB          Audi 80 / A6 TDI, BMW 525 TDS, early diesel ROMs.
  EDC 3.x                 1993–2000       128–512 KB        VAG TDI, BMW diesel, Opel diesel bridge generation. …
  EDC15                   1997–2004       512 KB            Two sub-formats: Format A (TSW header) and Format B (C3-fill).
  EDC16                   2003–2008       256 KB / 1 MB / 2 MB   DECAFE magic at fixed offsets. VAG PD TDI, BMW diesel, Opel CDTI.
  EDC17 / MEDC17 / MED17 / ME17   2008–present   2–8 MB    The dominant modern platform. PSA, VAG, BMW, Mercedes — diesel and petrol.
  ME7 / ME7.x             1997–2008       64 KB–1 MB        VAG 1.8T, Porsche, Ferrari, Opel Corsa D. ZZ ident block at 0x10000.
  ME9                     2001–2006       2 MB              VW / Audi 1.8T 20v full flash. Identified by RamLoader anchor.
  MED9 / MED9.x           2002–2008       512 KB–2 MB       VAG FSI and TFSI petrol direct injection.
  M1.x                    1987–1996       32–64 KB          BMW E28/E30/E34/E36, Opel petrol. Header magic or reversed-digit ident.
  M1.55 / M1.5.5          1994–2002       128 KB            Alfa Romeo (M1.55) and Opel Corsa C / Astra G (M1.5.5) petrol.
  M2.x                    1993–1999       32–128 KB         VW/Audi M2.9, Porsche 964 (M2.3), Opel M2.7/M2.8/M2.81.
  M3.x                    1989–1999       32–256 KB         BMW M3.1/M3.3 and PSA/Citroën MP3.2/MP3.x-PSA/MP7.2. Reversed-digit ident.
  M5.x / M3.8x            1997–2004       128–256 KB        VW / Audi 1.8T (AGU, AUM, APX). Overlaps with ME7 era.
  LH-Jetronic             1982–1995       8–64 KB           Volvo, early BMW and Mercedes fuel injection. No 1037 SW.
  Motronic Legacy         various         2–32 KB           DME-3.2, M1.x-early, KE-Jetronic, EZK. No ASCII SW in most variants.
  ─────────────────────────────────────────────────────────────────────────────

  openremap families --family <NAME>   show full detail for one family
  openremap identify <FILE>            identify an ECU binary
```

### Detail view (`--family EDC16`)

```
  EDC16
  ─────────────────────────────────────────────────────────────────────────────

  Era             2003–2008
  File size       256 KB / 1 MB / 2 MB

  Sub-families    EDC16C8
                  EDC16C9
                  EDC16C31
                  EDC16C34
                  EDC16C35
                  EDC16C36
                  EDC16C39
                  EDC16CP33
                  EDC16CP34
                  EDC16CP35
                  EDC16U1
                  EDC16U31

  Identifier      \xDE\xCA\xFE (DECAFE) magic at bank-boundary offsets

  SW format       1037xxxxxx (standard); 1037A50286 (alphanumeric, Opel C9);
                  1039xxxxxx (PSA/Peugeot-Citroën EDC16C34)

  HW in binary    Opel EDC16C9 only — plain ASCII null-terminated in cal area

  Vehicles        Audi A3/A4 1.9 TDI BKC/BKE (VAG PD, EDC16U/C8)
                  BMW 320D/520D/120D 163HP E46/E60/E87 (EDC16C31)
                  BMW X6 30sd (EDC16CP35)
                  Opel Vectra-C / Signum / Astra-H CDTI (EDC16C9)
                  Alfa 147/156 1.9 JTDM (EDC16C8)
                  Alfa 159 2.4 JTDM (EDC16C39)
                  Peugeot 3008 1.6 HDI (EDC16C34, SW prefix 1039)

  Notes           BMW C31/C35 2 MB bins store the family string near the
                  0xC0000 mirror section (~0x0C06F3), not at the end of
                  file. BMW E46 320D early 1 MB layout has
                  active_start=0x20000 (non-standard).

  ─────────────────────────────────────────────────────────────────────────────

  openremap families             show all families
  openremap identify <FILE>      identify an ECU binary
```

---

## Supported family names and aliases

The `--family` option accepts the canonical name or any of the listed aliases
(case-insensitive, dashes and dots are flexible). Only the families in the
built-in catalogue have entries here:

| Canonical name | Accepted aliases |
|---|---|
| EDC1 / EDC2 | `edc1`, `edc2` |
| EDC 3.x | `edc3`, `edc3x`, `edc3.x` |
| EDC15 | `edc15` |
| EDC16 | `edc16` |
| EDC17 / MEDC17 / MED17 / ME17 | `edc17`, `medc17`, `med17`, `me17` |
| ME7 / ME7.x | `me7`, `me7.1`, `me7.5`, `me7.6` |
| ME9 | `me9` |
| MED9 / MED9.x | `med9`, `med9.x` |
| M1.x | `m1x`, `m1.x`, `m1.3`, `m1.7` |
| M1.55 / M1.5.5 | `m1.55`, `m1.5.5`, `m155`, `m1x55` |
| M2.x | `m2x`, `m2.x`, `m2.3`, `m2.7`, `m2.8`, `m2.9` |
| M3.x | `m3x`, `m3.x`, `m3.1`, `m3.3`, `mp3.2`, `mp7.2` |
| M5.x / M3.8x | `m5x`, `m5.x`, `m3.8x`, `m3.8` |
| LH-Jetronic | `lh`, `lh-jetronic`, `lhjetronic` |
| Motronic Legacy | `motronic`, `motronic_legacy`, `motroniclegacy`, `ke-jetronic`, `ezk`, `dme` |

---

## Notes

- `openremap families` lists the **built-in catalogue**, which currently covers
  Bosch (15 rows). It is **not** a list of everything `identify` recognises —
  that registry spans 38 extractors across six manufacturers. See
  [Manufacturers](../manufacturers/index.md) for the complete picture.
- If `identify` reports a binary as `unknown`, the family is not supported yet.
  Own a dump of it? `openremap contribute extractor my.bin --measure-only` tells
  you what the engine makes of the file — no clone and no family name needed.
  See [Contributing](../../CONTRIBUTING.md).
- **Fuzzy lookup:** when `--family` matches no name or alias exactly, the
  five closest names are suggested with scores (rapidfuzz, MIT) — e.g.
  `families --family edc16c` → `EDC16 — 91%, EDC1 / EDC2 — 90%, …`.  The
  exit code stays `1` (the request was not fulfilled); a totally unrelated
  query prints no suggestions.
- For complete technical details on ident formats, file sizes, and binary
  layouts, see the manufacturer reference pages:
  [Bosch](../manufacturers/bosch/index.md) · [Siemens](../manufacturers/siemens/index.md) · [Delphi](../manufacturers/delphi/index.md) · [Marelli](../manufacturers/marelli/index.md).

---

