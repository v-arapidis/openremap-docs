---
title: EDC1 / EDC2
description: Early Bosch diesel ECUs
---

# EDC1 / EDC2

The first generation of Bosch diesel ECUs — Audi 80 / A6 TDI, BMW 525 TDS,
1990–1997. EDC2 is a transitional generation sharing the same binary layout.

| | |
|---|---|
| Era | 1990–1997 |
| File sizes | 32 KB or 64 KB (exactly — nothing in between) |
| Vehicles | Audi 80/A6 TDI, BMW 525 TDS |
| Example bins | `8A0907401A`, `4A0907401E/P`, `028906021D` |

## Detection

Three checks:

1. **Size gate** — exactly 32 KB (`0x8000`) or 64 KB (`0x10000`). Every other
   Bosch family works on 128 KB or larger, so this single test rules out most
   unrelated binaries.
2. **Exclusion check** — reject if any modern Bosch family signature is present.
3. **Positive ident** — an `0281…` hardware number followed by a `1037` / `2287`
   / `2537` software number must appear in the 256-byte window at `0x7FD9`.

EDC2 shares this layout but is **never reported under its own name**:
`extract()` always sets the family to `EDC1`.

**Checksums:** no family profile (generic sweep only).

→ [Back to Bosch](index.md)