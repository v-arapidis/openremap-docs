---
title: M1.x / M1.8 / M1.55
description: The early Motronic petrol foundations — BMW (M1.x), Volvo (M1.8) and Alfa Romeo (M1.55)
---

# M1.x / M1.8 / M1.55

The earliest Motronic petrol generation, covered by three families:

- **M1.x** — the 32 KB, 68HC11-based BMW ECUs (M1.3 / M1.7).
- **M1.8** — Volvo 960 / 940 / 240 inline-6 petrol (~1989–1995) on a
  **SAB80C515**, i.e. an 8051-family CPU. It does **not** use the reversed-digit
  ident; it carries a structured ASCII ident block instead.
- **M1.55** — a transitional Alfa Romeo family on a Motorola 68K-derivative CPU
  with a 128 KB ROM. M1.55 is a separate extractor in OpenRemap, distinct from
  the ME1.5.5 family — see [ME1.5.5](me155.md).

| | |
|---|---|
| Era | 1987–2002 |
| File sizes | 32 KB (M1.x, M1.8) / 128 KB (M1.55) |
| Variants | M1.3 (BMW ~1987–1993), M1.7 (BMW ~1989–1996), M1.8 (Volvo 960/940/240, ~1989–1995), M1.55 (Alfa Romeo 155/156/GT/Spider — 2.0 TS, 1.8 TS, 2.5 V6, 1994–2002) |
| CPUs | Motorola 68HC11 (M1.3 / M1.7), SAB80C515 — 8051 (M1.8), Motorola 68K-derivative (M1.55) |

## Detection

- **M1.3 / M1.7** — 4-byte HC11 reset-vector magic (`85 0a f0 30`) plus the
  `"0000000M1.3` / `"0000000M1.7` markers and reversed-digit ident.
- **M1.8** — the `"0000000M0.0` family marker, the ASCII `M1.8` string, and a
  structured ident block in the upper 32 KB
  (`E<rev>M18<spaces><digits>M1.8<spaces><revision>`). No reversed-digit
  encoding.
- **M1.55** — 128 KB size gate plus the `b"M1.55"` family descriptor at
  `0x08005` (a Motorola 68K reset-vector area, not the HC11 magic).

**Checksums:** no family profile.

→ [Back to Bosch](index.md)
