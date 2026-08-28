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
| **C166** | Infineon C166/ST10 | **our own, in Rust** | ME7 (+variants), ME9, EDC15, EDC16, MS43, PPD1.x, SID801/803, Simtec56, EMS2000 |
| **TriCore** | Infineon TriCore | capstone (open-source library) | EDC17 / MEDC17 |
| **SuperH** | Renesas SH-2 / SH-2A | capstone (open-source library) | Denso SH7055/SH7058/SH72531, Hitachi SH72546 |

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

**15 of 36 extractors** are served by a decoder today (TriCore EDC17 +
4 SuperH + 10 C166). The C166 decoder is a *focused subset* — instruction
sizes + memory operands, enough for the signal — not a full disassembler.
Ghidra is a **dev-machine oracle only**, never a runtime dependency:
every feature works fully offline with the built-in decoders.

→ [How it works](how-it-works.md) · [Architecture](architecture.md)
