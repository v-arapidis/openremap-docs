---
title: M2.x
description: 8051-based Motronic — VW/Audi M2.9, Porsche 964, Opel
---

# M2.x

8051-based ECUs (the reset vector is an 8051 `LJMP` table) between the M1.x and
M3.x eras — VW/Audi M2.9, Porsche 964 (M2.3), Opel M2.7/M2.8/M2.81.

| | |
|---|---|
| Era | 1993–1999 |
| File sizes | 32 KB (Porsche 964 M2.3, Opel M2.7) or 64 KB |
| Vehicles | VW/Audi, Porsche 964, Opel |

## Detection

Three checks, and **no size gate**:

1. Reject if any modern Bosch / ME7 / M1.x / M3.x **exclusion signature** is
   present.
2. Accept on the family marker `"0000000M2.` — the canonical VW/Audi M2.9
   signal.
3. Accept on a Porsche 964 M2.3 **MOTRONIC label** (`M<nr>MOTRONIC…`) when the
   family marker is absent.

**Checksums:** no family profile.

→ [Back to Bosch](index.md)