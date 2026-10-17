---
title: synth
description: Generate an ECU-like file from scratch — no ECU and no dump needed — so you can try the toolkit, build a test, or file a reproducible bug report.
tags: [synth, cli, fixtures]
status: stable
---

# synth

Every other command needs an ECU file. `synth` does not: it **builds one from
scratch**, out of nothing but a few settings, and writes it where you ask.

Think of it as a flight simulator for the toolkit. The file it produces is
ECU-*like* — it has a flash layout, calibration tables with believable axes,
and the smooth map surfaces a real ECU has — but not one byte of it came from a
car. That makes it safe to commit to a repository, hand to a colleague, or
attach to a bug report.

The one thing it deliberately lacks is a manufacturer identity: **`identify`
reports `Unknown` for a generated file**. That is by design, not a bug. There
are no fingerprints to find, because none were copied.

## When do I need it?

- **You want to try the toolkit without owning a dump.** Generate a file, then
  run `identify`, `health`, `scan-maps`, `cook` or `tune` against it.
- **You are writing a test.** The output is deterministic — the same settings
  and the same seed always produce byte-identical output — so you can assert
  against a known ground truth instead of shipping someone's ROM.
- **You are filing a bug report.** "Run this one command and you get exactly
  the file I had" beats any description, and nobody has to share the car's
  firmware.

> [!TIP]
> With `--json` the tool also prints the **ground truth** it planted: where each
> table starts, how big it is, its byte order, and its axis values. That is what
> makes the file usable as a test fixture you can assert against.

## Try it (2 minutes)

```bash
openremap synth --output demo.bin
```

You will see a summary like this:

```
  demo.bin  (synthetic — no OEM data)
  Size              262,144 bytes
  SHA-256           6f1c0b0e4d7a95c3f2a8b1e6d4c7092a3b5e8f1d6c2a4907e3b8d5f0a1c6e294
  Sectors           code 0x0-0x10000, calibration 0x10000-0x20000, erased 0x20000-0x30000, code 0x30000-0x40000
  Planted maps      1
      map0  8x8 u16 little  data @ 0x18000
  identify reports Unknown for generated files — by design (no manufacturer fingerprints).
```

(The SHA-256 and the map offset depend on the settings and the seed.)

Now check that the rest of the toolkit accepts it:

```bash
openremap identify demo.bin     # Family: Unknown — expected
openremap health demo.bin       # a normal health report
openremap scan-maps demo.bin    # finds the planted calibration tables
```

## Understanding the answer

| The summary says… | In plain words |
|---|---|
| **Size** | How many bytes were written |
| **SHA-256** | A fingerprint of the file. Re-run the same command and you get the same one — that is what *deterministic* means here |
| **Sectors** | The flash layout the file was built with — see below |
| **Planted maps** | How many calibration tables went in, where each starts, and its shape and byte order |

The three sector kinds:

| Kind | What it is | Why it exists |
|---|---|---|
| `code` | High-entropy pseudo-code | So the layout segmenter has something that reads like code |
| `calibration` | Non-erased data holding the planted tables | So the map scanner and `layout` find real tables |
| `erased` | Uniformly blank flash | So the segmenter can be checked for labelling it *erased* |

The file is split **evenly** across the sectors, left to right.

## For developers

`synth` is a thin shell over one method of `openremap.api` — the same
generator, from code or over JSON-RPC:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [synth — CLI](cli.md) | `openremap synth --output demo.bin` |
| Python code | [synth — API](api.md) | `api.call("generate_dump", {"size": 262144})` |
| Any language (JSON-RPC) | [synth — API](api.md) | a request with `"method": "generate_dump"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option and the layout rules | [synth — CLI](cli.md) |
| Call the generator from your own code | [synth — API](api.md) |
| Understand the flash layouts it produces | [`layout`](../layout/index.md) |
| Find the tables it planted | [`scan-maps`](../scan-maps/index.md) |
| Add support for a real ECU family | [`contribute`](../contribute/index.md) |
