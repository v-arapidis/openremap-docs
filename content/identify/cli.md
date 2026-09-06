---
title: identify — CLI
description: The openremap identify command — every flag, full sample outputs (table, JSON, warnings, VIN), and what each field and confidence signal means.
tags: [identify, cli]
status: stable
---

# `openremap identify`

Run `identify` from the terminal to read an ECU file and print everything
that can be found in it: who made the ECU, which family it is, the software
version, and how sure OpenRemap is about the answer.

New here? Read the [plain-English introduction](index.md) first — this page
is the full reference for people who are comfortable with the terminal.

It is the same `identify` action you can call from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc) — the terminal is
simply an easy way to run it.

## Usage

```bash
openremap identify <FILE> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary to read — `.bin`, `.ori`, or `.hex` (also `.s19`/`.srec`/`.mot`). The file must exist. |

## Options

| Option | Short | Description |
|---|---|---|
| `--json` | | Output the result as JSON instead of a human-readable table. |
| `--output PATH` | `-o` | Save the result to a file instead of printing to the screen. |
| `--help` | | Show help and exit. |

Any other extension prints a ⚠ warning but **proceeds anyway** — it does not
exit with an error.

## Examples

```bash
# Print a human-readable table
openremap identify ecu.bin

# Print JSON to the screen (same result the API returns)
openremap identify ecu.bin --json

# Save the result as a JSON file
openremap identify ecu.bin --json --output result.json

# Save the table output to a text file
openremap identify ecu.bin --output result.txt
```

## Example output

> The samples below are trimmed to the fields that matter most. The real
> table also prints **Container**, **Byte Order** and **Cell Size** rows when
> the extractor knows them — see the field table under
> [What each field tells you](#what-each-field-tells-you) for the full set.

### Table (default)

```
  ecu.bin
  Bosch · EDC17

  Manufacturer      Bosch
  ECU Family        EDC17
  ECU Variant       EDC17C66
  Software Version  1037541778
  Hardware Number   0261209352
  Calibration ID    unknown
  Match Key         EDC17C66::1037541778
  File Size         2,097,152 bytes
  SHA-256           3dc19aa03f3293bac4d27f28a22a073c...

  ── Confidence ─────────────────────────────────────────────────────────────
  Tier   HIGH
  Signal  +  canonical SW version (1037-prefixed)
  Signal  +  hardware number present (0261209352)
  Signal  +  ECU variant identified (EDC17C66)
```

### With warnings (wiped ident block)

```
  1.bin
  Bosch · EDC17

  Manufacturer      Bosch
  ECU Family        EDC17
  ECU Variant       EDC17C60
  Software Version  unknown
  Hardware Number   unknown
  Calibration ID    08001508446612B
  Match Key         EDC17C60::08001508446612B
  File Size         4,194,304 bytes
  SHA-256           ...

  ── Confidence ─────────────────────────────────────────────────────────────
  Tier   SUSPICIOUS
  Signal  -  SW ident absent — no match key produced
  Signal  +  ECU variant identified (EDC17C60)
  Signal  +  calibration ID present (080015084466)
  Signal  -  generic numbered filename
  ⚠  IDENT BLOCK MISSING
  ⚠  GENERIC FILENAME
```

### Unrecognised ECU

If no extractor matches the binary, every field other than `file_size` and
`sha256` shows as `unknown`. The ECU family is not yet supported — see
[CONTRIBUTING](../../CONTRIBUTING.md) for how to add one.

```
  mystery.bin
  Unknown ECU — no extractor matched this binary

  Manufacturer      unknown
  ECU Family        unknown
  ...
  Match Key         unknown
  File Size         524,288 bytes
  SHA-256           3f9a21c7d84b...

  ── Confidence ─────────────────────────────────────────────────────────────
  Tier   UNKNOWN
