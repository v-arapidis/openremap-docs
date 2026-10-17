---
title: M4.x
description: Volvo petrol
---

# M4.x

8051-based ECUs (the reset vector is an 8051 `LJMP` table) used almost
exclusively in Volvo vehicles.

| | |
|---|---|
| Era | 1994–2002 |
| File sizes | 64 KB (M4.3) or 128 KB (M4.4) |
| Variants | M4.3 (Volvo 850/960/S70/V70), M4.4 (Volvo S60/S70/V70/S80) |
| Vehicles | Volvo petrol |

## Detection

A size gate (exactly 64 KB or 128 KB), then a DAMOS family token (`/M4.3/`,
`/M4.4/`), with an ident-digit fallback: a run of 20+ digits in the last ~8 KB
whose first ten start with `0261` and next ten with a Bosch SW prefix (`1037`,
`1267`, `2227`, `2537`).

**Checksums:** no family profile.

→ [Back to Bosch](index.md)