---
title: Multec
description: Opel/Vauxhall 1.7 DTI diesel
---

# Multec (diesel)

| | |
|---|---|
| Era | 1998–2006 |
| File sizes | 208 KB (212,992 bytes) or 256 KB (262,144 bytes) |
| Engines | 1.7 DTI/TD (Y17DIT, Y17DT) |
| CPU | Motorola 68k CPU32 |
| Vehicles | Opel/Vauxhall diesel |

## Detection

Four phases:

1. **Size gate** — exactly 212,992 bytes (208 KB) or 262,144 bytes (256 KB).
2. **Exclusion check** — reject if another manufacturer's signature is found.
3. **Positive header** — either six ASCII digits at offset 0 (Variant A), or
   byte `0x11` followed by `DEL` (Variant B). Note that `DEL` is a Variant B
   marker only, not a universal Multec header.
4. **Ident confirmation** — `{8 digits}{space}{2 alpha}{4 alpha}{null}` must
   appear somewhere in the last 40% of the file.

**Checksums:** no family profile (generic sweep only).

→ [Back to Delphi](index.md)