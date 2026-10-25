---
title: The recipe
description: >-
  The .remap file — a short written list of every change a tuner made, why that
  idea is the heart of OpenRemap, and why it is safe to read, keep and share.
tags: [recipe, overview]
status: stable
---

# The recipe

A **recipe** is a small text file that lists every change a tuner made to a car's
engine file. Its file extension is `.remap`.

That is the whole idea, and it is worth reading why it matters.

> [!NOTE]
> **A recipe is a list, not a copy.** It says *"at this spot, these bytes become
> those bytes"*. On its own it is useless: it can only be applied to the file it
> was made from. That is not a weakness — it is exactly what makes it safe to
> read, keep and hand to someone else.

## What it looks like

Every line is one change. Here is a real instruction from a real recipe, with the
long surrounding bytes shortened:

```json
{
  "offset": 2251283,
  "offset_hex": "225A13",
  "size": 1,
  "ob": "01",
  "mb": "00",
  "ctx": "0000080008730700…",
  "context_after": "0028070102000306…",
  "description": "Byte at 0x225A13: 0x01 -> 0x00",
  "region": "calibration",
  "flags": []
}
```

In plain words: *at address `0x225A13`, one byte changes from `01` to `00`; the
bytes around it are these, so we can find the spot again; this change sits in the
calibration data, not in the program; nothing is worth flagging.*

A whole tune is a list of these — 79 of them in the file above.

## Why this format, and not something else

| If it were… | What you would lose |
|---|---|
| a **photo of a screen** | you cannot re-apply it, check it, or prove what changed |
| a **binary patch blob** | you cannot read it, review it, or see what it does |
| a **replacement file** | it is a whole firmware copy — the size of the file, and someone else's data |
| a **recipe** | nothing: it is small, readable, checkable, and applies only where it belongs |

The five things that follow from being "just a list":

1. **You can read it before you trust it.** Any text editor. No special tool, no
   vendor, no licence.
2. **It proves itself.** A recipe carries a fingerprint of its own contents, so a
   single edited byte makes it fail loudly instead of applying the wrong thing.
3. **It carries its own evidence.** Every change has the surrounding bytes that
   locate it — which is what lets the tool say *"this is not the file you think it
   is"* instead of writing into the wrong car.
4. **It travels.** A few hundred kilobytes at most, compared with several megabytes
   for a firmware file.
5. **It ages.** The format has a version number, and an old recipe is refused with
   a clear message rather than misread.

## The pages in this section

| Page | What it covers |
|---|---|
| [Inside a recipe](anatomy.md) | every part of the file, field by field, in plain words |
| [Why it matters](why.md) | the five promises above, and the one thing it deliberately does not store |
| [Sharing and copyright](sharing.md) | what a recipe is not, what you can hand over, and where the limits are |
| [Format reference](schema.md) | the exact 5.0 fields, for people who read schemas |

## Where recipes come from, and where they go

```
  stock file  ─┐
               ├─→  cook-strict / cook-forced  ─→  recipe (.remap)
  tuned file  ─┘                                        │
                                                        ▼
  another file of the same software  ─────→  tune-strict … tune-any  ─→  patched copy
```

Making one is [`cook-strict`](../cli/cook.md#cook-strict); using one is
[`tune-strict`](../cli/apply.md#tune-strict) and its three looser siblings.
