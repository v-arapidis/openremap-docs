---
title: Decoders
description: >-
  The CPU decoders behind the code-reference signal — which CPUs are decoded in
  Rust, which through capstone, how the cascade picks one, and the honest limits.
tags: [architecture, internals, decoder]
status: stable
---

# Decoders

A dump is not only tables. It is also a program, and knowing which CPU executes
that program is what lets OpenRemap cross-reference code against data: find the
instructions that load a map's address, verify that a candidate table is really
used, and read a routine as pseudo-code.

No manufacturer documentation is involved. The CPU is inferred from the binary
itself, and every mapping in the table below was established from reset-vector
headers and disassembly evidence.

## Which decoder handles which CPU

| CPU | Implementation | ECU families |
|---|---|---|
| **C166 / ST10** | Rust (`_rs/src/arch/c166.rs`) | ME7, ME9, EDC15, MS43, PPD, SID801/803, EMS2000, M5.x, ME1.5.5 |
| **8051 (MCS-51)** | Rust (`_rs/src/arch/mcs51.rs`) | M1.8, M2.x, MP9, M4.x, Mono-Motronic, SIMOS, Simtec 56 |
| **MCS-96 (8096)** | Rust (`_rs/src/arch/mcs96.rs`) | EDC1, EDC3 |
| **TriCore** | capstone | EDC16, EDC17, MED9, MED17 |
| **SuperH** | capstone | SH7055, SH7058, SH72546 |
| **M680X (68HC11 / 6800)** | capstone | M1.3, M1.7, M3.x, MP3.x, MP7.2, LH-Jetronic |
| **68K (68000 / CPU32)** | capstone | M1.5.5, M1.55, IAW 4LV |
| **PowerPC** | capstone | MJD 6JF |
| **x86** | capstone | generic code (bootloaders) — no family claims it |

Three decoders are written from scratch in Rust because no library covers those
CPUs. Each was verified against an independent oracle rather than against
itself: C166 against Ghidra's SLEIGH specification, 8051 against the `at51`
disassembler (100 % agreement on roughly 312 000 real instruction boundaries), and
MCS-96 against MAME's opcode tables plus Ghidra. That work is credited in
[third-party credits](../project/third-party.md).

The remaining CPUs go through **capstone**, the mature disassembly library —
`capstone>=5.0.9` is a runtime dependency, not a build one.

## The detection cascade

`core/arch/detect.py` answers "which CPU is this?" by *trying* candidates, not by
scoring their absence:

```
_CASCADE_CANDIDATES  →  for each candidate:
                          decode a sample of code at the family's load base
                          accept if the instruction stream is coherent
                       →  report the first accepted candidate + its evidence
```

capstone candidates are tried first because they are cheap to rule out; the
Rust decoders are invoked for the families they own. A candidate that `accepts`
yields an `XrefReport` — the number of plausible instructions, the references
found, and the load base used. A candidate can be skipped with a reason, and the
reason is kept, so "we could not decode this" is distinguishable from "no family
claims this CPU".

**The load base** is the missing half of most disassembly attempts: a binary is
raw bytes with no address, but a decoder needs to know where those bytes are
assumed to live in the CPU's address space. OpenRemap derives it from the
references the code makes, then decodes with it. On a 4 MB EDC17 the base comes
out as `0x80000000` with 2.4 MB of code — enough to produce 172 code references
from 498 263 instructions.

## Code references (xrefs)

| Module | Role |
|---|---|
| `core/services/maps/xrefs.py` | the original pass: find instructions that reference an address |
| `core/services/maps/xrefs_v2.py` | `analyze --xref-mode v2` — the current signal |
| `_rs/src/maps/map_hunter.rs` | the native map scan that consumes the signal |

A code reference is **evidence, never a name**. It says "the program loads from
this address", which raises the plausibility of a candidate table and helps locate
the calibration region — it does not say the table is a torque limiter or anything
else. That distinction is why `analyze` prints the reference count and the decoder
tag rather than a label:

```
  code refs: 172 reference(s) from 498,263 instructions [TriCore · capstone] (base 0x80000000, 2,424,832 B code)
```

## Pseudo-code — the `routine` command

`core/arch/pseudocode.py` renders the instruction stream around a file offset as
one line per instruction. It is a phrasebook, not a decompiler: it will tell you
what the code does at an address in a form you can read, and it will not produce
C. The decoder for the pseudo-code is chosen the same way — from the family, with
`--arch` as an override.

## Honest limits

- **Motorola 68HC16 (CPU16)** — used by the 16-bit Denso Subaru units — has no
  capstone support, so those binaries are identified but not disassembled.
- **Denso EE20** is believed to be SuperH per community documentation, but there
  is no corpus binary to verify against, so the claim stays unverified.
- A scrambled or encrypted calibration region still identifies (the boot sector is
  not scrambled) but reference analysis inside it finds nothing — the extractor
  returns `null` for the fields that live there rather than guessing.
