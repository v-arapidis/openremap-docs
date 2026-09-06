---
title: scan-vins — CLI
description: The openremap scan-vins command — every option, how candidates are scored, and the JSON output schema.
tags: [scan-vins, cli]
status: stable
---

# `openremap scan-vins`

Locate VIN candidates in an ECU binary and score them on structural
evidence — never a bare claim: WMI whitelist, ISO 3779 check digit,
model-year character, numeric tail, ident-block context, mirror consensus.
Every candidate is also **decoded** (vininfo): WMI → manufacturer, region,
country, and model years — labelled *decoded, unverified*.

New here? Read the [plain-English introduction](index.md) first.

The API name for this method is `scan_vins` (underscore) — see
[scan-vins — API](api.md).

## Synopsis

```bash
openremap scan-vins <FILE> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary to scan (`.bin` / `.ori` / `.hex`). The file must exist. |

## Options

| Option | Default | Description |
|---|---|---|
| `--min-confidence FLOAT` | `0.4` | Only show candidates with confidence ≥ this value (0.0–1.0). |
| `--json` | off | Output the full result as JSON instead of a table. |
| `--help` | | Show help and exit. |

## How candidates are scored

Each candidate accumulates evidence — confidence is the weighted sum,
capped at 0.95. It is **never** a boolean claim:

| Evidence | Weight |
|---|---|
| WMI in the known-manufacturer whitelist (`WVW`, `WAU`, `WBA`, …) | +0.30 |
| ISO 3779 position-9 check digit valid | +0.25 |
| Model-year character plausible (position 10) | +0.10 |
| Positions 12–17 all digits | +0.10 |
| Candidate inside an ident block (layout segmenter) | +0.10 |
| Mirror consensus — same VIN appears multiple times | +0.10 |

Ident-block and mirror evidence only corroborate candidates that already
look like a VIN (a known WMI) — serials and calibration IDs are mirrored
too, and without the gate they would cross the lookalike line. Candidates
with fewer than 6 distinct characters (fills like `99999999999999999`)
are rejected up front.

Measured on the real corpus: natural lookalikes score ≤ 0.45; injected
real-shaped VINs in ident blocks score ≥ 0.9.

## Example

```bash
# Find everything (default threshold)
openremap scan-vins stock.bin

# Only strong candidates — for a cloning/merge audit
openremap scan-vins stock.bin --min-confidence 0.6

# Full JSON output
openremap scan-vins stock.bin --json
```

## Example output

```
  OpenRemap — VIN Scan
  stock.bin  •  2,097,152 bytes  •  1 candidate(s) ≥ 0.6

   Offset       VIN                 Conf  Evidence
  ──────────────────────────────────────────────────────────────────
  0x002000  WVWZZZ1KZ7W059972       0.90  wmi, check-digit, year, numeric-tail, ident-block, mirrored-x2  — Volkswagen, Germany, 2007 (decoded, unverified)
```

When no candidate reaches the cut-off, the command prints
`No VIN candidates found at this confidence level.`

## JSON output

```json
{
  "file": "stock.bin",
  "file_size": 2097152,
  "candidates": [
    {
      "offset": 8192,
      "vin": "WVWZZZ1KZ7W059972",
      "confidence": 0.9,
      "evidence": ["wmi", "check-digit", "year", "numeric-tail", "ident-block", "mirrored-x2"],
      "mirror_count": 2,
      "manufacturer": "Volkswagen",
      "region": "Europe",
      "country": "Germany",
      "years": [2007],
      "checksum_valid": false,
      "decoded": true
    }
  ]
}
```

(Fields above follow the real schema; the specific values are from an
example run. The JSON report is exactly the object the
[API method](api.md) returns.)

## Notes

- Real VINs live in ident blocks and are usually mirrored; natural
  lookalikes (part numbers, serials) score ≤ 0.45 on the measured corpus.
- Two distinct high-confidence VINs in one file is the classic sign of a
  cloned or merged dump — see also `openremap health`.
- Every candidate is decoded with **vininfo** (BSD-3): the JSON carries
  `manufacturer`, `region`, `country`, `years`, `checksum_valid`, and
  `decoded`; the table appends a dim *— Make, Country, Year (decoded,
  unverified)* suffix. Decoding is permissive — unknown WMIs yield
  `decoded: false` with no guesswork, and malformed input never errors.
- `scan-vins` never modifies the file — it only reads it.

## See also

- [scan-vins — API](api.md) — the same scan via Python and JSON-RPC
- [health — CLI](../health/cli.md) — the check that warns about duplicate VINs
- [identify — CLI](../identify/cli.md) — VIN candidates surfaced during identification
