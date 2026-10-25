---
title: Folders and test files
description: >-
  Classify a whole folder of dumps, and generate a fake ECU file so you can try
  everything without owning one.
tags: [cli]
status: stable
---

# Folders and test files

## `scan`

**What it is:** classifies every file in a folder — which ECU each one is, or that it
is not one. **By default it only looks; nothing is moved.**

```bash
openremap scan /path/to/my_dumps
```

```
  OpenRemap — Batch ECU Scanner  [dry run — pass --move to sort files]
  4 file(s)  •  38 extractor(s)  •  /path/to/my_dumps

[1/4]  SCANNED    GS20_90C0_64KB.bin     7.9 ms
                └─ extractor: SiemensGS20Extractor  family: GS20  sw: 7557997  [MEDIUM]
[2/4]  SCANNED    GS20_90C0_64KB_mod_showgear.bin     9.8 ms
                └─ extractor: SiemensGS20Extractor  family: GS20  sw: 7557997  [MEDIUM]

  ── Summary ────────────────────────────────────────
  Scanned         4
  SW Missing      0
  Contested       0
  Unknown         0
  Trash           0

  Total: 4  •  0.03s  (dry run — nothing moved)
```

The five groups:

| Group | Meaning |
|---|---|
| `Scanned` | recognised, with a software version |
| `SW Missing` | family recognised, but no software version in the file |
| `Contested` | two extractors claim it — named, not silently picked |
| `Unknown` | nobody recognised it |
| `Trash` | not a readable image |

When you are ready to tidy up, add the flags:

```bash
openremap scan /path/to/my_dumps --move                 # into flat group folders
openremap scan /path/to/my_dumps --move --organize      # into manufacturer/family folders
```

Run it once without them first — the dry run is the safe default for a reason.

## `synth`

**What it is:** writes an ECU-*like* file from nothing, so you can practise without
owning a dump. Deterministic: the same settings always produce the same bytes.

```bash
openremap synth --output demo.bin
```

```
  demo.bin  (synthetic — no OEM data)
  Size              262,144 bytes
  SHA-256           8eb8aa72364239d7f868366910d4c1cd60f437179e7478336bcec7c791759a24
  Sectors           code 0x0-0x10000, calibration 0x10000-0x20000, erased 0x20000-0x30000, …
  Planted maps      1
      map0  8x8 u16 little  data @ 0x10038
  identify reports Unknown for generated files — by design (no manufacturer fingerprints).
```

Useful options: `--size`, `--maps`, `--seed`, `--layout` (sector arrangement),
`--byte-order`.

The last line is the honest part: the generated file carries no manufacturer
fingerprints, so `identify` says `Unknown`. That makes it safe to commit as a test
fixture — and it also means you cannot use it to fake a real ECU.

```bash
openremap identify demo.bin
```

```
  demo.bin
  Unknown ECU — no extractor matched this binary
```

## Where to go next

| You want to… | Go to |
|---|---|
| understand one of the files you just classified | [`identify`](look-at-a-file.md#identify) |
| add support for an ECU that came out `Unknown` | [`contribute`](contribute.md) |
