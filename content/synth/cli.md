---
title: synth — CLI
description: The openremap synth command — every flag, the sector layout kinds, the deterministic seed, and the JSON ground truth.
tags: [synth, cli, fixtures]
status: stable
---

# `openremap synth`

Generate a synthetic ECU-like binary from scratch. No ECU dump is read and
none is needed.

New here? Read the [plain-English introduction](index.md) first.

The same generator is available from [Python code](api.md) and
[JSON-RPC](api.md#calling-it-over-json-rpc).

## Usage

```bash
openremap synth --output FILE [--size N] [--maps N] [--seed N]
                [--cell-width {1,2}] [--byte-order {little,big}]
                [--layout KINDS] [--json]
```

`--output` is the only required option — `synth` has no positional argument,
because there is no input file to name.

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `--output FILE` | `-o` | — (**required**) | Where to write the generated binary. Parent directories are created. |
| `--size N` | | `262144` (256 KB) | Total size in bytes. Must be at least `4096`. Real ECUs run from 32 KB to 4 MB. |
| `--maps N` | | `1` | How many calibration tables to plant. Shapes cycle through a fixed palette so cases stay reproducible. |
| `--seed N` | | `7` | Seeds the background noise. Same options + same seed = byte-identical file, always. |
| `--cell-width N` | | `2` | Cell width in bytes: `2` (16-bit cells) or `1` (8-bit). |
| `--byte-order B` | | `little` | Byte order of axes and cells: `little` or `big`. |
| `--layout KINDS` | | `code,calibration,erased,code` | Comma-separated sector kinds, left to right. See below. |
| `--json` | | off | Print the planted ground truth as JSON. **The binary is still written.** |

## Sector layout

The file is split **evenly** across the sectors, left to right. Three kinds are
allowed:

| Kind | What goes in it |
|---|---|
| `code` | High-entropy pseudo-code — something for the layout segmenter to read as code |
| `calibration` | Non-erased background with the planted tables written into it |
| `erased` | Uniformly blank flash (zero fill) |

`--layout` must be a non-empty list of those three names. Two rules follow from
what the generator can do:

- asking for `--maps` above `0` with a layout that has **no** `calibration`
  sector is an error — there is nowhere to put the tables;
- a `calibration` sector too small for the requested maps is an error too.

Each planted table is written in the layout real WinOLS/DAMOS tables use:

```
[ X axis (cols × 2 B) | Y axis (rows × 2 B) | cells (cols × rows × cell_width B) ]
```

Axes are strictly increasing `u16` values (length 4–32, step 1–10000) and the
cells form a smooth surface — so the map scanner genuinely finds them rather
than being told where they are.

## Examples

The default 256 KB file with one table:

```bash
openremap synth --output demo.bin
```

A 1 MB file with eight tables and a fixed seed, so it can be reproduced later:

```bash
openremap synth --output big.bin --size 1048576 --maps 8 --seed 42
```

8-bit cells, big-endian — to exercise the other decode path:

```bash
openremap synth --output u8be.bin --cell-width 1 --byte-order big
```

A layout with no erased sector at all:

```bash
openremap synth --output code-only.bin --layout code,calibration
```

Print the ground truth as JSON while still writing the file:

```bash
openremap synth --output fixture.bin --json
```

```json
{
  "sha256": "6f1c0b0e4d7a95c3f2a8b1e6d4c7092a3b5e8f1d6c2a4907e3b8d5f0a1c6e294",
  "size": 262144,
  "sectors": [
    { "kind": "code", "start": 0, "end": 65536 },
    { "kind": "calibration", "start": 65536, "end": 131072 },
    { "kind": "erased", "start": 131072, "end": 196608 },
    { "kind": "code", "start": 196608, "end": 262144 }
  ],
  "maps": [
    {
      "map_id": 0, "offset": 98304, "end": 98496,
      "cols": 8, "rows": 8, "cell_width": 2, "byte_order": "little",
      "x_axis_offset": 98304, "y_axis_offset": 98320,
      "x_axis": [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      "y_axis": [10, 20, 30, 40, 50, 60, 70, 80]
    }
  ],
  "params": {
    "size": 262144, "maps": 1, "seed": 7,
    "layout": ["code", "calibration", "erased", "code"],
    "cell_width": 2, "byte_order": "little"
  },
  "path": "fixture.bin"
}
```

The JSON carries **everything except the bytes** — the file is on disk. `params`
echoes back exactly what was used, so a failure can be reproduced with the same
command.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | The file was written |
| `1` | Bad parameters (size below 4096, `--maps` with no calibration sector, tables that do not fit) or the file could not be written |
| `2` | Usage error — an unknown option or a missing `--output` |

## See also

- [synth — API](api.md) — the same generator from Python and JSON-RPC
- [`layout` — CLI](../layout/cli.md) — checks that the sector kinds read back correctly
- [`scan-maps` — CLI](../scan-maps/cli.md) — finds the tables that were planted
- [synth — introduction](index.md) — what it is for