```

### JSON (`--json`)

`--json` prints the exact dict the engine produces — the same shape a
[Python API](api.md) call returns. Keys shown here are an excerpt; the full
result also carries `container`, `ecu_endian` and `ecu_cell_bytes` (each
`null` when unknown) plus `vin`.

```json
{
  "manufacturer": "Bosch",
  "ecu_family": "EDC17",
  "ecu_variant": "EDC17C66",
  "software_version": "1037541778",
  "hardware_number": "0261209352",
  "calibration_id": null,
  "match_key": "EDC17C66::1037541778",
  "file_size": 2097152,
  "sha256": "3dc19aa03f3293bac4d27f28a22a073c...",
  "confidence": {
    "score": 75,
    "tier": "High",
    "signals": [
      { "delta": 40, "label": "canonical SW version (1037-prefixed)" },
      { "delta": 25, "label": "hardware number present (0261209352)" },
      { "delta": 10, "label": "ECU variant identified (EDC17C66)" }
    ],
    "warnings": []
  },
  "vin": {
    "candidate": "WVWZZZ1KZ7W059972",
    "confidence": 0.6,
    "manufacturer": "Volkswagen",
    "region": "Europe",
    "country": "Germany",
    "years": [2007],
    "checksum_valid": false,
    "decoded": true
  }
}
```

### VIN candidate

When the binary contains a VIN candidate scoring **≥ 0.6** (measured on the
real corpus: 2 of 1,871 files — real dealer-flashed VINs; the 0.2–0.45
lookalike noise stays below the floor), `identify` reports it as a separate,
clearly-labelled section and a `vin` JSON field. Vehicle identity is
orthogonal to ECU identity and **never** part of the match key. The
manufacturer comes from vininfo's public database — shown as *decoded,
unverified*. `vin` is `null` when no candidate reaches the floor. The ISO
3779 check digit is the scanner's own computation.

---

## What each field tells you

| Field | What it tells you |
|---|---|
| **Container** | The image format the file was decoded from (raw, Intel HEX, S-Record, …) |
| **Manufacturer** | Who made the ECU hardware (Bosch, Siemens, Delphi, …) |
| **ECU Family** | The ECU line (EDC17, ME7, SID206, …) |
| **ECU Variant** | The specific hardware variant within the family (EDC17C66, …) |
| **Software Version** | The calibration version string — the primary part of the match key |
| **Hardware Number** | The physical hardware part number, if readable from the binary |
| **Calibration ID** | A secondary calibration identifier, present on some families |
| **Match Key** | The compound identifier used to match recipes to ECUs — must match between the binary and any recipe you intend to apply |
| **Byte Order / Cell Size** | Architecture hints from the extractor (e.g. `big-endian`, `16-bit`) |
| **File Size** | Total size in bytes — a quick sanity check |
| **SHA-256** | Cryptographic hash of the file — use this to confirm a file has not changed |

## The confidence section

| Tier | Meaning |
|---|---|
| **HIGH** | All key identifiers present and consistent — strong identification |
| **MEDIUM** | Most identifiers present, minor gaps |
| **LOW** | Some identifiers missing or a mild filename signal — usable, but inspect manually |
| **SUSPICIOUS** | Significant identification gaps or filename red flags — treat with caution |
| **UNKNOWN** | No extractor matched the binary — family not supported |

Each `Signal` line shows what contributed to the tier. A `+` prefix means the
signal increased confidence; a `-` prefix means it reduced it. Warnings
(prefixed with `⚠`) flag specific red flags — for example, when a software
version is absent for a family that normally stores one.

## What to look for

### Good result

All of the following should be filled in for a fully supported, original
binary:

- `Manufacturer` is a known name
- `ECU Family` is populated
- `Match Key` is populated
- `Confidence` tier is **HIGH** or **MEDIUM**

### Needs attention

- **`Software Version` is `unknown` but `Match Key` is populated** — the ECU
  architecture uses a different field (e.g. calibration ID) as the version
  component. This is by design for some families (e.g. LH-Jetronic). The
  binary is still usable.
- **`Match Key` is `unknown`** — the extractor matched the file but could not
  build a version identifier. You can still cook a recipe from this binary,
  but applying it to other ECUs will not be possible without a match key.
- **Confidence is `SUSPICIOUS` with `⚠ IDENT BLOCK MISSING`** — the software
  version field is absent for a family that normally stores it. This is a
  strong signal of a wiped or tampered ident block.
- **Confidence is `SUSPICIOUS` with `⚠ TUNING KEYWORDS IN FILENAME`** — the
  filename suggests this is a modified file. Inspect the binary before using
  it as a base for a recipe.
- **Everything is `unknown`** — the ECU family is not yet supported. See
  [CONTRIBUTING](../../CONTRIBUTING.md).

## Notes

- `openremap identify` is completely read-only — it never modifies the file.
- Accepted extensions: `.bin`, `.ori`, `.hex`, `.s19`, `.srec`, `.mot`.
  Anything else prints a ⚠ warning and proceeds anyway.
- The `--output` flag strips terminal colour codes automatically when writing
  to a file, so the saved text is clean and readable in any editor.
- The confidence `score` in the JSON output is a raw numeric value for
  programmatic use; the `tier` field is the human-readable label.
- Exit codes: `0` on success; `1` if identification fails or the output file
  cannot be written.

## See also

- [identify — API](api.md) — the same method via Python and JSON-RPC
- [CLI, API & RPC](../getting-started/interfaces.md) — how the surfaces relate
- [Confidence scoring](../concepts/confidence.md) — how tiers, signals, and warnings work
- [Supported families](../manufacturers/bosch/index.md) — Bosch family reference
