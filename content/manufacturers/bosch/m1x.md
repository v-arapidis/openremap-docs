---
title: M1.x & M1.55
description: The early Motronic petrol foundations — BMW (M1.x) and Alfa Romeo (M1.55)
---

# M1.x & M1.55

The earliest Motronic petrol generation. **M1.x** covers the 32 KB,
68HC11-based BMW ECUs (M1.3 / M1.7); **M1.55** is a transitional Alfa
Romeo family on a Motorola 68K-derivative CPU with a 128 KB ROM. M1.55 is
a separate extractor in OpenRemap, distinct from the ME1.5.5 family —
see [ME1.5.5](me155.md).

| | |
|---|---|
| Era | 1987–2002 |
| File sizes | 32 KB (M1.x) / 128 KB (M1.55) |
| Variants | M1.3 (BMW ~1987–1993), M1.7 (BMW ~1989–1996), M1.55 (Alfa Romeo 155/156/GT/Spider — 2.0 TS, 1.8 TS, 2.5 V6, 1994–2002) |
| CPUs | Motorola 68HC11 (M1.x), Motorola 68K-derivative (M1.55) |

## Detection

M1.x: 4-byte HC11 reset-vector magic (`85 0a f0 30`) plus the
`"0000000M1.3` / `"0000000M1.7` markers and reversed-digit ident. M1.55:
128 KB size gate plus the `b"M1.55"` family descriptor at 0x08005 (a
Motorola 68K reset-vector area, not the HC11 magic).

**Checksums:** no family profile.

→ [Back to Bosch](index.md)
