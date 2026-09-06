---
title: routine — CLI
description: The openremap routine command — decoders, offset syntax, flags, output format.
tags: [routine, cli]
status: stable
---

# `openremap routine`

Read a code routine as readable pseudo-code — no Ghidra needed. Decodes the
instruction stream around a file offset and renders each instruction as one
readable line: a **phrasebook decompiler, not full C** — no variable
renaming or loop reconstruction.

New here? Read the [plain-English introduction](index.md) first.

It is the same decode you can run from
[Python code](api.md) or [JSON-RPC](api.md#calling-it-over-json-rpc).

## Usage

```bash
openremap routine <FILE> <OFFSET> [OPTIONS]
```

| Argument | Required | Description |
|---|---|---|
| `FILE` | Yes | ECU binary file (`.bin` / `.ori` / `.hex`). The file must exist. |
| `OFFSET` | Yes | File offset to disassemble at — hex (`0x50000`) or decimal. |

## Options

| Option | Default | Description |
|---|---|---|
| `--arch KEY` | auto | Decoder override: `c166 \| tricore \| sh \| x86 \| m680x \| m68k \| ppc`. Auto-detected from the ECU family when omitted. |
| `--before N` | `8` | Instructions to show before the target. |
| `--after N` | `60` | Instructions to show after the target. |
| `--help` | | Show help and exit. |

## Decoders

The decoder is picked from the identified ECU family: the **Rust C166**
decoder for C166-family ECUs (e.g. Bosch EDC15/EDC16/EDC17 series uses it
through the native extension), and **capstone** for TriCore / SuperH /
x86 / M680X / 68K / PPC.

If the family cannot be identified — or has no registered decoder — the
command explains and asks for `--arch`:

```
  No decoder for family 'UnknownFamily' — pass --arch to force one (supported: c166, tricore, sh, x86, m680x, m68k, ppc).
```

## Output format

Each instruction renders as one line: `offset, mnemonic, operands`. The
instruction nearest the target offset is prefixed `>>` and highlighted.
Example header (the decode listing follows):

```
  my-file.bin  @ 0x50000  (c166)
```

## Examples

```bash
# Decode around an offset, auto-picking the decoder from the family
openremap routine ecu.bin 0x50000

# Force a decoder and widen the window after the target
openremap routine ecu.bin 0x50000 --arch c166 --after 120

# Decimal offset works too
openremap routine ecu.bin 327680
```

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | No decoder for the family / unsupported `--arch`, or a read/analysis error |

## See also

- [routine — API](api.md) — the same decode from Python and JSON-RPC
- [Decoders](../concepts/decoders.md) — how the CPU decoders and the detection cascade work
- [analyze — CLI](../analyze/cli.md) — where code-reference evidence comes from
