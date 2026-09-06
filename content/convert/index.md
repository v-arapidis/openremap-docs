---
title: convert
description: Turn Intel HEX and S-Record text files into a plain raw binary — the format normaliser. For beginners first.
tags: [convert, cli, api]
status: stable
---

# convert

ECU files come in different "packages". Two common ones — **Intel HEX**
(`.hex`) and **Motorola S-Record** (`.s19`, `.srec`, `.mot`) — are not raw
bytes at all: they are **text files** where every line carries an address
plus a small safety number (a *checksum*). The ECU's actual data is
hidden inside that text.

`convert` unpacks those text formats into a **flat raw binary** — plain
bytes, ready for every other tool. A raw dump that needs no unpacking
passes through unchanged.

Think of it as unzipping a file: the tools inside OpenRemap usually do this
automatically when they read a file (they look at the *content*, not the
file name), but `convert` is for when you want the unpacked bytes in your
hand, saved as a file.

## When do I need it?

- **When a tool gives you HEX or S-Record** and you want the flat `.bin`.
- **When you want to force the interpretation.** Rare, but a raw dump that
  *starts* with text-looking bytes can be told apart with `--format`.
- **When you just want to know** what kind of file you have and how big
  the real data is — `convert` reports it.

## Try it (2 minutes)

```bash
openremap convert boot.hex -o boot.bin
```

```
  Intel HEX      4,194,304 bytes
  Saved to boot.bin
```

(If the input is already raw, it passes through unchanged and the message
says so.)

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **Intel HEX / S-Record / raw** | Which "package" the input was (detected from content) |
| **bytes** | The size of the unpacked data |
| **Saved to …** | Where the flat binary was written |
| **⚠ warnings** | Things to look at — e.g. the file had gaps, which were filled with erased-flash bytes (`0xFF`) |

Every other OpenRemap command (identify, cook, tune, scan-maps…) reads the
content and unpacks automatically — so if a `.hex` file "just works"
everywhere, this is why.

## For developers

The same normalisation is one method of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [convert — CLI](cli.md) | `openremap convert boot.hex -o boot.bin` |
| Python code | [convert — API](api.md) | `api.call("convert", {"path": "boot.hex"})` |
| Any language (JSON-RPC) | [convert — API](api.md) | a request with `"method": "convert"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag, format override and JSON output | [convert — CLI](cli.md) |
| Call `convert` from your own code | [convert — API](api.md) |
| Identify the unpacked file | [`identify`](../identify/index.md) |
| What a checksum is (and how they are verified) | [`checksum`](../checksum/index.md) |
