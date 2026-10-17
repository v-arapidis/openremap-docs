---
title: M3.x / MP3.x / MP7.x
description: BMW and PSA petrol
---

# M3.x / MP3.x / MP7.x

BMW DME 403/413-era ECUs plus the PSA/Citroën MP3.2/MP3.x-PSA/MP7.2
variants.

| | |
|---|---|
| Era | 1989–1999 |
| File sizes | 32–256 KB |
| Variants | M3.1 (DME 403), M3.3 (DME 413), MP3.2 (Citroën ZX 2.0 16V), MP7.2 |
| Vehicles | BMW E30/E36, PSA/Citroën |

## Detection

Two checks, and **no size gate**: reject on any modern Bosch / ME7 / Siemens
exclusion signature, then accept if an M3.x family marker appears in the first
512 KB.

**Checksums:** the IronFelix **M3.x-5.x** profile verifies M3.8-class files. See
[Checksums command docs](../../checksum/cli.md).

→ [Back to Bosch](index.md)