---
title: EDC15
description: The classic 512 KB diesel
---

# EDC15

The workhorse diesel platform of the early 2000s. Four ident formats share the
same family: **A** (TSW header), **B** (C3 fill + `1037xxxxxx` SW), **D**
(alphanumeric SW codes) and **E** (C167 `PP22` bootstrap header).

| | |
|---|---|
| Era | 1997–2004 |
| File sizes | 512 KB, or 1 MB for dual-bank bins |
| Variants | EDC15C2 (Alfa/Fiat/Lancia common-rail), EDC15C3 (Volvo D5), EDC15C5 (VAG 1.9 TDI) |
| Vehicles | VAG, Fiat, Volvo, BMW diesel |

## Detection

Five checks — one exclusion pass, then four positive formats:

1. Reject if any **exclusion signature** is present (EDC16 / EDC17 / ME7 share
   the `1037xxxxxx` SW prefix; Siemens PPD / SIMOS / `5WP` are excluded too).
2. **Format A** — the `TSW` string at `0x8000` inside a bank. Unique to the
   EDC15 toolchain and the strongest anchor.
3. **Format B** — a `0xC3` fill ratio at or above the family threshold *and* a
   `1037xxxxxx` SW string anywhere in the binary.
4. **Format D** — the same C3 fill ratio, plus an `0281…` hardware number and
   an alphanumeric SW code (`EB…HEX`) instead of a `1037…` number. Early
   VP37/VP44 bins.
5. **Format E** — a `PP22..00` C167 bootstrap header in the first 64 KB, plus
   an `0281…` HW number, plus either a `1037…` SW or a structured EDC ident
   block. Covers C167 bins whose C3 ratio sits just below the Format B
   threshold.

There is **no size gate**. Multi-bank images are handled explicitly: a 1 MB
dual-bank bin also carries `TSW` at `0x88000`.

**Checksums:** no family profile (generic sweep only).

→ [Back to Bosch](index.md)