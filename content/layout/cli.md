---
title: layout — CLI
description: The openremap layout command — flags, region kinds and their signals, JSON output.
tags: [layout, cli]
status: stable
---

# `openremap layout`

Print the flash-layout block map of an ECU binary — where the erased
pages, code, calibration area, and ident blocks start and end.

New here? Read the [plain-English introduction](index.md) first.

It is the same segmentation you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc).

## Usage

```bash
openremap layout <FILE> [--json] [--min-run N]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary to segment (`.bin` / `.ori` / `.hex`). The file must exist. |

## Options

| Option | Default | Description |
|---|---|---|
| `--json` | off | Output as JSON instead of a human-readable table. |
| `--min-run N` | `64` | Minimum printable-ASCII run length for ident-block detection. |

## How the segmentation works

The tool splits the file into sectors and labels each one from the data
itself — **no manufacturer database**. Sector granularity is 64 KB for
bins ≥ 256 KB, 16 KB below; adjacent sectors of the same kind merge into
regions.

| Kind | Meaning | Signal |
|---|---|---|
| `erased` | Empty flash pages — one repeated byte (FF, 00, C3, …) | dominant-byte ratio ≥ 0.95 |
| `calibration` | The tunable area — dense with maps | ≥ 1 table scored ≥ 0.85 in the sector |
| `code` | Program code — busy, no maps | entropy ≥ 6.0 bits/byte, no high-score tables |
| `ident` | Ident/metadata text blocks | exact printable-ASCII runs (SW/HW numbers, VIN) |
| `mixed` | No decisive signal | fallback, confidence 0.3 |

Kinds are **probabilistic labels** with a confidence value — never
verified names. Bootloader vs program code is deliberately not
distinguished (both are `code`).

## Example output

```
  my-file.bin  •  1,048,576 bytes  •  3 region(s)  •  1 ident block(s)

     Start       End        Size          Kind    Fill    Ent   Tbls   Conf
  0x000000  0x080000     524,288        erased    0xC3   0.00      0   0.95
  0x080000  0x0C0000     262,144          code       —   6.75      0   0.70
  0x0C0000  0x100000     262,144   calibration       —   4.93     55   0.68
  0x0CC51B  0x0CC57C          97         ident       —   1.07      0   0.50
```

Columns: `Start`/`End`/`Size` are byte offsets and length; `Kind` is the
label; `Fill` the repeated byte for erased regions (`—` otherwise); `Ent`
the mean entropy in bits/byte; `Tbls` the number of high-confidence tables
in the region; `Conf` the label confidence. Ident blocks are listed as
their own rows.

## JSON output

```bash
openremap layout ecu.bin --json
```

```json
{
  "file": "ecu.bin",
  "file_size": 1048576,
  "regions": [
    { "kind": "erased", "start": 0, "end": 524288, "size": 524288, "confidence": 0.95, "fill_byte": 195, "mean_entropy": 0.0, "tables_high_conf": 0 }
  ],
  "ident_blocks": [
    { "start": 835867, "end": 835964, "size": 97 }
  ]
}
```

The API result (see [layout — API](api.md)) is the same object, with the
`file` field added by the CLI.

## See also

- [layout — API](api.md) — the same segmentation from Python and JSON-RPC
- [scan-maps — CLI](../scan-maps/cli.md) — finding the tables inside regions
- [analyze — CLI](../analyze/cli.md) — layout as one section of the full report
