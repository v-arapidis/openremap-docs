---
title: health — CLI
description: The openremap health command — every option, the six checks, JSON output and CI gating.
tags: [health, cli, safety]
status: stable
---

# `openremap health`

One-shot calibration health check for a single ECU binary — the "check
engine light" for a ROM file. It runs every analysis layer once and reports
each concern as `ok` / `warn` / `fail` / `skip`.

Exit code `0` = healthy, `1` = at least one check failed — usable as a CI
gate.

New here? Read the [plain-English introduction](index.md) first.

It is the same six-check pass you can call from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc) — the terminal is
simply an easy way to run it.

## Usage

```bash
openremap health <FILE> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary to check (`.bin` / `.ori` / `.hex`). The file must exist. |

## Options

| Option | Description |
|---|---|
| `--json` | Output the report as JSON instead of a table. |
| `--output PATH` | Write the JSON report to a file (JSON only — requires `--json`). |
| `--help` | Show help and exit. |

## Example

```bash
# Human-readable table
openremap health ecu.bin

# JSON report on screen
openremap health ecu.bin --json

# JSON report saved to a file
openremap health ecu.bin --json --output report.json
```

## The checks

The pass is composed of the following checks (reported in the output under
these names):

| Check | What it looks at | Verdict |
|---|---|---|
| `identity` | family / manufacturer / confidence tier | `warn` when unidentified |
| `checksums` | every known family scheme (ME7 main/multipoint/rolling/multirange, MS43, Denso descriptor table, IronFelix profiles) | `fail` when any detected scheme is STALE |
| `axis sanity` | axes of high-score tables (implausible values, FF-fill, diesel caps) | `warn` only — scanner artifacts on healthy files are expected; corruption is caught by map count |
| `map count` | high-score table count vs a corpus-derived envelope per ECU family | `fail` below/above the envelope (wiped calibration / scanner garbage) |
| `erased blocks` | large erased regions embedded in data | `warn` — normal for some layouts (Subaru bank mirrors); verify against a known-good dump otherwise |
| `VINs` | distinct high-confidence VINs in one file | `warn` on duplicates (cloning/merge artifact) |

A file is **healthy** iff no check fails; `warn` levels are reported but
do not block the gate.

## JSON output

With `--json` the report is printed as JSON. The top-level fields the CLI
reads are `healthy` (bool), `file_size`, `family` (or `null`/absent when
unidentified) and `checks` — each check has `name`, `status`, `message`
and `details`. With `--output` or `--json` the `file` field is added with
the path you gave.

```bash
openremap health stock.bin --json --output stock.json
```

The JSON report is exactly the object the [API method](api.md) returns.

## CI gating

```bash
openremap health stock.bin --json --output stock.json
test "$(python -c "import json;print(json.load(open('stock.json'))['healthy'])")" = "True"
```

## Notes

- The per-family map-count envelopes are **corpus-derived** (measured
  2026-08-15 on `tests/data/ECUs`); families without a measured envelope
  skip the check honestly.
- **Denso diesel factory files report `checksums: fail` by design**: one
  descriptor-table entry covers the runtime-patched tail and is stale in
  every factory dump. Verify the other entries when in doubt — see the
  [checksum command docs](../checksum/cli.md).
- Some families (MS43, GS20/SMG2 TCUs) have checksum profiles but **no
  extractor** — their identity check reports `warn` (unidentified) while
  the checksum check still runs.
- `health` never modifies the file — it only reads it.

## See also

- [health — API](api.md) — the same six-check pass from Python and JSON-RPC
- [checksum — CLI](../checksum/cli.md) — what the checksum check verifies, scheme by scheme
- [How it works](../concepts/how-it-works.md) — where `health` sits in the pipeline
