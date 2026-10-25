---
title: Simtec 56
description: Opel/Vauxhall 128 KB petrol ECUs
---

# Simtec 56

| | |
|---|---|
| Era | 1995–2000 |
| File sizes | 128 KB (exactly 131,072 bytes) |
| Engines | X18XE, X20XEV |
| Vehicles | Vectra B, Astra F/G, Omega B, Calibra |

## Detection

Four checks:

1. **Size gate** — exactly 131,072 bytes (128 KB).
2. **Exclusion** — reject if any Bosch / Delphi / Marelli signature is found.
3. **Positive** — the Siemens `5WK9` part prefix must be present.
4. **Positive** — an RS/RT ident record prefix (`R[ST]` plus an 8-digit GM
   part number) must be present.

**Checksums:** no family profile (generic sweep only).

→ [Back to Siemens](index.md)