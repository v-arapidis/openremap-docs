---
title: LH-Jetronic
description: The oldest family in the registry
---

# LH-Jetronic

Bosch fuel injection system, ~1982–1995 — the oldest family supported.

| | |
|---|---|
| Era | 1982–1995 |
| File sizes | 8–64 KB (typical — there is no size gate) |
| Vehicles | Volvo, Porsche 928 S4, BMW E34, Mercedes W124/W126, Saab 900/9000 |

## Detection

Three checks, and **no size gate**:

1. Reject if any **exclusion signature** is present in the first 512 KB.
2. Accept on a strong positive signature (`LH-JET`, `LH24x`, `LH22x`).
3. Accept on the Format A anchor `\xd5\x28` in the last 1 KB, provided the file
   starts with a known LH header byte (`\x01\x60`, `\x01\x40` or `\x00\x60`).

No 1037-style software version — the match key falls back to the calibration
ID. **Checksums:** no family profile.

→ [Back to Bosch](index.md)