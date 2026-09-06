---
title: routine
description: Read the code around a file offset as readable one-line pseudo-code — a quick look inside the ECU's program. For beginners first.
tags: [routine, cli, api]
status: stable
---

# routine

Deep inside an ECU file there is the **code** — the program the ECU runs.
`routine` lets you peek at that code without specialised tools: give it a
file and an **offset** (a position inside the file) and it decodes the
instructions around that spot into readable one-line pseudo-code.

It is deliberately *not* a full decompiler — it will not rename variables
or rebuild loops for you. Think of it as a **phrasebook**: it translates
each instruction into one plain line so you can get a feel for what the
code does. The line nearest your offset is marked with `>>`.

## When do I need it?

- **Curiosity / learning.** "What is actually running here?" — flip a few
  offsets and read.
- **Cross-checking with `scan-maps` or `analyze`.** Those tools say a table
  is "referenced by code"; `routine` lets you look at that code.
- **No Ghidra installed** — for quick looks, this is enough.

Which "language" it decodes is chosen automatically from the ECU family
(Rust C166 decoder, or capstone for TriCore / SuperH / x86 / 68k-family).
If the family is unknown you can force a decoder with `--arch`.

## Try it (2 minutes)

```bash
openremap routine my-file.bin 0x50000
```

The output starts with a header naming the file, the offset, and the
decoder used, then lists one instruction per line:

```
  my-file.bin  @ 0x50000  (c166)

  >> 0x00050000   <instruction nearest your offset>
     0x00050002   <next instruction>
     ...
```

(The `>>` line is your target. Instructions before and after it are shown
too, so you can see the surrounding routine.)

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **`@ 0x50000`** | The offset you asked for |
| **(c166)** | Which decoder was used — chosen from the ECU family |
| **`>>`** | The instruction nearest your offset |
| **`0x00050000`** | Each instruction's own position in the file |
| **mnemonic + operands** | What the instruction does, phrasebook style |

Use `--before` / `--after` to widen or narrow the window around the
target, and `--arch` to pick the decoder yourself when auto-detection
cannot (it will tell you if the family has no decoder).

## For developers

The same decode is one method of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [routine — CLI](cli.md) | `openremap routine my-file.bin 0x50000` |
| Python code | [routine — API](api.md) | `api.call("routine", {"path": "my-file.bin", "offset": 327680})` |
| Any language (JSON-RPC) | [routine — API](api.md) | a request with `"method": "routine"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option and how decoders are chosen | [routine — CLI](cli.md) |
| Call `routine` from your own code | [routine — API](api.md) |
| How the code-reference signal works (which tables code reads) | [Decoders](../concepts/decoders.md) |
| Find tables that code references | [`scan-maps`](../scan-maps/index.md) |
