---
title: analyze — CLI
description: The openremap analyze command — every flag, the section order, the JSON report schema, and the speed budget.
tags: [analyze, cli]
status: stable
---

# `openremap analyze`

Describe a whole ECU binary in one pass: container, identity + confidence,
VIN, flash layout, maps, checksums, and the health verdict.

New here? Read the [plain-English introduction](index.md) first. This page
is the full reference.

It is the same analysis you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc) — the terminal is an
easy way to run it.

## Usage

```bash
openremap analyze <FILE> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary to analyse (`.bin` / `.ori` / `.hex` / `.s19` / `.srec` / `.mot`). The file must exist. |

## Options

| Option | Short | Description |
|---|---|---|
| `--json` | | Output the full report as JSON (the same object the API returns). |
| `--output PATH` | `-o` | Save the report to a file instead of printing to stdout (colour codes stripped in human output). |
| `--fast` | | Skip maps, checksums, and the health verdict (~1–2 s). |
| `--no-maps` | | Skip only the map scan (~6 s saved), keep checksums + health. |
| `--xref-mode v1\|v2` | | Code-reference pipeline: `v1` (default) or `v2` (score-gated confirmation bonus). |
| `--help` | | Show help and exit. |

## Section order (human output)

1. **Container / size / SHA-256** — `raw binary` / `Intel HEX` /
   `Motorola S-Record` (content-sniffed), byte size, hash prefix.
2. **Identity** — manufacturer, family, variant, SW/HW, calibration ID,
   match key, byte order, cell size.
3. **Confidence** — tier, top-3 signal summary, warnings.
4. **Coherence** — identity / checksum / xref agreement, marked
   `✓`/`⚠`/`–`/`✗` (agree green, stale yellow, gap dim, conflict red with
   details below).
5. **VIN candidate** — only when a ≥ 0.6 candidate exists; decoded make /
   country / year labelled *decoded, unverified*.
6. **Flash layout** — segmented regions (kind, offset, size, table count)
   and the first few ident blocks.
7. **Maps** — axis/table counts + top 5 tables by score, plus a **code
   refs** line (the xref signal: how many instructions actually reference
   each table, which CPU decoder was used, and the base address — with a
   `· cascade-detected` suffix when the CPU-detection cascade found the
   arch for an unknown family) or `code refs: skipped (<reason>)`. Tables
   whose data is referenced by code carry a `⟶code` marker.
8. **Checksums** — ME7 verdict, Denso table, swept schemes (or "none").
9. **Health** — the six checks (identity, checksums, axis sanity, map
   count, erased blocks, VINs) with ✓ / ⚠ / ✗ / – marks.

In `--fast` mode a final line reminds you that maps, checksums, and health
were skipped.

## JSON report

`--json` prints the full report — the exact object the
[API method](api.md) returns. Key fields (all values are only present when
the corresponding analysis ran):

```json
{
  "container": "raw binary",
  "file_size": 4194304,
  "sha256": "00f727e8…",
  "identity": { "manufacturer": "Bosch", "ecu_family": "EDC17", "match_key": "…" },
  "confidence": { "score": 45, "tier": "Medium", "signals": [], "warnings": [] },
  "coherence": { "status": "agree", "conflict": false, "checks": [] },
  "vin": null,
  "layout": { "regions": [], "ident_blocks": [] },
  "xrefs": { "status": "ok", "arch": "tricore", "decoder": "TriCore · capstone", "reference_count": 1213 },
  "maps": { "axis_count": 15967, "table_count": 2632, "tables": [] },
  "checksums": { "schemes": [], "me7": null, "denso": null },
  "health": { "checks": [], "healthy": true },
  "fast": false
}
```

Notes on the JSON shape (verified against `AnalyzeReport.to_dict()`):

- `maps.tables` is capped at the 50 highest-scoring tables — the full
  count is in `table_count`. Each table carries an `xref` block when the
  code-reference pass ran.
- `xrefs` is `null` when maps were skipped; when no architecture was found
  it is `{"status": "skipped", "skip_reason": "…"}`.
- `coherence` is `null` in `--fast` / `--no-maps` mode; `checksums` and
  `health` are `null` in `--fast` mode.
- `decoder` is the human-friendly decoder name; `arch_source` is
  `"declared"` (family → architecture table) or `"detected"` (the
  CPU-detection cascade found it).

## Speed budget (4 MB pair)

| Mode | Sections skipped | Wall time |
|---|---|---|
| full | none | ~18 s (maps ~6 s, xrefs ~4 s, checksums + health ~9 s, overlapping) |
| `--no-maps` | maps + xrefs | ~9 s |
| `--fast` | maps + xrefs + checksums + health | ~1 s |

The xref pass (decoding the code regions) is the ~4 s addition on a 4 MB
EDC17; unknown families fall through to the CPU-detection cascade
(fork-isolated trial decode, ≤ ~0.5 s on corpus bins) instead of skipping
outright.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success — even when the health verdict contains warnings |
| 1 | Read / decode / analysis error |

`analyze` is descriptive: it exits `0` even when the file has issues. Use
[`health`](../health/cli.md) when you need a CI-gateable verdict.

## See also

- [analyze — API](api.md) — the same analysis from Python and JSON-RPC
- [identify — CLI](../identify/cli.md) — the identity section on its own
- [health — CLI](../health/cli.md) — the go / no-go verdict
- [Decoders](../concepts/decoders.md) — how the code-reference signal works
