---
title: Look at a file
description: >-
  Six commands that answer questions about one file — what it is, whether it is
  healthy, its check numbers, its layout, and any VIN inside it.
tags: [cli]
status: stable
---

# Look at a file

Nothing on this page writes anything. Every command here only reads.

## `identify`

**What it is:** tells you the maker, the ECU family, the exact variant and the
software version inside the file.

```bash
openremap identify original.bin
```

```
  original.bin
  Bosch · EDC17

  Container         raw binary
  Manufacturer      Bosch
  ECU Family        EDC17
  ECU Variant       EDC17C66
  Software Version  1037541778126241V0
  Match Key         EDC17C66::1037541778126241V0
  File Size         4,194,304 bytes
  SHA-256           00f727e8abf62d384acc4420b08fe8e5477f9d004c8d3a697bbaaa08fe2149f5

  ── Confidence ─────────────────────────────────────
  Tier   MEDIUM
  Signal  +  detection evidence (2 tags: EXCLUSION_CLEAR, DETECTION_SIGNATURE)
  Signal  +  canonical SW version
```

**Read the `Match Key` line.** Two files with the same match key are the same
software — that is what decides whether a recipe may be applied to another car.

If the file is not recognised it says `Unknown ECU — no extractor matched this
binary`. That is a real answer, not a failure.

## `analyze`

**What it is:** everything about one file in one pass — identity, VIN, layout,
maps, checksums and a health verdict.

```bash
openremap analyze original.bin
```

```
  raw binary  •  4,194,304 bytes  •  00f727e8abf62d38…

  ── Identity ──────────────────────────────
  Bosch · EDC17
  Match Key          EDC17C66::1037541778126241V0

  ── Flash layout ──────────────────────────
  mixed         0x000000-0x020000     131,072 B
  calibration   0x020000-0x040000     131,072 B  42 tables
  code          0x040000-0x0D0000     589,824 B
  …

  ── Maps ──────────────────────────────────
  15,967 axis(es)  •  2,632 table(s)
    0x225712  16x16  2-byte cells  score 0.97
```

(Trimmed.) Use this when you only want to run **one** command on a new file.

## `health`

**What it is:** six checks and one verdict — is this file sane?

```bash
openremap health original.bin
```

```
  OpenRemap — Calibration Health
  original.bin  •  4,194,304 bytes  •  EDC17  •  HEALTHY

  identity      OK    Bosch EDC17
  checksums     SKIP  no known checksum scheme detected
  axis sanity   WARN  96 suspicious axis(es) across 344 table(s)
      0x288B3E X axis max 30000 (implausibly large)
  map count     OK    344 high-score table(s), envelope [188, 1044]
  erased blocks WARN  2 large erased region(s) embedded in data
  VINs          SKIP  no high-confidence VIN candidates
```

(Trimmed.) The important word is **`SKIP`**: it means "I have no way to check
this", which is not the same as "fine".

## `checksum`

**What it is:** which checksum schemes the file satisfies — and it never fixes
them.

```bash
openremap checksum original.bin
```

```
  OpenRemap — Checksum Detection
  original.bin  •  4,194,304 bytes  •  0 known family scheme(s)  •  0 generic match(es)
```

A modern Bosch diesel gives exactly that: no known scheme, so nothing was checked.
On a family the tool does know, it names the profile and the score:

```bash
openremap checksum GS20_90C0_64KB.bin
```

```
  GS20_90C0_64KB.bin  •  65,536 bytes  •  1 known family scheme(s)

  IronFelix family profiles
  ─────────────────────────────────────────────────────────
  Siemens GS20 TCU (64 KB data)      1/1 checks ok
```

## `layout`

**What it is:** how the file is organised — where the program is, where the tables
are, what is empty.

```bash
openremap layout original.bin
```

```
  original.bin  •  4,194,304 bytes  •  17 region(s)  •  74 ident block(s)

     Start       End       Size          Kind    Ent   Tbls   Conf
  0x000000  0x020000   131,072         mixed   5.54      0   0.30
  0x020000  0x040000   131,072   calibration   4.56     42   0.92
  0x040000  0x0D0000   589,824          code   6.56      0   0.70
  0x210000  0x220000    65,536        erased   0.04      0   0.95
  0x220000  0x290000   458,752   calibration   5.58    267   0.95
```

(Trimmed to five of 17 regions.) `Tbls` tells you how many tuning tables sit in
that region — the calibration regions are where tuning happens.

## `scan-vins`

**What it is:** looks for vehicle ID numbers (VINs) inside the file.

```bash
openremap scan-vins original.bin
```

```
  original.bin  •  4,194,304 bytes  •  0 candidate(s) ≥ 0.4

  No VIN candidates found at this confidence level.
```

A candidate is only called a VIN when its own check digit passes; otherwise it is
reported as a candidate with a confidence, never as a registration.

To be less strict, lower the threshold with `--min-confidence 0.3`.

## Where to go next

| You want to… | Go to |
|---|---|
| see the tables inside the file | [`scan-maps`](maps.md#scan-maps) |
| read the code at an address | [`routine`](convert-and-routine.md#routine) |
| turn a HEX file into a binary | [`convert`](convert-and-routine.md#convert) |
