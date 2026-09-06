---
title: convert — CLI
description: The openremap convert command — format sniffing, flags, JSON summary, exit codes.
tags: [convert, cli]
status: stable
---

# `openremap convert`

Normalise an ECU binary image to a flat raw binary: real **Intel HEX** and
**Motorola S-Record** text files are parsed (addresses + per-record
checksums validated) and written as plain bytes; raw dumps pass through
unchanged.

New here? Read the [plain-English introduction](index.md) first.

It is the same normalisation you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc).

## Usage

```bash
openremap convert <INPUT> [-o OUTPUT] [--format auto|ihex|srec|bin] [--json]
```

| Argument | Required | Description |
|---|---|---|
| `INPUT` | Yes | The file to normalise (`.bin` / `.ori` / `.hex` / `.s19` / `.srec` / `.mot`). The file must exist. |

## Options

| Option | Short | Description |
|---|---|---|
| `--output PATH` | `-o` | Write the flat binary here. Default: `<input stem>.bin` next to the input. |
| `--format MODE` | | `auto` (sniff content — default), `ihex`, `srec` (force that format, strict), or `bin` (force raw, skip sniffing). |
| `--json` | | Output the summary as JSON. |
| `--help` | | Show help and exit. |

## How the format is detected

Every binary-reading command (including this one) sniffs the file
**content**, not the extension:

| First bytes | Verdict |
|---|---|
| `:` | Intel HEX → parsed (addresses + checksums validated) |
| `S` + type digit | Motorola S-Record → parsed |
| anything else | raw binary → passed through unchanged |

Why it matters: some `.hex` files (the Subaru corpus) are actually raw
byte dumps named `.hex`. Those never start with `:` / `S`, so their
behaviour is byte-identical. A raw dump that *happens* to start with
`:` / `S` but does not parse is kept raw with a warning; a file that
structurally looks like HEX / S-Record but fails its checksum is a loud
error.

## Examples

```bash
# Normalise a bootloader image
openremap convert boot.hex -o boot.bin

# S-Record with a JSON summary
openremap convert flash.s19 --json

# A raw dump that starts with ':' — force raw so it isn't mis-sniffed
openremap convert weird.bin --format bin -o out.bin

# Strict parse: fail loudly on any corrupt record
openremap convert boot.hex --format ihex -o boot.bin
```

## JSON summary

```json
{
  "input": "boot.hex",
  "format": "ihex",
  "format_name": "Intel HEX",
  "output": "boot.bin",
  "size": 4194304,
  "address_min": 0,
  "address_max": 4194304,
  "segments": 1,
  "warnings": []
}
```

- `address_min` / `address_max` are the absolute record range (the base is
  kept — a file based at `0x80000000` reports that base). The written
  image is base-normalised to start at 0.
- `segments > 1` means the file had gaps, which are filled with `0xFF`
  (erased flash) and reported in `warnings`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Read / decode / write error (bad checksum, no data, empty file, span > 256 MB, invalid `--format`) |
| 2 | Input file missing |

## See also

- [convert — API](api.md) — the same normalisation from Python and JSON-RPC
- [identify — CLI](../identify/cli.md) — what happens when a converted file is read
- [Recipe format](../concepts/recipe-format.md) — `.remap` files (not to be confused with raw images)
