---
title: Decoders
description: What the CPU decoders are and how OpenRemap uses them — the code-reference signal, the CPU-detection cascade, and the decoder tag in analyze.
---

# Decoders

OpenRemap reads ECU **code**, not just data. The **decoders** are the layer
that turns raw flash bytes into a list of instructions — and from those
instructions the tool can tell *which calibration tables the engine's code
actually reads*. That "code reads this table" signal is the strongest
evidence that a discovered table is a genuine calibration map, not just a
nice-looking rectangle of numbers.

## What a decoder is (plain language)

A decoder is a small translator that reads a CPU's machine code and tells
you what each instruction is and where it points. Every ECU family runs on
one of a handful of CPUs, and each CPU has its own instruction set — so
OpenRemap ships one decoder per CPU it supports.

| Decoder | CPU | Who makes it | Families it serves |
|---|---|---|---|
| **C166** | Infineon C166/ST10 | **our own, in Rust** | ME7 & ME7.9.x, ME9, EDC15, M5.x, ME1.5.5, MS43, PPD1.x, SID801/803, EMS2000 |
| **TriCore** | Infineon TriCore | capstone (open-source library) | EDC17/MEDC17/MED17/ME17/MD1 class, EDC16, MED9 |
| **SuperH** | Renesas SH-2 / SH-2A | capstone (open-source library) | Denso SH7055 / SH7058, Hitachi SH72546 |
| **MCS-51** | Intel 8051 line | **our own, in Rust** | M2.x, M4.x, MP9, MONO, M1.8, Simtec56, SIMOS |
| **MCS-96** | Intel 8096 line | **our own, in Rust** | EDC1, EDC3.x |
| **M680X** | Motorola 68HC11 / 6800 | capstone (open-source library) | M1.x / M1.3 / M1.7, M3.x, MP3/MP7, LH-Jetronic |
| **68K** | Motorola 68000 / CPU32 | capstone (open-source library) | M1.55, IAW 4LV |
| **PowerPC** | PowerPC (big-endian) | capstone (open-source library) | MJD 6JF |

The mapping table lives in one place — `core/arch/__init__.py` — and was
expanded by the 0.7.x architecture census: today **31 of the 38 extractor
families carry a verified decoder mapping**. The exceptions (no verified
CPU mapping, so they fall back to the detection cascade below) are GS20,
Multec / Multec S, IAW 1AV / 1AP, and the Denso 68HC16Y5 + diesel
families.

Why do we *write* the C166 decoder instead of using a library? Because
**no open-source disassembler supports C166** — and C166 is the biggest
block of ECU silicon (ME7/MS43/EDC15/EDC16…). So we built a focused Rust
decoder covering the instruction forms the signal needs, and verified it
instruction-by-instruction against Ghidra (the only full C166 tool):
**zero decode disagreements** on the real corpus.

## How we use them

### 1. The code-reference (xref) signal — the core use

`analyze` (always on) and `scan-maps --xrefs` (opt-in) disassemble the
binary's code regions, collect every address the instructions point at,
and check which of those land inside discovered calibration tables. A
table that code actually reads gets a **score bonus + evidence**
("referenced by code at 0x…").

The signal is **presence-only**: a table with no detected reference is
never penalised — most real code reaches tables through registers we
cannot always follow statically, so a missing reference proves nothing.

### 2. The CPU-detection cascade — for unknown families

For families with no declared CPU, the tool **trial-decodes** the binary
with each decoder and keeps the first whose references land in real
tables. That's how unknown families still get the xref signal. Each
trial runs in an isolated process, so a decoder bug can never crash the
tool.

### 3. The decoder tag in `analyze`

The report shows which decoder served the file — and whether the CPU was
*declared* by the family or *detected* by the cascade:

```
code refs: 3,439 reference(s) from 81,447 instructions [C166 · Rust decoder] (base 0x74000, …)
code refs: 138 reference(s) from 11,788 instructions [C166 · Rust decoder] (base 0x0, …)  · cascade-detected
```

The JSON `xrefs` block carries `decoder` ("C166 · Rust decoder") and
`arch_source` (`declared` | `detected`).

### 4. Precision upgrades

- **C166 DPP resolution** — the decoder reads the CPU's page-register
  (DPP) init from boot code and resolves the *exact* flash base — e.g.
  ME7's true base `0x800000` instead of a guessed window.
- **TriCore a0 resolution** — the decoder follows the global base
  register `a0` so far more `lea [a0]` accesses resolve.

## Coverage & honesty

Detection itself rarely needs a decoder — it is size / magic / string
based. Decoders power the *code-reference signal* and the CPU-detection
cascade, and the family→decoder table above (31 of 38 families) is the
result of a per-family census against the real corpus; it is **not** a
full disassembler for every CPU. The C166 and MCS-51/MCS-96 decoders are
focused Rust subsets (instruction sizes + memory operands, enough for the
signal); capstone covers the rest. Ghidra is a **dev-machine oracle only**,
never a runtime dependency: every feature works fully offline with the
built-in decoders.

→ [How it works](how-it-works.md) · [Architecture](architecture.md)
