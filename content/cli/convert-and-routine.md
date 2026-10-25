---
title: Convert and read code
description: >-
  Two small commands — normalise a HEX or S-Record file to a flat binary, and read
  the program code around one address.
tags: [cli]
status: stable
---

# Convert and read code

## `convert`

**What it is:** turns a text dump (Intel HEX, Motorola S-Record) into a plain flat
binary. A raw `.bin` passes straight through unchanged.

```bash
openremap convert my_dump.hex --output flat.bin
```

```
  ihex                  4,194,304 bytes
  Saved to /path/to/flat.bin
```

The first column is the format it detected — `ihex`, `srec` or `raw binary`. On a
raw file the same command is a quick way to confirm what you have:

```bash
openremap convert original.bin --output flat.bin
```

```
  raw binary            4,194,304 bytes
  Saved to /path/to/flat.bin
```

Every other command already accepts HEX and S-Record directly, so you only need
this when some other tool insists on a flat `.bin`.

## `routine`

**What it is:** decodes the code around one address and prints one line per
instruction — a way to see what the program does at a spot, without a decompiler.

The two arguments are positional: `routine FILE OFFSET`.

```bash
openremap routine original.bin 0x225A13
```

```
  original.bin  @ 0x225A13  (tricore)

   225A01  mov.aa a0, a0
   225A0D  sh     d5, #0
   225A0F  ld.b   d0, #1
>> 225A13  .byte  0x01, 0x00
   225A15  st.b   [a15]#0, d7
   225A19  nop
   225A2D  .byte  0x00, 0x14
```

(Trimmed.) The `>>` marker is the address you asked for. `.byte` lines are bytes the
decoder could not turn into an instruction — often data sitting between code, which
is normal.

The CPU is detected from the file: `(tricore)` here. Override it with `--arch` if
you know better.

> [!WARNING]
> This is a phrasebook, not a decompiler: it tells you what the instructions are,
> not what the function does. Reading code is a skill; the tool only saves you the
> disassembly step.

### If you get the arguments wrong

```
  Usage: openremap routine [OPTIONS] FILE OFFSET
  ╭─ Error ─────────────────────────────────────────────╮
  │ No such option: --offset                            │
  ╰─────────────────────────────────────────────────────╯
[exit 2]
```

Exit code `2` means *the command was used wrongly* — here, an option that does not
exist. Nothing was read, nothing was written.

## Where to go next

| You want to… | Go to |
|---|---|
| find an address worth reading | [`layout`](look-at-a-file.md#layout) |
| see which tables the code references | [`analyze`](look-at-a-file.md#analyze) |
